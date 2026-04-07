
-- Profiles table for student data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT,
  ano_escolar TEXT DEFAULT '3',
  total_xp INTEGER DEFAULT 0,
  total_atividades INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Activity results table
CREATE TABLE public.activity_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ano TEXT NOT NULL,
  genero TEXT NOT NULL,
  tema TEXT NOT NULL,
  subtema TEXT,
  habilidade_bncc TEXT,
  titulo TEXT,
  acertos INTEGER DEFAULT 0,
  total_exercicios INTEGER DEFAULT 0,
  pontos INTEGER DEFAULT 0,
  leitura_realizada BOOLEAN DEFAULT false,
  exercicio_results JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results" ON public.activity_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON public.activity_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Student performance aggregates
CREATE TABLE public.student_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  interpretacao_acertos INTEGER DEFAULT 0,
  interpretacao_total INTEGER DEFAULT 0,
  vocabulario_acertos INTEGER DEFAULT 0,
  vocabulario_total INTEGER DEFAULT 0,
  gramatica_acertos INTEGER DEFAULT 0,
  gramatica_total INTEGER DEFAULT 0,
  leitura_tentativas INTEGER DEFAULT 0,
  erros_frequentes JSONB DEFAULT '[]',
  subtemas_recentes JSONB DEFAULT '[]',
  generos_recentes JSONB DEFAULT '[]',
  temas_recentes JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance" ON public.student_performance
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance" ON public.student_performance
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance" ON public.student_performance
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  INSERT INTO public.student_performance (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
