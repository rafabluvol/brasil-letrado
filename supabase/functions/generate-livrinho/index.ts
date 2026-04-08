import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMAGE_TIMEOUT_MS = 18000;
const IMAGE_ATTEMPTS = 2;

type StoryPage = {
  numero: number;
  titulo: string;
  texto: string;
  descricaoImagem: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
  ]);
}

function createFallbackImageUrl(titulo: string, numero: number) {
  const label = encodeURIComponent(`${titulo} - Cena ${numero}`);
  return `https://placehold.co/1024x1024/png?text=${label}`;
}

function buildFallbackStory(titulo: string, texto: string, ano: string) {
  const frases = texto
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);

  const chunkSize = Math.max(1, Math.ceil(frases.length / 4));
  const titulos = ["Começo", "Aventura", "Descoberta", "Final Feliz"];

  const paginas: StoryPage[] = Array.from({ length: 4 }, (_, i) => {
    const inicio = i * chunkSize;
    const fim = inicio + chunkSize;
    const bloco = frases.slice(inicio, fim).join(" ");

    return {
      numero: i + 1,
      titulo: `Cena ${i + 1}: ${titulos[i]}`,
      texto:
        bloco ||
        `Esta é a cena ${i + 1} da história, adaptada para crianças do ${ano}º ano com linguagem clara e divertida.`,
      descricaoImagem: `Children's storybook illustration for scene ${i + 1}, colorful, whimsical, warm lighting, expressive characters, no text.`,
    };
  });

  return {
    tituloLivro: titulo,
    resumo: texto.slice(0, 180),
    paginas,
  };
}

function normalizePaginas(rawPaginas: unknown, ano: string): StoryPage[] {
  const paginas = Array.isArray(rawPaginas) ? rawPaginas : [];

  return Array.from({ length: 4 }, (_, i) => {
    const item = paginas[i] as Partial<StoryPage> | undefined;

    return {
      numero: i + 1,
      titulo: item?.titulo?.trim() || `Cena ${i + 1}`,
      texto:
        item?.texto?.trim() ||
        `Página ${i + 1} do livrinho para ${ano}º ano com começo, meio e fim bem definidos.`,
      descricaoImagem:
        item?.descricaoImagem?.trim() ||
        `Children's book illustration for scene ${i + 1}, watercolor style, colorful, cute characters, no text.`,
    };
  });
}

async function generateImage(apiKey: string, description: string): Promise<string> {
  for (let attempt = 0; attempt < IMAGE_ATTEMPTS; attempt++) {
    try {
      const imgResponse = await withTimeout(
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `Generate a children's book page illustration: ${description}. Style: colorful watercolor, fairy tale illustration, whimsical, cute characters, warm colors, suitable for children ages 6-10. No text in the image.` }],
                },
              ],
              generationConfig: { responseModalities: ["Text", "Image"] },
            }),
          }
        ),
        IMAGE_TIMEOUT_MS,
      );

      if (imgResponse.status === 429) {
        console.log(`Rate limited on attempt ${attempt + 1}.`);
        await sleep(1200 * (attempt + 1));
        continue;
      }

      if (!imgResponse.ok) {
        console.log(`Image generation attempt ${attempt + 1} failed with status ${imgResponse.status}.`);
        await sleep(800);
        continue;
      }

      const imgData = await withTimeout(imgResponse.json(), IMAGE_TIMEOUT_MS);
      const parts = imgData?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData);
      if (imagePart) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
    } catch (err) {
      console.error(`Image generation attempt ${attempt + 1} failed:`, err);
    }
  }

  return "";
}

