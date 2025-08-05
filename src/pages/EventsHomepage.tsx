import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import FilterSidebar, { EventFilters } from '@/components/FilterSidebar';
import EventCard, { Event } from '@/components/EventCard';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function EventsHomepage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFiltersChange = useCallback((filters: EventFilters) => {
    let filtered = events;

    // Filter by search
    if (filters.search.trim()) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.short_description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by event types
    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(event =>
        filters.eventTypes.includes(event.event_type)
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location === filters.location
      );
    }

    // Filter by price range
    filtered = filtered.filter(event =>
      event.price_per_person >= filters.priceRange[0] &&
      event.price_per_person <= filters.priceRange[1]
    );

    // Filter by date
    if (filters.date) {
      const filterDate = filters.date.toISOString().split('T')[0];
      filtered = filtered.filter(event =>
        event.event_date === filterDate
      );
    }

    setFilteredEvents(filtered);
  }, [events]);

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Event deleted successfully."
      });

      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
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
            <span>Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <FilterSidebar onFiltersChange={handleFiltersChange} />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Discover Amazing Events
              </h1>
              <p className="text-muted-foreground">
                Find events that inspire and educate. Showing {filteredEvents.length} of {events.length} events.
              </p>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No events found</p>
                  <p>Try adjusting your filters to see more events.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showDeleteButton={isAdmin}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}