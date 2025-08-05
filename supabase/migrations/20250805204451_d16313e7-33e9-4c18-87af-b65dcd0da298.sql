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