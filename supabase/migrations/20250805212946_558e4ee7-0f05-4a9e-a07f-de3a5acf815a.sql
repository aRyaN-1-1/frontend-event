-- Create storage buckets for event and coach images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('event-images', 'event-images', true),
  ('coach-images', 'coach-images', true);

-- Create policies for event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'));

-- Create policies for coach images
CREATE POLICY "Coach images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'coach-images');

CREATE POLICY "Admins can upload coach images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'coach-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coach images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'coach-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coach images"
ON storage.objects FOR DELETE
USING (bucket_id = 'coach-images' AND has_role(auth.uid(), 'admin'));