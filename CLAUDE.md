# Brasil Letrado — Contexto do Projeto para Claude Code

## O que é o projeto

**Brasil Letrado** (nome interno do repositório: `texeia-amiga-mente`) é uma plataforma educacional gamificada de leitura em português para crianças do 1º ao 5º ano do ensino fundamental. O produto gera histórias personalizadas com IA, exercícios pedagógicos alinhados à BNCC/SAEB, leitura em voz alta com análise automática, livrinho ilustrado, e um dashboard de desempenho para professores e gestores escolares.

O mascote é o **Piu-Piu**, um passarinho verde. Toda mensagem de feedback da IA para o aluno começa com "Piu-Piu!" (NUNCA "Pio-Pio").

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS + shadcn/ui (Radix UI) |
| Roteamento | React Router v6 |
| Estado/Cache | TanStack Query v5 |
| Animações | Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| IA — Texto | Google Gemini via gateway Lovable (`ai.gateway.lovable.dev`) — **PENDENTE MIGRAÇÃO** |
| IA — Imagem | Google Gemini Image via gateway Lovable — **PENDENTE MIGRAÇÃO** |
| IA — TTS | ElevenLabs API direta (já funciona, não migrar) |
| IA — Vídeo | Replicate API direta (já funciona, não migrar) |
| Build | Vite 5 / `npm run dev` |
| Testes | Vitest + Testing Library + Playwright |

---

## Estrutura de Pastas Relevantes

```
supabase/
  functions/          ← 8 Edge Functions (Deno)
  migrations/         ← SQL migrations do banco
src/
  pages/              ← Atividade, Dashboard, Estante, Vivenciando, etc.
  components/         ← Componentes React (exercicios/, ui/, etc.)
  integrations/supabase/ ← Cliente Supabase gerado
```

---

## Edge Functions (todas em Deno)

### 1. `generate-atividade` ← CRÍTICA — usa gateway Lovable
**O que faz:** Gera a história principal + 5 exercícios pedagógicos completos (multipla-escolha, ligar, completar, aberta, leitura-trecho). É o coração do produto.

**Inputs:** `ano`, `genero` (gênero textual), `tema`, `subtema`, `habilidade_bncc`, `historiaAluno` (texto da história já gerada, opcional)

**Output:** JSON com `{ titulo, historia, exercicios[] }`

**IA usada:** `google/gemini-3-flash-preview` via `https://ai.gateway.lovable.dev/v1/chat/completions` com `LOVABLE_API_KEY`

**Lógica especial:** Contém um mapa `GENERO_EXERCICIO_INSTRUCOES` com instruções específicas por gênero textual (trava-línguas, fábula, conto de fadas, receita, HQ, etc.). Inclui diferenciação por nível de dificuldade (1-2º ano, 3-4º ano, 5º ano).

---

### 2. `generate-livrinho` ← usa gateway Lovable
**O que faz:** Pega o texto de uma história já gerada e cria um "livrinho" de 4 páginas com imagens ilustradas. Estrutura a história em início/meio1/meio2/fim com descrição de imagem para cada cena, gera as imagens em base64 e persiste no Supabase Storage (`book-images`).

**Inputs:** `titulo`, `texto`, `genero`, `ano`, `autorNome`, `existingImages` (para reutilizar imagens já geradas)

**Output:** JSON com `{ id, titulo, autor, paginas[], capaUrl, resumo }`

**IA usada:**
- Texto do livrinho: `google/gemini-3-flash-preview` via gateway Lovable
- Imagens das páginas: `google/gemini-2.5-flash-image` via gateway Lovable

**Resposta de imagem:** O gateway retorna `choices[0].message.images[0].image_url.url` com base64 `data:image/...`. Isso é específico do gateway Lovable — a API nativa do Gemini tem formato diferente.

---

### 3. `generate-story-image` ← usa gateway Lovable
**O que faz:** Gera UMA imagem de cena avulsa (usado para regenerar páginas individuais do livrinho sem reprocessar tudo). Suporta `characterSheet` para manter consistência visual dos personagens.

**Inputs:** `description`, `bookId`, `pageNumber`, `characterSheet`, `targetWidth`, `targetHeight`

