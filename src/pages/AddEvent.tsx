import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    event_type: '',
    location: '',
    event_date: '',
    price_per_person: '',
    available_slots: ''
  });

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = null;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const eventData = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        event_type: formData.event_type,
        location: formData.location,
        event_date: formData.event_date,
        price_per_person: parseFloat(formData.price_per_person),
        available_slots: parseInt(formData.available_slots),
        image_url: imageUrl,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Event created successfully!"
      });

      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/events')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Add New Event</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter event name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description *</Label>
                  <Textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description for event cards"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Detailed event description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Seminar">Seminar</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Webinar">Webinar</SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Event location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Input
                      id="event_date"
                      name="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_per_person">Price per Person *</Label>
                    <Input
                      id="price_per_person"
                      name="price_per_person"
                      type="number"
                      step="0.01"
                      value={formData.price_per_person}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="available_slots">Available Slots *</Label>
                    <Input
                      id="available_slots"
                      name="available_slots"
                      type="number"
                      value={formData.available_slots}
                      onChange={handleInputChange}
                      required
                      placeholder="Number of slots"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Event Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/events')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Event
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}