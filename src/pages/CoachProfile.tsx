import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Award, Star } from 'lucide-react';
import Header from '@/components/Header';

interface CoachData {
  id: string;
  name: string;
  about: string;
  profile_image_url?: string;
  areas_of_expertise: string[];
  certifications: string[];
}

export default function CoachProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCoach();
    }
  }, [id]);

  const fetchCoach = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCoach(data);
    } catch (error) {
      console.error('Error fetching coach:', error);
      toast({
        title: "Error",
        description: "Failed to load coach profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Coach not found</h1>
            <Button onClick={() => navigate('/coaches')}>Go back to coaches</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/coaches')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coaches
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={coach.profile_image_url} />
                  <AvatarFallback className="text-2xl">
                    {coach.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold mb-2">{coach.name}</h1>
                <p className="text-muted-foreground">Professional Coach</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  About {coach.name.split(' ')[0]}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {coach.about}
                </p>
              </CardContent>
            </Card>

            {/* Areas of Expertise */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Areas of Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {coach.areas_of_expertise.length > 0 ? (
                    coach.areas_of_expertise.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No areas of expertise listed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certifications
                </h2>
                <div className="space-y-2">
                  {coach.certifications.length > 0 ? (
                    coach.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Award className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No certifications listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}