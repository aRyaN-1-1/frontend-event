import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, Calendar, Euro, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';

interface EventData {
  id: string;
  name: string;
  short_description: string;
  description: string;
  image_url?: string;
  location: string;
  event_type: string;
  available_slots: number;
  price_per_person: number;
  event_date: string;
  sold_out: boolean;
  coaches?: {
    id: string;
    name: string;
    about: string;
    profile_image_url?: string;
  };
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
      if (user) {
        checkBookingStatus();
      }
    }
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          coaches (
            id,
            name,
            about,
            profile_image_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkBookingStatus = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', id)
        .eq('status', 'active')
        .single();

      setIsBooked(!!data);
    } catch (error) {
      // Not booked or error - assume not booked
      setIsBooked(false);
    }
  };

  const handleBookEvent = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsBooking(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            event_id: id,
          }
        ]);

      if (error) throw error;

      setIsBooked(true);
      toast({
        title: "Success",
        description: "Event booked successfully!",
      });
    } catch (error: any) {
      console.error('Error booking event:', error);
      toast({
        title: "Error",
        description: error.message === 'duplicate key value violates unique constraint "bookings_user_id_event_id_key"' 
          ? "You have already booked this event" 
          : "Failed to book event",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const toggleSoldOut = async () => {
    if (!event || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({ sold_out: !event.sold_out })
        .eq('id', event.id);

      if (error) throw error;

      setEvent({ ...event, sold_out: !event.sold_out });
      toast({
        title: "Success",
        description: `Event marked as ${!event.sold_out ? 'sold out' : 'available'}`,
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
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

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event not found</h1>
            <Button onClick={() => navigate('/')}>Go back to events</Button>
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
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video relative overflow-hidden rounded-lg mb-6">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {event.event_type}
                </Badge>
              </div>
              {event.sold_out && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    SOLD OUT
                  </Badge>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{event.name}</h1>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About This Event</TabsTrigger>
                <TabsTrigger value="details">Event Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-muted-foreground">{format(new Date(event.event_date), 'PPP')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Available Slots</p>
                        <p className="text-muted-foreground">{event.available_slots} slots remaining</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Euro className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Price per Person</p>
                        <p className="text-2xl font-bold text-primary">€{event.price_per_person}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {event.coaches && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Meet Your Coach</h3>
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-4 rounded-lg transition-colors"
                    onClick={() => navigate(`/coaches/${event.coaches?.id}`)}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={event.coaches.profile_image_url} />
                      <AvatarFallback>
                        {event.coaches.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{event.coaches.name}</p>
                      <p className="text-muted-foreground text-sm">{event.coaches.about.substring(0, 100)}...</p>
                      <p className="text-primary text-sm font-medium">Click to view full profile</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-primary">
                    €{event.price_per_person}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per person
                  </div>
                  
                  {event.sold_out ? (
                    <Button disabled className="w-full bg-destructive text-destructive-foreground">
                      SOLD OUT
                    </Button>
                  ) : isBooked ? (
                    <Button disabled className="w-full">
                      Already Booked
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleBookEvent}
                      disabled={isBooking}
                      className="w-full"
                    >
                      {isBooking ? 'Booking...' : 'Book Event'}
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <div className="space-y-2 pt-4 border-t">
                      <Button
                        onClick={toggleSoldOut}
                        variant={event.sold_out ? "default" : "destructive"}
                        size="sm"
                        className="w-full"
                      >
                        Mark as {event.sold_out ? 'Available' : 'Sold Out'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event Type:</span>
                    <span className="font-medium">{event.event_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slots Available:</span>
                    <span className="font-medium">{event.available_slots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}