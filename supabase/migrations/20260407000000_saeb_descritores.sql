-- ============================================================
-- SAEB Descriptors — Tables, Seed Data, and Auto-Update Trigger
-- ============================================================

-- 1. Reference table: SAEB descriptors by year
-- ============================================================
CREATE TABLE public.saeb_descritores (
  codigo      TEXT NOT NULL,
  ano_escolar TEXT NOT NULL,
  descricao   TEXT NOT NULL,
  categoria   TEXT NOT NULL,
  habilidades_bncc JSONB DEFAULT '[]',
  PRIMARY KEY (codigo, ano_escolar)
);

-- 2. Per-student SAEB performance table
-- ============================================================
CREATE TABLE public.student_saeb_performance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  descritor_saeb      TEXT NOT NULL,
  ano_escolar         TEXT NOT NULL,
  total_exercicios    INTEGER DEFAULT 0,
  total_acertos       INTEGER DEFAULT 0,
  taxa_acerto         NUMERIC(5,2) DEFAULT 0,
  nivel               TEXT DEFAULT 'critico'
                        CHECK (nivel IN ('dominado', 'em_desenvolvimento', 'critico')),
  ultima_atualizacao  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, descritor_saeb, ano_escolar)
);

-- 3. Add descritor_saeb column to activity_results
-- ============================================================
ALTER TABLE public.activity_results
  ADD COLUMN IF NOT EXISTS descritor_saeb TEXT;

-- ============================================================
-- 4. Seed: 5º ano — D1 a D15
-- ============================================================
INSERT INTO public.saeb_descritores (codigo, ano_escolar, descricao, categoria, habilidades_bncc) VALUES
('D1',  '5', 'Localizar informações explícitas em um texto',
  'Localização de Informações',
  '["EF05LP01","EF05LP02","EF05LP03","EF05LP04"]'),

('D2',  '5', 'Inferir o sentido de uma palavra ou expressão',
  'Inferência',
  '["EF05LP05","EF05LP06"]'),

('D3',  '5', 'Inferir informação implícita em um texto',
  'Inferência',
  '["EF05LP07","EF05LP08"]'),

('D4',  '5', 'Identificar o tema de um texto',
  'Identificação de Tema',
  '["EF05LP09","EF05LP10"]'),

('D5',  '5', 'Distinguir um fato da opinião relativa a esse fato',
  'Fato e Opinião',
  '["EF05LP11"]'),

('D6',  '5', 'Identificar o efeito de sentido decorrente do uso da pontuação e de outras notações',
  'Efeitos de Sentido',
  '["EF05LP12"]'),

('D7',  '5', 'Reconhecer o efeito de sentido decorrente da escolha de uma determinada palavra ou expressão',
  'Efeitos de Sentido',
  '["EF05LP13"]'),

('D8',  '5', 'Estabelecer relação entre a tese e os argumentos oferecidos para sustentá-la',
  'Argumentação',
  '["EF05LP14"]'),

('D9',  '5', 'Diferenciar as partes principais das secundárias em um texto',
  'Estrutura Textual',
  '["EF05LP15"]'),

('D10', '5', 'Identificar o conflito gerador do enredo e os elementos que constroem a narrativa',
  'Estrutura Narrativa',
  '["EF05LP16"]'),

('D11', '5', 'Estabelecer relação causa/consequência entre partes e elementos do texto',
  'Relações Textuais',
  '["EF05LP17"]'),

('D12', '5', 'Estabelecer relações lógico-discursivas presentes no texto, marcadas por conjunções, advérbios etc.',
  'Relações Textuais',
  '["EF05LP18"]'),

('D13', '5', 'Identificar a finalidade de textos de diferentes gêneros',
  'Gêneros Textuais',
  '["EF05LP19","EF05LP20"]'),

('D14', '5', 'Reconhecer diferentes formas de tratar uma informação na comparação de textos que tratam do mesmo tema',
  'Intertextualidade',
  '["EF05LP21"]'),

('D15', '5', 'Reconhecer o efeito de sentido decorrente do uso de recursos gráfico-visuais em textos',
  'Recursos Expressivos',
  '["EF05LP22","EF05LP23"]');

