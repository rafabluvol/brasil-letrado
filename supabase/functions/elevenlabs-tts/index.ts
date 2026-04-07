import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BUCKET = "production-media";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, voiceId, userId, persist } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: "ElevenLabs API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const selectedVoice = voiceId || Deno.env.get("ELEVENLABS_VOICE_ID") || "Xb7hH8MSUJpSbSDYk0k2";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
            speed: 0.9,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);

      let status = response.status;
      let code = "ELEVENLABS_API_ERROR";
      let message = `ElevenLabs API error (${response.status})`;

      try {
        const parsed = JSON.parse(errorText);
        const providerStatus = parsed?.detail?.status;
        const providerMessage = parsed?.detail?.message;

        if (providerStatus === "quota_exceeded") {
          status = 429;
          code = "QUOTA_EXCEEDED";
          message = "Voice narration is temporarily unavailable because the provider quota has been exceeded.";
        } else if (providerStatus === "detected_unusual_activity") {
          status = 429;
          code = "PROVIDER_REJECTED";
          message = "Voice narration is temporarily unavailable because the provider rejected the request.";
        } else if (providerMessage) {
          message = providerMessage;
        }
      } catch {
        message = `ElevenLabs API error (${response.status}): ${errorText}`;
      }

      return new Response(
        JSON.stringify({ error: message, code }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    // If persist=true and userId provided, save to permanent storage and return URL
    if (persist && userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceKey);

        const filename = `${userId}/audio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp3`;
        const blob = new Blob([audioBuffer], { type: "audio/mpeg" });

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(filename, blob, { contentType: "audio/mpeg", upsert: false });

        if (uploadErr) {
          console.warn("Audio upload failed, returning raw audio:", uploadErr.message);
        } else {
          const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
          return new Response(
            JSON.stringify({ audioUrl: publicData.publicUrl }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } catch (e) {
        console.warn("Failed to persist audio:", e);
      }
    }

    // Default: return raw audio bytes
    return new Response(audioBuffer, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });
  } catch (e) {
    console.error("elevenlabs-tts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
