-- Create a function to validate coach count limit
CREATE OR REPLACE FUNCTION public.validate_coach_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_count INTEGER;
BEGIN
  -- Count existing coaches
  SELECT COUNT(*) INTO coach_count FROM public.coaches;
  
  -- Check if we're at the limit of 30 coaches
  IF coach_count >= 30 THEN
    RAISE EXCEPTION 'Maximum number of coaches (30) has been reached. Cannot add more coaches.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate coach count before insert
CREATE TRIGGER validate_coach_count_trigger
  BEFORE INSERT ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_coach_limit();