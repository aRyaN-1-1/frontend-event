import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Coach {
  id: string;
  name: string;
  about: string;
  areas_of_expertise: string[];
  certifications: string[];
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export default function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const { data, error } = await supabase
          .from('coaches')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setCoaches(data || []);
      } catch (error) {
        console.error('Error fetching coaches:', error);
        toast({
          title: "Error",
          description: "Failed to load coaches. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, [toast]);

  const handleDeleteCoach = async (coachId: string, coachName: string) => {
    try {
      const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', coachId);

      if (error) {
        throw error;
      }

      setCoaches(coaches.filter(coach => coach.id !== coachId));
      toast({
        title: "Coach deleted",
        description: `${coachName} has been successfully removed.`,
      });
    } catch (error) {
      console.error('Error deleting coach:', error);
      toast({
        title: "Error",
        description: "Failed to delete coach. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading coaches...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Meet Our Coaches
              </h1>
              <p className="text-muted-foreground">
                Discover experienced professionals ready to help you achieve your goals.
              </p>
            </div>
            {isAdmin && (
              <Link to="/add-coach">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Coach
                </Button>
              </Link>
            )}
          </div>
        </div>

        {coaches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No coaches found</p>
              <p>Check back later for more coaches.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <Card key={coach.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={coach.profile_image_url || undefined} alt={coach.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {coach.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{coach.name}</h3>
                      </div>
                    </div>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Coach</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {coach.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteCoach(coach.id, coach.name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {coach.about}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Areas of Expertise</h4>
                      <div className="flex flex-wrap gap-1">
                        {coach.areas_of_expertise.map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-1">
                        {coach.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}