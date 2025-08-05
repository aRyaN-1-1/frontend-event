-- Temporarily make user_id nullable for sample coaches
ALTER TABLE public.coaches ALTER COLUMN user_id DROP NOT NULL;

-- Insert 2 sample coaches
INSERT INTO public.coaches (name, about, areas_of_expertise, certifications, profile_image_url) VALUES
('Dr. Sarah Mitchell', 'Experienced leadership consultant with over 15 years in executive coaching and organizational development. Passionate about helping leaders unlock their potential and drive meaningful change in their organizations.', ARRAY['Leadership Development', 'Executive Coaching', 'Team Building', 'Change Management', 'Organizational Psychology'], ARRAY['Certified Executive Coach (ICF)', 'Leadership Circle Profile Practitioner', 'MBA in Organizational Psychology', 'Certified Change Management Professional'], 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face'),

('Marcus Weber', 'Digital marketing strategist and entrepreneur with a proven track record of building successful online businesses from the ground up. Specializes in growth hacking, data-driven marketing strategies, and scaling e-commerce operations.', ARRAY['Digital Marketing', 'Growth Hacking', 'Data Analytics', 'E-commerce Strategy', 'Social Media Marketing', 'SEO/SEM'], ARRAY['Google Ads Certified Professional', 'Facebook Blueprint Certified', 'HubSpot Content Marketing Certified', 'Google Analytics Individual Qualification'], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face');

-- Update RLS policy for coaches to allow viewing sample coaches (those without user_id)
DROP POLICY "Coaches are viewable by everyone" ON public.coaches;
CREATE POLICY "Coaches are viewable by everyone" 
ON public.coaches 
FOR SELECT 
USING (true);