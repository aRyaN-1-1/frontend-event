import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, Euro } from 'lucide-react';
import { format } from 'date-fns';

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
}

interface EventCardProps {
  event: Event;
  showDeleteButton?: boolean;
  onDelete?: (id: string) => void;
}

export default function EventCard({ event, showDeleteButton = false, onDelete }: EventCardProps) {
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

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
      onClick={handleCardClick}
    >
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
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

        {showDeleteButton && (
          <Button
            onClick={handleDeleteClick}
            variant="destructive"
            size="sm"
            className="w-full mt-3"
          >
            Delete Event
          </Button>
        )}
      </CardContent>
    </Card>
  );
}