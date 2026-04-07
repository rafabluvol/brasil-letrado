
-- Create storage bucket for production media (videos and audios)
INSERT INTO storage.buckets (id, name, public) VALUES ('production-media', 'production-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Production media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'production-media');

-- Allow authenticated users to upload their own media
CREATE POLICY "Users can upload production media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'production-media' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own media
CREATE POLICY "Users can delete own production media"
ON storage.objects FOR DELETE
USING (bucket_id = 'production-media' AND auth.uid()::text = (storage.foldername(name))[1]);
