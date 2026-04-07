CREATE TABLE public.student_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  genero text,
  ano text,
  capa_url text,
  paginas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.student_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own books" ON public.student_books FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own books" ON public.student_books FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON public.student_books FOR DELETE TO authenticated USING (auth.uid() = user_id);