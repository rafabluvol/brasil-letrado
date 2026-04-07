CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.student_productions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  historia_texto TEXT,
  ano TEXT,
  genero TEXT,
  cenas JSONB NOT NULL DEFAULT '[]'::jsonb,
  capa_url TEXT,
  compartilhavel BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_productions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own productions"
ON public.student_productions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared productions"
ON public.student_productions FOR SELECT
USING (compartilhavel = true);

CREATE POLICY "Users can create own productions"
ON public.student_productions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own productions"
ON public.student_productions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own productions"
ON public.student_productions FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_student_productions_updated_at
BEFORE UPDATE ON public.student_productions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();