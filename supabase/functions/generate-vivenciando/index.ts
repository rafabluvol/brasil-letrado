import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { titulo, historia_texto, ano, genero } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `Você é um pedagogo criativo especialista em educação infantil brasileira (${ano}º ano do ensino fundamental).

Baseado na história "${titulo}" (gênero: ${genero}):
${historia_texto ? `Resumo da história: ${historia_texto.slice(0, 800)}` : ""}

Gere EXATAMENTE 10 ideias criativas de atividades FORA DAS TELAS para professores fazerem com os alunos em sala de aula, baseadas nesta história. As ideias devem ser variadas e incluir coisas como:
- Teatrinho / dramatização
- Roda de conversa / discussão  
- Trabalho em grupos
- Concurso de desenho
- Moral da história / reflexão
- Jogo de tabuleiro temático
- Caça ao tesouro de palavras
- Música / paródia
- Recorte e colagem
- Brincadeira ao ar livre

Para cada ideia, forneça:
1. Um título criativo e divertido
2. Uma descrição curta (1-2 frases)
3. Um passo a passo detalhado com 5-7 passos claros para o professor executar

Responda APENAS com JSON válido no formato:
{
  "ideias": [
    {
      "titulo": "Nome da Atividade",
      "descricao": "Descrição curta da atividade",
      "passos": ["Passo 1...", "Passo 2...", "Passo 3...", "Passo 4...", "Passo 5..."]
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "Você é um pedagogo criativo. Responda apenas em JSON válido." }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    let content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean markdown fences
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
