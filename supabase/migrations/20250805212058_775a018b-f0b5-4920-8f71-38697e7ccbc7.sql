-- Update the handle_new_user function to automatically confirm admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  
  -- Check if this is the admin user and auto-confirm
  IF new.email = 'admin@impactboard.com' THEN
    -- Auto-confirm the admin email
    UPDATE auth.users 
    SET email_confirmed_at = now()
    WHERE id = new.id;
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  ELSE
    -- Assign regular user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
  END IF;
  
  RETURN new;
END;
$function$;