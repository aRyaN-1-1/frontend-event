-- Manually confirm the existing admin user's email
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'admin@impactboard.com' AND email_confirmed_at IS NULL;