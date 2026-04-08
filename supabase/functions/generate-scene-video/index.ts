import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// PRIMARY: Replicate WAN (cheapest ~$0.10/scene)
const REPLICATE_MODELS = [
  "wan-video/wan-2.2-i2v-fast",
  "kwaivgi/kling-v1.6-standard",
];

const BUCKET = "production-media";

async function persistToStorage(
  externalUrl: string,
  userId: string,
  type: "video" | "audio",
): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const res = await fetch(externalUrl);
  if (!res.ok) throw new Error(`Failed to download ${type}: ${res.status}`);
  const blob = await res.blob();

  const ct = res.headers.get("content-type") || "";
  let ext = type === "video" ? "mp4" : "mp3";
  if (ct.includes("webm")) ext = "webm";

  const filename = `${userId}/${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, {
      contentType: ct || (type === "video" ? "video/mp4" : "audio/mpeg"),
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return publicData.publicUrl;
}

async function tryPersist(url: string, userId: string | undefined, type: "video" | "audio"): Promise<string> {
  if (!userId) return url;
  try {
    return await persistToStorage(url, userId, type);
  } catch (e) {
    console.warn(`Failed to persist ${type} to storage, using external URL:`, e);
    return url;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt, requestId, userId } = await req.json();

    // Poll for result if requestId provided
    if (requestId && typeof requestId === "string") {
      return await checkReplicateStatus(requestId, userId);
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return jsonResponse({ error: "imageUrl is required" }, 400);
    }

    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (!replicateToken) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    const basePrompt = typeof prompt === "string" && prompt.trim().length > 0
      ? prompt.trim()
      : "Gentle animation of a children's book illustration";

    const animationPrompt = `${basePrompt}. Animate the subjects with visible body motion, blinking, gestures, and environmental motion. Do NOT just zoom or pan the still frame.`;

    let lastError = "";

    // PRIMARY: Replicate (WAN first, then Kling) with 429 retry
    for (const model of REPLICATE_MODELS) {
      let retries = 0;
      const maxRetries = 3;

      while (retries <= maxRetries) {
        try {
          console.log(`Trying Replicate model: ${model} (attempt ${retries + 1})`);
          const modelUrl = `https://api.replicate.com/v1/models/${model}/predictions`;

          const input: Record<string, unknown> = { prompt: animationPrompt };
          if (model.includes("wan")) {
            input.image = imageUrl;
            input.num_frames = 81;
            input.resolution = "480p";
            input.aspect_ratio = "16:9";
            input.go_fast = true;
            input.frames_per_second = 16;
            input.sample_shift = 8;
          } else {
            input.start_image = imageUrl;
            input.duration = 5;
            input.cfg_scale = 0.7;
          }

          const res = await fetch(modelUrl, {
            method: "POST",
            headers: {
              Authorization: `Token ${replicateToken}`,
              "Content-Type": "application/json",
              Prefer: "wait=55",
            },
            body: JSON.stringify({ input }),
          });

          if (res.status === 402) {
            const body = await safeReadText(res);
            console.warn(`Replicate ${model} - 402 insufficient credit`);
            lastError = body;
            break; // Next model
          }

          if (res.status === 429) {
            const body = await safeReadText(res);
            let waitSec = 12;
            try { const p = JSON.parse(body); if (p.retry_after) waitSec = Math.max(p.retry_after + 2, 5); } catch {}
            console.warn(`Replicate ${model} - 429, waiting ${waitSec}s (retry ${retries + 1}/${maxRetries})`);
            lastError = body;
            if (retries < maxRetries) {
              await new Promise(r => setTimeout(r, waitSec * 1000));
              retries++;
              continue;
            }
            break; // Next model
          }

          if (!res.ok) {
            const body = await safeReadText(res);
            console.warn(`Replicate ${model} error ${res.status}: ${body}`);
            lastError = body;
            break; // Next model
          }

          const data = await res.json();
          console.log(`Replicate ${model} response status: ${data.status}, id: ${data.id}`);

          if (data.status === "succeeded" && data.output) {
            const url = typeof data.output === "string" ? data.output : Array.isArray(data.output) ? data.output[0] : null;
            if (url) {
              const permanentUrl = await tryPersist(url, userId, "video");
              return jsonResponse({ videoUrl: permanentUrl, status: "succeeded" });
            }
          }

          if (data.id) {
            return jsonResponse({ requestId: data.id, status: "processing" });
          }

          lastError = "No prediction ID returned";
          break; // Next model
        } catch (err) {
          console.warn(`Replicate ${model} error:`, err);
          lastError = err instanceof Error ? err.message : String(err);
          break; // Next model
        }
      }
    }

    const isCreditIssue = /exhaust|locked|insufficient|402|billing|quota|throttle/i.test(lastError);
    return jsonResponse(
      { error: lastError, code: isCreditIssue ? "INSUFFICIENT_CREDIT" : "ALL_MODELS_FAILED" },
      isCreditIssue ? 429 : 500,
    );
  } catch (error) {
    console.error("generate-scene-video error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: msg, code: "UNKNOWN" }, 500);
  }
});

async function checkReplicateStatus(predictionId: string, userId?: string): Promise<Response> {
  const token = Deno.env.get("REPLICATE_API_TOKEN");
  if (!token) return jsonResponse({ error: "REPLICATE_API_TOKEN not configured" }, 500);

  const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
    headers: { Authorization: `Token ${token}` },
  });

  if (!res.ok) {
    const body = await safeReadText(res);
    return jsonResponse({ error: `Prediction status error: ${body}` }, res.status);
  }

  const data = await res.json();
  if (data.status === "succeeded" && data.output) {
    const url = typeof data.output === "string" ? data.output : Array.isArray(data.output) ? data.output[0] : null;
    if (url) {
      const permanentUrl = await tryPersist(url, userId, "video");
      return jsonResponse({ videoUrl: permanentUrl, status: "succeeded", requestId: predictionId });
    }
  }
  if (data.status === "failed" || data.status === "canceled") {
    return jsonResponse({ requestId: predictionId, status: data.status, error: data.error || "Failed" });
  }
  return jsonResponse({ requestId: predictionId, status: "processing" });
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function safeReadText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ""; }
}