-- ============================================================
-- 5. Seed: 2º ano — D1 a D11
-- ============================================================
INSERT INTO public.saeb_descritores (codigo, ano_escolar, descricao, categoria, habilidades_bncc) VALUES
('D1',  '2', 'Localizar informações explícitas em textos de diferentes gêneros e suportes',
  'Localização de Informações',
  '["EF02LP01","EF02LP02"]'),

('D2',  '2', 'Inferir informações em textos de diferentes gêneros e suportes',
  'Inferência',
  '["EF02LP03","EF02LP04"]'),

('D3',  '2', 'Reconhecer a finalidade de textos de diferentes gêneros e suportes',
  'Gêneros Textuais',
  '["EF02LP05"]'),

('D4',  '2', 'Identificar o tema de um texto',
  'Identificação de Tema',
  '["EF02LP06"]'),

('D5',  '2', 'Reconhecer o assunto principal de um texto',
  'Compreensão Global',
  '["EF02LP07"]'),

('D6',  '2', 'Distinguir um fato da opinião relativa a esse fato',
  'Fato e Opinião',
  '["EF02LP08"]'),

('D7',  '2', 'Identificar a sequência lógica de eventos em textos narrativos',
  'Estrutura Narrativa',
  '["EF02LP09","EF02LP10"]'),

('D8',  '2', 'Reconhecer o efeito de sentido decorrente da escolha de determinada palavra ou expressão',
  'Efeitos de Sentido',
  '["EF02LP11"]'),

('D9',  '2', 'Reconhecer relação de causa e consequência entre partes de um texto',
  'Relações Textuais',
  '["EF02LP12"]'),

('D10', '2', 'Reconhecer textos poéticos pela forma e pelo uso de recursos expressivos',
  'Recursos Expressivos',
  '["EF02LP13"]'),

('D11', '2', 'Compreender textos em diferentes gêneros textuais',
  'Compreensão Global',
  '["EF02LP14","EF02LP15"]');

