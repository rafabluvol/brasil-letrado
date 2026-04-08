import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { textoOriginal, transcricaoAluno, trechoDestaque, ano } = await req.json();

    if (!textoOriginal || !transcricaoAluno) {
      return new Response(
        JSON.stringify({ error: "textoOriginal e transcricaoAluno são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompt = `Você é a tutora inteligente do Brasil Letrado, uma plataforma que ajuda crianças do ${ano || "3"}º ano a melhorar a leitura em português.

Você recebeu dois textos:
1. TEXTO ORIGINAL: o que o aluno deveria ter lido
2. TRANSCRIÇÃO DO ALUNO: o que o reconhecimento de voz captou da leitura do aluno

Analise a leitura e retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "nota": 4-5,
  "status": "excelente" | "muito_bom" | "bom",
  "emoji": "emoji positivo que represente o resultado (NÃO use emoji de pássaro vermelho)",
  "mensagem_principal": "frase curta e encorajadora começando com 'Piu-Piu!' parabenizando o aluno (máx 2 linhas, sem usar negrito/markdown)",
  "pontos_positivos": ["até 3 coisas que o aluno fez bem - texto simples sem negrito"],
  "pontos_melhoria": ["até 3 sugestões gentis para melhorar - texto simples sem negrito"],
  "dica_especial": "uma dica prática e divertida para melhorar a leitura (sem negrito/markdown)",
  "palavras_dificeis": ["palavras que o aluno pode ter errado ou pulado"],
  "precisao_estimada": 60-100,
  "deve_repetir": false,
  "leitura_incompleta": true/false
}

REGRAS IMPORTANTES:
- O aluno SEMPRE passa no exercício. A nota mínima é 4.
- Comece SEMPRE a mensagem_principal com "Piu-Piu!" (NUNCA "Pio-Pio")
- NÃO use formatação markdown (**, *, etc) em nenhum campo de texto
- NÃO use emoji de pássaro vermelho 🐦. Use emojis como ⭐, 🌟, 👏, 🎉, 📖
- Seja SEMPRE encorajador, positivo e gentil, nunca punitivo
- Use linguagem simples adequada para criança do ${ano || "3"}º ano
- Mesmo que a transcrição esteja diferente, parabenize o esforço e dê dicas de melhoria em tom positivo
- Se a transcrição cobrir menos de 50% do texto original, defina "leitura_incompleta": true e na dica_especial sugira gentilmente tentar ler o texto completo
- Dê nota 5 se estiver quase perfeito, 4 se precisar melhorar
- "deve_repetir" deve ser SEMPRE false
- Os pontos de melhoria devem ser sugestões gentis, nunca críticas`;

    const userMessage = `TEXTO ORIGINAL (trecho para leitura):
"${trechoDestaque || textoOriginal}"

TEXTO COMPLETO DE REFERÊNCIA:
"${textoOriginal}"

TRANSCRIÇÃO DO ALUNO:
"${transcricaoAluno}"

Analise a leitura do aluno e dê feedback.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao analisar leitura" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return new Response(JSON.stringify({ error: "Resposta vazia da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const feedback = JSON.parse(cleaned);

    return new Response(JSON.stringify(feedback), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-leitura error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
