
-- Create storage bucket for book images
INSERT INTO storage.buckets (id, name, public) VALUES ('book-images', 'book-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Users can upload book images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-images');

-- Allow public read access
CREATE POLICY "Public read access for book images" ON storage.objects FOR SELECT USING (bucket_id = 'book-images');

-- Delete all old broken books
DELETE FROM public.student_books;