async function uploadBase64ToStorage(supabase: any, base64Url: string, path: string): Promise<string> {
  if (!base64Url || !base64Url.startsWith("data:")) return "";

  const matches = base64Url.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!matches) return "";

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const base64Data = matches[2];
  const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

  const filePath = `${path}.${ext}`;
  const { error } = await supabase.storage
    .from("book-images")
    .upload(filePath, bytes, { contentType: `image/${ext}`, upsert: true });

  if (error) {
    console.error("Storage upload error:", error);
    return "";
  }

  const { data: urlData } = supabase.storage.from("book-images").getPublicUrl(filePath);
  return urlData?.publicUrl || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { titulo, texto, genero, ano, autorNome, existingImages } = await req.json();
    const autor = autorNome || "Jovem Autor";
    const hasExistingImages = existingImages && typeof existingImages === "object";

    if (!titulo || !texto) {
      return new Response(JSON.stringify({ error: "titulo e texto são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const storyPrompt = `Você é um escritor de livros infantis. A partir do texto abaixo, crie um livrinho de 4 páginas para crianças do ${ano}º ano.

TEXTO ORIGINAL:
${texto}

Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "tituloLivro": "${titulo}",
  "resumo": "Um breve resumo de 1-2 frases sobre a história",
  "paginas": [
    {
      "numero": 1,
      "titulo": "Título da página (começo)",
      "texto": "Texto da página 1 — o começo da história (3-5 frases curtas, adequadas para ${ano}º ano)",
      "descricaoImagem": "Descrição detalhada em inglês para gerar uma ilustração infantil colorida e lúdica desta cena"
    },
    {
      "numero": 2,
      "titulo": "Título da página (meio 1)",
      "texto": "Texto da página 2",
      "descricaoImagem": "Descrição em inglês para ilustração"
    },
    {
      "numero": 3,
      "titulo": "Título da página (meio 2)",
      "texto": "Texto da página 3",
      "descricaoImagem": "Descrição em inglês para ilustração"
    },
    {
      "numero": 4,
      "titulo": "Título da página (fim)",
      "texto": "Texto da página 4 — o desfecho",
      "descricaoImagem": "Descrição em inglês para ilustração"
    }
  ]
}

REGRAS:
- Mantenha a essência do texto original
- Adapte a linguagem para ${ano}º ano
- Cada página deve ter 3-5 frases
- As descrições de imagem devem ser em INGLÊS e detalhadas
- Estilo visual: ilustração infantil colorida, estilo livro de fábulas, personagens fofos e expressivos
- A história deve ter começo, meio 1, meio 2 e fim claros`;

    const storyResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "Você cria livrinhos infantis encantadores. Retorne apenas JSON válido." }] },
          contents: [{ role: "user", parts: [{ text: storyPrompt }] }],
        }),
      }
    );

    if (!storyResponse.ok) {
      if (storyResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Erro ao gerar história do livrinho");
    }

    const storyData = await storyResponse.json();
    const storyContent = storyData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!storyContent) throw new Error("Resposta vazia ao gerar história");

    let livro: any;
    try {
      const cleaned = storyContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      livro = JSON.parse(cleaned);
    } catch {
      livro = buildFallbackStory(titulo, texto, String(ano || "3"));
    }

    const paginasBase = normalizePaginas(livro?.paginas, String(ano || "3"));
    const bookId = crypto.randomUUID();

    const paginasComImagem = await Promise.all(
      paginasBase.map(async (pagina) => {
        const pageIdx = pagina.numero - 1;
        // Reuse existing image if provided
        if (hasExistingImages && existingImages[String(pageIdx)]) {
          console.log(`Reusing existing image for page ${pagina.numero}`);
          return {
            numero: pagina.numero,
            titulo: pagina.titulo,
            texto: pagina.texto,
            imagemUrl: existingImages[String(pageIdx)],
          };
        }

        console.log(`Generating image for page ${pagina.numero}...`);
        const base64Img = await generateImage(GEMINI_API_KEY, pagina.descricaoImagem);
        const uploadedUrl = base64Img
          ? await uploadBase64ToStorage(supabase, base64Img, `${bookId}/page-${pagina.numero}`)
          : "";

        return {
          numero: pagina.numero,
          titulo: pagina.titulo,
          texto: pagina.texto,
          imagemUrl: uploadedUrl || createFallbackImageUrl(livro?.tituloLivro || titulo, pagina.numero),
        };
      }),
    );

    const resultado = {
      id: bookId,
      titulo: livro?.tituloLivro || titulo,
      autor,
      genero,
      ano,
      capaUrl: paginasComImagem[0]?.imagemUrl || createFallbackImageUrl(livro?.tituloLivro || titulo, 1),
      resumo: livro?.resumo || "",
      paginas: paginasComImagem,
      criadoEm: new Date().toISOString(),
    };

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-livrinho error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
