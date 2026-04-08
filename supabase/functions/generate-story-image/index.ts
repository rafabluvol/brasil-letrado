import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMAGE_TIMEOUT_MS = 55000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, bookId, pageNumber, characterSheet, targetWidth, targetHeight } = await req.json();
    if (!description) {
      return new Response(JSON.stringify({ error: "description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine aspect ratio instruction from container dimensions
    let aspectInstruction = "The image should be landscape oriented (roughly 3:2 ratio).";
    if (targetWidth && targetHeight) {
      const ratio = targetWidth / targetHeight;
      if (ratio > 1.3) aspectInstruction = `The image MUST be landscape oriented with exact aspect ratio ${targetWidth}:${targetHeight} (roughly ${ratio.toFixed(1)}:1 width to height).`;
      else if (ratio < 0.8) aspectInstruction = `The image MUST be portrait oriented with exact aspect ratio ${targetWidth}:${targetHeight}.`;
      else aspectInstruction = `The image MUST be roughly square with aspect ratio ${targetWidth}:${targetHeight}.`;
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const imagePrompt = `Generate a WIDE LANDSCAPE children's book illustration. CRITICAL: The output image MUST be in WIDE PANORAMIC LANDSCAPE orientation - the width MUST be at least 2x the height (like a movie theater screen). DO NOT generate a square or portrait image under any circumstances.

${characterSheet ? `CHARACTER REFERENCE (draw these characters EXACTLY as described): ${characterSheet}. ` : ""}Scene: ${description}.

Style: colorful watercolor, fairy tale illustration, whimsical, cute characters, warm colors, suitable for children ages 6-10. No text in the image. All characters and important elements must be centered in the middle 60% of the frame with generous safe margins. Keep character appearances perfectly consistent across scenes.`;

    const imgResponse = await withTimeout(
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
            generationConfig: { responseModalities: ["Text", "Image"] },
          }),
        }
      ),
      IMAGE_TIMEOUT_MS,
    );

    if (imgResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Try again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!imgResponse.ok) {
      throw new Error(`Image generation failed: ${imgResponse.status}`);
    }

    const imgData = await withTimeout(imgResponse.json(), IMAGE_TIMEOUT_MS);
    const parts = imgData?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData);
    const base64Url = imagePart
      ? `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
      : undefined;

    if (!base64Url || !base64Url.startsWith("data:image/")) {
      // Return a placeholder
      const label = encodeURIComponent(`Scene ${pageNumber || 1}`);
      return new Response(JSON.stringify({ imageUrl: `https://placehold.co/1024x1024/png?text=${label}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload to storage if bookId provided
    if (bookId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const matches = base64Url.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const base64Data = matches[2];
        const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const filePath = `${bookId}/page-${pageNumber || 1}.${ext}`;

        const { error } = await supabase.storage
          .from("book-images")
          .upload(filePath, bytes, { contentType: `image/${ext}`, upsert: true });

        if (!error) {
          const { data: urlData } = supabase.storage.from("book-images").getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            return new Response(JSON.stringify({ imageUrl: urlData.publicUrl }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    // Fallback: return base64 directly
    return new Response(JSON.stringify({ imageUrl: base64Url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-story-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
