-- Add foreign key constraints with CASCADE delete to allow clean coach deletion
-- First, check if there are any events referencing coaches that need to be handled

-- Add foreign key constraint for events.coach_id with SET NULL on delete
-- This way when a coach is deleted, events will have coach_id set to NULL instead of blocking deletion
ALTER TABLE public.events 
DROP CONSTRAINT IF EXISTS events_coach_id_fkey;

ALTER TABLE public.events 
ADD CONSTRAINT events_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES public.coaches(id) 
ON DELETE SET NULL;

-- Add foreign key constraint for coach_events with CASCADE delete
-- This way when a coach is deleted, all coach_events records are also deleted
ALTER TABLE public.coach_events 
DROP CONSTRAINT IF EXISTS coach_events_coach_id_fkey;

ALTER TABLE public.coach_events 
ADD CONSTRAINT coach_events_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES public.coaches(id) 
ON DELETE CASCADE;

-- Ensure events foreign key also exists
ALTER TABLE public.coach_events 
DROP CONSTRAINT IF EXISTS coach_events_event_id_fkey;

ALTER TABLE public.coach_events 
ADD CONSTRAINT coach_events_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES public.events(id) 
ON DELETE CASCADE;