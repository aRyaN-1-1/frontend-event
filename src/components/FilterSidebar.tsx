import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Calendar, MapPin, Euro, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FilterSidebarProps {
  onFiltersChange: (filters: EventFilters) => void;
}

export interface EventFilters {
  search: string;
  eventTypes: string[];
  location: string;
  priceRange: [number, number];
  date: Date | undefined;
}

const eventTypes = ['Workshop', 'Conference', 'Bootcamp', 'Retreat', 'Webinar'];
const locations = ['Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany', 'Frankfurt, Germany', 'Cologne, Germany', 'Dresden, Germany'];

export default function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    eventTypes: [],
    location: '',
    priceRange: [1, 500],
    date: undefined
  });

  // Auto-focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleEventTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.eventTypes, type]
      : filters.eventTypes.filter(t => t !== type);
    handleFilterChange('eventTypes', newTypes);
  };

  const clearFilters = () => {
    const clearedFilters: EventFilters = {
      search: '',
      eventTypes: [],
      location: '',
      priceRange: [1, 500],
      date: undefined
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  // Apply filters automatically when they change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="w-80 bg-card border-r p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Events</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="search"
            placeholder="Search by event name..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Event Type */}
      <div className="space-y-3">
        <Label>Event Type</Label>
        <div className="space-y-2">
          {eventTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={filters.eventTypes.includes(type)}
                onCheckedChange={(checked) => handleEventTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={type} className="text-sm font-normal">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={filters.location || 'all'} onValueChange={(value) => handleFilterChange('location', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select location" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Price Range: €{filters.priceRange[0]} - €{filters.priceRange[1]}
        </Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
          max={500}
          min={1}
          step={5}
          className="w-full"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min Price</Label>
            <div className="relative">
              <Euro className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                id="min-price"
                type="number"
                min={1}
                max={filters.priceRange[1] - 5}
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const newMin = Math.max(1, parseInt(e.target.value) || 1);
                  handleFilterChange('priceRange', [newMin, filters.priceRange[1]]);
                }}
                className="pl-6 text-sm"
                placeholder="1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max Price</Label>
            <div className="relative">
              <Euro className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                id="max-price"
                type="number"
                min={filters.priceRange[0] + 5}
                max={500}
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const newMax = Math.min(500, parseInt(e.target.value) || 200);
                  handleFilterChange('priceRange', [filters.priceRange[0], newMax]);
                }}
                className="pl-6 text-sm"
                placeholder="200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Event Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filters.date && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.date ? format(filters.date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.date}
              onSelect={(date) => handleFilterChange('date', date)}
              disabled={(date) => date < tomorrow}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}