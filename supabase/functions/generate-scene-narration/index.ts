import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { sceneText, sceneTextEn, sceneIndex, totalScenes, level } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    if (!sceneText || typeof sceneText !== "string") {
      return new Response(JSON.stringify({ error: "sceneText is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const systemPrompt = `You are a narrator for children's stories. Generate structured narration data as JSON.
Return ONLY valid JSON with this structure:
{
  "subtitles": [
    {
      "text_pt": "Texto em português",
      "text_en": "Text in English",
      "display_seconds": 3.5
    }
  ],
  "narration_text": "Full Portuguese text to be spoken by TTS",
  "narration_text_en": "Full English text"
}

Rules:
- Split into 2-4 subtitle segments of ~8-15 words each
- display_seconds should match reading pace for children (age ${level || "7-9"})
- narration_text is the EXACT concatenation of all text_pt segments
- Keep it engaging and expressive
- The narration should feel warm, dramatic and exciting for children`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Scene ${(sceneIndex || 0) + 1}/${totalScenes || 4}.\nPortuguês: ${sceneText}${sceneTextEn ? `\nEnglish: ${sceneTextEn}` : ""}` }],
            },
          ],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const narrationData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!narrationData) throw new Error("Failed to parse narration JSON");

    return new Response(JSON.stringify(narrationData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-scene-narration error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