**Output:** `{ imageUrl }` — URL pública do Supabase Storage ou base64 como fallback

**IA usada:** `google/gemini-3.1-flash-image-preview` via gateway Lovable com `modalities: ["image", "text"]`

---

### 4. `analyze-leitura` ← usa gateway Lovable
**O que faz:** Recebe o texto original e a transcrição de voz do aluno e retorna feedback pedagógico encorajador. O aluno SEMPRE passa (nota mínima 4).

**Inputs:** `textoOriginal`, `transcricaoAluno`, `trechoDestaque`, `ano`

**Output:** JSON com `{ nota, status, emoji, mensagem_principal, pontos_positivos, pontos_melhoria, dica_especial, palavras_dificeis, precisao_estimada, deve_repetir, leitura_incompleta }`

**IA usada:** `google/gemini-3-flash-preview` via gateway Lovable

---

### 5. `generate-vivenciando` ← usa gateway Lovable
**O que faz:** Gera 10 ideias de atividades offline ("vivenciando") para o professor executar em sala de aula baseadas na história. Exibido na página `Vivenciando.tsx`.

**Inputs:** `titulo`, `historia_texto`, `ano`, `genero`

**Output:** JSON com `{ ideias: [{ titulo, descricao, passos[] }] }`

**IA usada:** `google/gemini-2.5-flash` via gateway Lovable com `temperature: 0.9`

---

### 6. `generate-scene-narration` ← usa gateway Lovable
**O que faz:** Gera narração estruturada com legendas para cada cena do vídeo. Divide o texto da cena em 2–4 segmentos com tempo de exibição calibrado para crianças.

**Inputs:** `sceneText`, `sceneTextEn`, `sceneIndex`, `totalScenes`, `level`

**Output:** JSON com `{ subtitles: [{ text_pt, text_en, display_seconds }], narration_text, narration_text_en }`

**IA usada:** `google/gemini-2.5-flash` via gateway Lovable

---

### 7. `elevenlabs-tts` ← FUNCIONA, não migrar
**O que faz:** Text-to-speech usando ElevenLabs. Gera áudio MP3 da história para o aluno ouvir antes de ler. Persiste no Supabase Storage (`production-media`).

**API:** ElevenLabs direta (`xi-api-key`), modelo `eleven_multilingual_v2`

**Env:** `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`

---

### 8. `generate-scene-video` ← FUNCIONA, não migrar
**O que faz:** Gera vídeo curto de uma cena (image-to-video) usando Replicate. Tenta dois modelos em sequência com retry: `wan-video/wan-2.2-i2v-fast` → `kwaivgi/kling-v1.6-standard`. Persiste o vídeo no bucket `production-media`.

**Env:** `REPLICATE_API_TOKEN`

**API:** Replicate direta (`https://api.replicate.com/v1/models/{model}/predictions`)

---

## Banco de Dados (Supabase PostgreSQL)

Tabelas principais:
- `profiles` — usuários (alunos, professores, diretores) com `ano_escolar`, `role`
- `activities` — atividades geradas (história + exercícios)
- `activity_results` — resultados por exercício com `habilidade_bncc`, `descritor_saeb`
- `books` — livrinhos gerados
- `saeb_descritores` — descritores D1–D15 por ano escolar (migração: `20260407000000_saeb_descritores.sql`)
- `student_saeb_performance` — desempenho por aluno × descritor SAEB

Storage buckets:
- `book-images` — imagens das páginas do livrinho
- `production-media` — áudios TTS e vídeos de cena

---

## O que já está implementado

- Geração completa de história + exercícios (5 tipos) alinhada à BNCC
- 15+ gêneros textuais com instruções pedagógicas específicas
- Diferenciação por ano escolar (1-2º, 3-4º, 5º)
- Exercício de leitura em voz alta com análise automática (GravadorLeitura + analyze-leitura)
- Livrinho ilustrado de 4 páginas com imagens geradas por IA
- TTS com ElevenLabs para narração das histórias
- Geração de vídeo de cena (Replicate: wan-video + kling)
- Narração estruturada com legendas por cena (generate-scene-narration)
- Atividades offline para professores (generate-vivenciando)
- Dashboard com múltiplas abas (desempenho, habilidades BNCC, etc.)
- Tabelas SAEB no banco: `saeb_descritores` e `student_saeb_performance` (migração aplicada em 2026-04-07)
- Sistema de XP, conquistas e gamificação
- Estante de livrinhos por aluno
- Autenticação Supabase com múltiplos roles

