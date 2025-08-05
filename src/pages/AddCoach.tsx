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
import { ArrowLeft, Upload, Loader2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AddCoach() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    about: ''
  });

  const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [newCertification, setNewCertification] = useState('');

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

  const addExpertise = () => {
    if (newExpertise.trim() && !areasOfExpertise.includes(newExpertise.trim())) {
      setAreasOfExpertise([...areasOfExpertise, newExpertise.trim()]);
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setAreasOfExpertise(areasOfExpertise.filter(item => item !== expertise));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    setCertifications(certifications.filter(item => item !== certification));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `coaches/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('coach-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('coach-images')
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

      const coachData = {
        name: formData.name,
        about: formData.about,
        areas_of_expertise: areasOfExpertise,
        certifications: certifications,
        profile_image_url: imageUrl,
        user_id: user?.id
      };

      const { error } = await supabase
        .from('coaches')
        .insert([coachData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Coach profile created successfully!"
      });

      navigate('/coaches');
    } catch (error) {
      console.error('Error creating coach:', error);
      toast({
        title: "Error",
        description: "Failed to create coach profile. Please try again.",
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
              onClick={() => navigate('/coaches')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Coaches
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Add New Coach</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coach Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Coach Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter coach name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">About *</Label>
                  <Textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us about the coach's background and experience"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Areas of Expertise</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="Add area of expertise"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addExpertise();
                        }
                      }}
                    />
                    <Button type="button" onClick={addExpertise} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {areasOfExpertise.map((expertise, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {expertise}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeExpertise(expertise)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add certification"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCertification();
                        }
                      }}
                    />
                    <Button type="button" onClick={addCertification} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {certifications.map((certification, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {certification}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeCertification(certification)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image</Label>
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
                        className="w-32 h-32 object-cover rounded-full border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/coaches')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Coach Profile
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