-- ============================================================
-- 6. Mapping function: habilidade_bncc → SAEB descriptor code
-- ============================================================
CREATE OR REPLACE FUNCTION public.bncc_para_saeb_descritor(bncc TEXT, ano TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- 5º ano
  IF ano = '5' THEN
    RETURN CASE bncc
      WHEN 'EF05LP01' THEN 'D1' WHEN 'EF05LP02' THEN 'D1'
      WHEN 'EF05LP03' THEN 'D1' WHEN 'EF05LP04' THEN 'D1'
      WHEN 'EF05LP05' THEN 'D2' WHEN 'EF05LP06' THEN 'D2'
      WHEN 'EF05LP07' THEN 'D3' WHEN 'EF05LP08' THEN 'D3'
      WHEN 'EF05LP09' THEN 'D4' WHEN 'EF05LP10' THEN 'D4'
      WHEN 'EF05LP11' THEN 'D5'
      WHEN 'EF05LP12' THEN 'D6'
      WHEN 'EF05LP13' THEN 'D7'
      WHEN 'EF05LP14' THEN 'D8'
      WHEN 'EF05LP15' THEN 'D9'
      WHEN 'EF05LP16' THEN 'D10'
      WHEN 'EF05LP17' THEN 'D11'
      WHEN 'EF05LP18' THEN 'D12'
      WHEN 'EF05LP19' THEN 'D13' WHEN 'EF05LP20' THEN 'D13'
      WHEN 'EF05LP21' THEN 'D14'
      WHEN 'EF05LP22' THEN 'D15' WHEN 'EF05LP23' THEN 'D15'
      ELSE NULL
    END;
  END IF;

  -- 2º ano
  IF ano = '2' THEN
    RETURN CASE bncc
      WHEN 'EF02LP01' THEN 'D1' WHEN 'EF02LP02' THEN 'D1'
      WHEN 'EF02LP03' THEN 'D2' WHEN 'EF02LP04' THEN 'D2'
      WHEN 'EF02LP05' THEN 'D3'
      WHEN 'EF02LP06' THEN 'D4'
      WHEN 'EF02LP07' THEN 'D5'
      WHEN 'EF02LP08' THEN 'D6'
      WHEN 'EF02LP09' THEN 'D7' WHEN 'EF02LP10' THEN 'D7'
      WHEN 'EF02LP11' THEN 'D8'
      WHEN 'EF02LP12' THEN 'D9'
      WHEN 'EF02LP13' THEN 'D10'
      WHEN 'EF02LP14' THEN 'D11' WHEN 'EF02LP15' THEN 'D11'
      ELSE NULL
    END;
  END IF;

  RETURN NULL;
END;
$$;

-- ============================================================
-- 7. BEFORE INSERT trigger: auto-fill descritor_saeb
-- ============================================================
CREATE OR REPLACE FUNCTION public.preencher_descritor_saeb()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.habilidade_bncc IS NOT NULL AND NEW.descritor_saeb IS NULL THEN
    NEW.descritor_saeb := public.bncc_para_saeb_descritor(NEW.habilidade_bncc, NEW.ano);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_preencher_descritor_saeb
  BEFORE INSERT ON public.activity_results
  FOR EACH ROW EXECUTE FUNCTION public.preencher_descritor_saeb();

-- ============================================================
-- 8. AFTER INSERT trigger: upsert into student_saeb_performance
-- ============================================================
CREATE OR REPLACE FUNCTION public.atualizar_saeb_performance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_descritor TEXT;
  v_taxa      NUMERIC(5,2);
  v_nivel     TEXT;
BEGIN
  v_descritor := NEW.descritor_saeb;
  IF v_descritor IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.student_saeb_performance
    (user_id, descritor_saeb, ano_escolar, total_exercicios, total_acertos, taxa_acerto, nivel, ultima_atualizacao)
  VALUES (
    NEW.user_id,
    v_descritor,
    NEW.ano,
    COALESCE(NEW.total_exercicios, 0),
    COALESCE(NEW.acertos, 0),
    CASE
      WHEN COALESCE(NEW.total_exercicios, 0) = 0 THEN 0
      ELSE ROUND((COALESCE(NEW.acertos, 0)::NUMERIC / NEW.total_exercicios) * 100, 2)
    END,
    'critico',
    now()
  )
  ON CONFLICT (user_id, descritor_saeb, ano_escolar) DO UPDATE SET
    total_exercicios   = student_saeb_performance.total_exercicios + COALESCE(NEW.total_exercicios, 0),
    total_acertos      = student_saeb_performance.total_acertos + COALESCE(NEW.acertos, 0),
    taxa_acerto        = CASE
      WHEN (student_saeb_performance.total_exercicios + COALESCE(NEW.total_exercicios, 0)) = 0 THEN 0
      ELSE ROUND(
        ((student_saeb_performance.total_acertos + COALESCE(NEW.acertos, 0))::NUMERIC
         / (student_saeb_performance.total_exercicios + COALESCE(NEW.total_exercicios, 0))) * 100,
        2
      )
    END,
    nivel              = CASE
      WHEN ROUND(
        ((student_saeb_performance.total_acertos + COALESCE(NEW.acertos, 0))::NUMERIC
         / NULLIF(student_saeb_performance.total_exercicios + COALESCE(NEW.total_exercicios, 0), 0)) * 100, 2
      ) >= 70 THEN 'dominado'
      WHEN ROUND(
        ((student_saeb_performance.total_acertos + COALESCE(NEW.acertos, 0))::NUMERIC
         / NULLIF(student_saeb_performance.total_exercicios + COALESCE(NEW.total_exercicios, 0), 0)) * 100, 2
      ) >= 40 THEN 'em_desenvolvimento'
      ELSE 'critico'
    END,
    ultima_atualizacao = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_atualizar_saeb_performance
  AFTER INSERT ON public.activity_results
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_saeb_performance();

-- ============================================================
-- 9. Row Level Security
-- ============================================================
ALTER TABLE public.saeb_descritores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saeb_descritores_select_all"
  ON public.saeb_descritores FOR SELECT USING (true);

ALTER TABLE public.student_saeb_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saeb_perf_select_own"
  ON public.student_saeb_performance FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "saeb_perf_insert_own"
  ON public.student_saeb_performance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saeb_perf_update_own"
  ON public.student_saeb_performance FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
