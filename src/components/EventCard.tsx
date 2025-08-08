import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, Euro } from 'lucide-react';
import { format } from 'date-fns';
import AnimatedCard from './AnimatedCard';

export interface Event {
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
  sold_out?: boolean;
}

interface EventCardProps {
  event: Event;
  showDeleteButton?: boolean;
  onDelete?: (id: string) => void;
  showSoldOutToggle?: boolean;
  onToggleSoldOut?: (id: string) => void;
}

export default function EventCard({ event, showDeleteButton = false, onDelete, showSoldOutToggle = false, onToggleSoldOut }: EventCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event.id);
    }
  };

  const handleSoldOutToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSoldOut) {
      onToggleSoldOut(event.id);
    }
  };

  return (
    <AnimatedCard onClick={handleCardClick}>
      <Card 
        className="cursor-pointer group border shadow-sm hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-primary-50/30 rounded-xl"
      >
      <div className="aspect-video relative overflow-hidden rounded-t-xl">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3">
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
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-primary group-hover:text-primary/80 transition-colors">
            {event.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {event.short_description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(event.event_date), 'PPP')}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event.available_slots} slots available</span>
          </div>
          
          <div className="flex items-center gap-1 font-semibold text-primary">
            <Euro className="h-4 w-4" />
            <span>{event.price_per_person}</span>
          </div>
        </div>

        {(showDeleteButton || showSoldOutToggle) && (
          <div className="space-y-2 mt-3">
            {showSoldOutToggle && (
              <Button
                onClick={handleSoldOutToggle}
                variant={event.sold_out ? "default" : "destructive"}
                size="sm"
                className="w-full"
              >
                Mark as {event.sold_out ? 'Available' : 'Sold Out'}
              </Button>
            )}
            {showDeleteButton && (
              <Button
                onClick={handleDeleteClick}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Delete Event
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </AnimatedCard>
  );
}