---

## O que está PENDENTE

### PRIORIDADE 1 — Migrar gateway Lovable para Google Gemini direto

**Problema:** As 6 edge functions com IA de texto/imagem usam `https://ai.gateway.lovable.dev/v1/chat/completions` com `LOVABLE_API_KEY`. Esse gateway pode ser descontinuado/cobrado pelo Lovable. A meta é chamar a API do Google Gemini diretamente.

**Funções afetadas:**
1. `generate-atividade` — modelo `google/gemini-3-flash-preview`
2. `generate-livrinho` — modelos `google/gemini-3-flash-preview` (texto) + `google/gemini-2.5-flash-image` (imagens)
3. `generate-story-image` — modelo `google/gemini-3.1-flash-image-preview`
4. `analyze-leitura` — modelo `google/gemini-3-flash-preview`
5. `generate-vivenciando` — modelo `google/gemini-2.5-flash`
6. `generate-scene-narration` — modelo `google/gemini-2.5-flash`

**Como migrar (texto):**
- Trocar URL: `https://ai.gateway.lovable.dev/v1/chat/completions` → `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- Trocar chave: `LOVABLE_API_KEY` → `GEMINI_API_KEY`
- Trocar model names: remover prefixo `google/` (ex: `gemini-2.0-flash` em vez de `google/gemini-3-flash-preview`)
- O formato da requisição é idêntico (OpenAI-compatible), sem outras mudanças

**Como migrar (imagens — generate-livrinho + generate-story-image):**
- O gateway Lovable retorna imagens em `choices[0].message.images[0].image_url.url` (formato proprietário)
- A API nativa do Gemini com geração de imagem usa um endpoint diferente: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent`
- O campo de resposta é `response.candidates[0].content.parts[]` — procurar `part.inlineData.data` (base64) + `part.inlineData.mimeType`
- Precisará adaptar o parser de resposta de imagem nessas duas funções

**Env vars necessárias no Supabase:**
```
GEMINI_API_KEY=<sua chave do Google AI Studio>
ELEVENLABS_API_KEY=<chave ElevenLabs>
ELEVENLABS_VOICE_ID=<opcional, default: Xb7hH8MSUJpSbSDYk0k2>
REPLICATE_API_TOKEN=<chave Replicate>
```
Remover `LOVABLE_API_KEY` após migração completa.

---

### PRIORIDADE 2 — Dashboard SAEB (Prontidão SAEB)

Banco já foi migrado. Falta:
- Aba "Prontidão SAEB" no Dashboard.tsx com heatmap D1–D15
- Trigger BNCC → Descritor SAEB no banco (preencher `descritor_saeb` automaticamente em `activity_results`)
- Motor de recomendação: modo SAEB para 5º ano nos meses próximos a novembro
- Seção "Meu Plano de Melhoria" na tela do aluno
- Relatório PDF exportável por aluno (jsPDF)

---

## Avisos Importantes

- **Não alterar** `elevenlabs-tts` nem `generate-scene-video` — usam APIs próprias (ElevenLabs e Replicate) e funcionam
- **Modelo de imagem:** O gateway usava nomes proprietários (`google/gemini-2.5-flash-image`). Na API do Gemini o modelo equivalente atual é `gemini-2.0-flash-exp-image-generation` — confirmar disponibilidade antes de migrar
- **Fallback de imagem:** Todas as funções de imagem têm fallback para `placehold.co` quando a geração falha — manter esse comportamento na migração
- **Timeout:** `generate-livrinho` usa `IMAGE_TIMEOUT_MS = 18000ms` e `IMAGE_ATTEMPTS = 2` por imagem — respeitar esses parâmetros na migração
- **Formato JSON:** Todas as funções fazem `content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()` antes de parsear — manter esse sanitize pois Gemini às vezes envolve JSON em fences
