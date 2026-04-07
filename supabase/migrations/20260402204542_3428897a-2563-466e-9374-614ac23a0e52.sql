
-- Table for sharing items between students
CREATE TABLE public.shared_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT NOT NULL UNIQUE,
  item_type TEXT NOT NULL CHECK (item_type IN ('book', 'production')),
  item_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  owner_name TEXT,
  owner_ano TEXT,
  recipient_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.shared_items ENABLE ROW LEVEL SECURITY;

-- Owner can see their shared items
CREATE POLICY "Owners can view own shared items"
ON public.shared_items FOR SELECT
USING (auth.uid() = owner_id);

-- Recipients can see items shared with them
CREATE POLICY "Recipients can view received items"
ON public.shared_items FOR SELECT
USING (auth.uid() = recipient_id);

-- Anyone authenticated can look up by share_code (to claim)
CREATE POLICY "Users can lookup by share code"
ON public.shared_items FOR SELECT
USING (auth.uid() IS NOT NULL AND recipient_id IS NULL AND status = 'pending');

-- Owners can create share links
CREATE POLICY "Users can create shared items"
ON public.shared_items FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Recipients can claim (update recipient_id)
CREATE POLICY "Users can claim shared items"
ON public.shared_items FOR UPDATE
USING (auth.uid() IS NOT NULL AND (auth.uid() = owner_id OR (status = 'pending' AND recipient_id IS NULL)));

-- Owners can delete their shares
CREATE POLICY "Owners can delete shared items"
ON public.shared_items FOR DELETE
USING (auth.uid() = owner_id);

-- Index for fast code lookups
CREATE INDEX idx_shared_items_code ON public.shared_items (share_code);
CREATE INDEX idx_shared_items_recipient ON public.shared_items (recipient_id) WHERE recipient_id IS NOT NULL;
