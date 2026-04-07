
-- Allow recipients to view shared books
CREATE POLICY "Recipients can view shared books"
ON public.student_books FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_items
    WHERE shared_items.item_id = student_books.id
      AND shared_items.item_type = 'book'
      AND shared_items.recipient_id = auth.uid()
      AND shared_items.status = 'accepted'
  )
);

-- Allow recipients to view shared productions
CREATE POLICY "Recipients can view shared productions"
ON public.student_productions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_items
    WHERE shared_items.item_id = student_productions.id
      AND shared_items.item_type = 'production'
      AND shared_items.recipient_id = auth.uid()
      AND shared_items.status = 'accepted'
  )
);
