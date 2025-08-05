-- Create coaches table
CREATE TABLE public.coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  about TEXT NOT NULL,
  areas_of_expertise TEXT[] NOT NULL DEFAULT '{}',
  certifications TEXT[] NOT NULL DEFAULT '{}',
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on coaches
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- RLS policies for coaches
CREATE POLICY "Coaches are viewable by everyone" 
ON public.coaches 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own coach profile" 
ON public.coaches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coach profile" 
ON public.coaches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coach profile" 
ON public.coaches 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all coaches" 
ON public.coaches 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for automatic timestamp updates on coaches
CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create coach_events junction table for many-to-many relationship
CREATE TABLE public.coach_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, event_id)
);

-- Enable RLS on coach_events
ALTER TABLE public.coach_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_events
CREATE POLICY "Coach events are viewable by everyone" 
ON public.coach_events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage coach events" 
ON public.coach_events 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add coach_id to events table for the main coach of an event
ALTER TABLE public.events ADD COLUMN coach_id UUID REFERENCES public.coaches(id);

-- Insert sample coaches
INSERT INTO public.coaches (user_id, name, about, areas_of_expertise, certifications, profile_image_url) VALUES
-- Using dummy UUID for user_id since we don't have real users yet
('00000000-0000-0000-0000-000000000001'::uuid, 'Dr. Sarah Mitchell', 'Experienced leadership consultant with over 15 years in executive coaching and organizational development. Passionate about helping leaders unlock their potential and drive meaningful change.', ARRAY['Leadership Development', 'Executive Coaching', 'Team Building', 'Change Management'], ARRAY['Certified Executive Coach (ICF)', 'Leadership Circle Profile Practitioner', 'MBA in Organizational Psychology'], 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face'),
('00000000-0000-0000-0000-000000000002'::uuid, 'Marcus Weber', 'Digital marketing strategist and entrepreneur with a track record of building successful online businesses. Specializes in growth hacking and data-driven marketing approaches.', ARRAY['Digital Marketing', 'Growth Hacking', 'Data Analytics', 'E-commerce Strategy'], ARRAY['Google Ads Certified', 'Facebook Blueprint Certified', 'HubSpot Content Marketing Certified'], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'),
('00000000-0000-0000-0000-000000000003'::uuid, 'Elena Rodriguez', 'Successful entrepreneur and startup mentor who has founded three tech companies. Now focuses on helping early-stage entrepreneurs navigate the challenges of building scalable businesses.', ARRAY['Entrepreneurship', 'Startup Strategy', 'Product Development', 'Fundraising'], ARRAY['Techstars Mentor', 'Lean Startup Certified', 'Angel Investor'], 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'),
('00000000-0000-0000-0000-000000000004'::uuid, 'Dr. James Thompson', 'Mindfulness expert and productivity coach with a background in psychology. Helps professionals achieve peak performance through evidence-based mindfulness practices.', ARRAY['Mindfulness', 'Productivity Coaching', 'Stress Management', 'Work-Life Balance'], ARRAY['Certified Mindfulness Teacher', 'PhD in Psychology', 'Certified Life Coach'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'),
('00000000-0000-0000-0000-000000000005'::uuid, 'Lisa Chen', 'Technology innovation specialist and former Silicon Valley executive. Expert in emerging technologies, AI implementation, and digital transformation strategies.', ARRAY['Technology Innovation', 'AI Strategy', 'Digital Transformation', 'Product Management'], ARRAY['Certified Product Manager', 'AI Strategy Certificate (Stanford)', 'Agile Certified Practitioner'], 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face'),
('00000000-0000-0000-0000-000000000006'::uuid, 'Robert Anderson', 'Award-winning author and creative writing instructor. Has published multiple bestselling novels and helps aspiring writers develop their craft and build sustainable writing careers.', ARRAY['Creative Writing', 'Publishing', 'Storytelling', 'Author Platform Building'], ARRAY['MFA in Creative Writing', 'Published Author (5 novels)', 'Writing Workshop Facilitator'], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face');