-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  image_url TEXT,
  location TEXT NOT NULL,
  event_type TEXT NOT NULL,
  available_slots INTEGER NOT NULL DEFAULT 0,
  price_per_person DECIMAL(10,2) NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all events" 
ON public.events 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for automatic timestamp updates on events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample events
INSERT INTO public.events (name, description, short_description, image_url, location, event_type, available_slots, price_per_person, event_date) VALUES
('Leadership Mastery Workshop', 'A comprehensive workshop designed to enhance your leadership skills through interactive sessions, case studies, and practical exercises. Learn from industry experts and network with fellow leaders.', 'Enhance your leadership skills with expert guidance', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop', 'Berlin, Germany', 'Workshop', 25, 89.99, '2025-08-15'),
('Digital Marketing Bootcamp', 'Master the fundamentals of digital marketing including SEO, social media marketing, content strategy, and analytics. Perfect for beginners and intermediate marketers looking to boost their skills.', 'Master digital marketing fundamentals', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop', 'Munich, Germany', 'Bootcamp', 30, 149.99, '2025-08-20'),
('Entrepreneurship Summit', 'Connect with successful entrepreneurs, investors, and thought leaders. Gain insights into building successful startups, scaling businesses, and navigating the entrepreneurial journey.', 'Connect with entrepreneurs and investors', 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=400&h=250&fit=crop', 'Hamburg, Germany', 'Conference', 100, 199.99, '2025-08-25'),
('Mindfulness & Productivity', 'Learn evidence-based mindfulness techniques to enhance productivity, reduce stress, and improve work-life balance. Includes guided meditation sessions and practical tools.', 'Enhance productivity through mindfulness', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop', 'Frankfurt, Germany', 'Workshop', 20, 75.00, '2025-08-30'),
('Tech Innovation Conference', 'Explore the latest trends in technology, AI, and innovation. Features keynote speakers from leading tech companies and interactive technology demonstrations.', 'Explore latest tech trends and innovation', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop', 'Cologne, Germany', 'Conference', 150, 179.99, '2025-09-05'),
('Creative Writing Retreat', 'A weekend retreat for aspiring and experienced writers. Includes writing workshops, one-on-one mentoring sessions, and networking opportunities with published authors.', 'Weekend retreat for writers of all levels', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop', 'Dresden, Germany', 'Retreat', 15, 129.99, '2025-09-10');