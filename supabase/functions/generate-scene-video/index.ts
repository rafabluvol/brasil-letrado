import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// fal.ai models to try (image-to-video)
const FAL_MODELS = [
  "fal-ai/minimax/video-01/image-to-video",
  "fal-ai/kling-video/v1.6/standard/image-to-video",
];

const BUCKET = "production-media";

// Upload external media to Supabase Storage and return permanent public URL
async function persistToStorage(
  externalUrl: string,
  userId: string,
  type: "video" | "audio",
): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Download the external file
  const res = await fetch(externalUrl);
  if (!res.ok) throw new Error(`Failed to download ${type}: ${res.status}`);
  const blob = await res.blob();

  // Determine extension from content-type
  const ct = res.headers.get("content-type") || "";
  let ext = type === "video" ? "mp4" : "mp3";
  if (ct.includes("webm")) ext = "webm";
  if (ct.includes("wav")) ext = "wav";
  if (ct.includes("ogg")) ext = "ogg";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt, requestId, userId } = await req.json();

    // Poll for result if requestId provided
    if (requestId && typeof requestId === "string") {
      return await pollFalResult(requestId, userId);
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return jsonResponse({ error: "imageUrl is required" }, 400);
    }

    const falKey = Deno.env.get("FAL_KEY");
    if (!falKey) {
      throw new Error("FAL_KEY is not configured");
    }

    const basePrompt = typeof prompt === "string" && prompt.trim().length > 0
      ? prompt.trim()
      : "Gentle animation of a children's book illustration";

    const animationPrompt = `${basePrompt}. Animate the subjects with visible body motion, blinking, gestures, and environmental motion. Do NOT just zoom or pan the still frame.`;

    let lastError = "";

    for (const model of FAL_MODELS) {
      try {
        console.log(`Trying fal.ai model: ${model}`);

        const input: Record<string, unknown> = {
          prompt: animationPrompt,
        };

        if (model.includes("minimax")) {
          input.first_frame_image_url = imageUrl;
          input.prompt_optimizer = true;
        } else {
          input.start_image_url = imageUrl;
          input.duration = "5";
          input.cfg_scale = 0.7;
        }

        const submitRes = await fetch(`https://queue.fal.run/${model}`, {
          method: "POST",
          headers: {
            Authorization: `Key ${falKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!submitRes.ok) {
          const body = await safeReadText(submitRes);
          console.warn(`fal.ai ${model} error ${submitRes.status}: ${body}`);
          if (submitRes.status === 402 || submitRes.status === 401) {
            lastError = body;
            continue;
          }
          lastError = body;
          continue;
        }

        const submitData = await submitRes.json();
        console.log(`fal.ai submitted:`, JSON.stringify(submitData));

        // If result is already available (synchronous)
        if (submitData.video || submitData.output) {
          const videoUrl = extractFalVideoUrl(submitData);
          if (videoUrl) {
            // Persist to storage
            const permanentUrl = await tryPersist(videoUrl, userId, "video");
            return jsonResponse({ videoUrl: permanentUrl, status: "succeeded" });
          }
        }

        // Return request_id for polling
        const reqId = submitData.request_id;
        if (reqId) {
          return jsonResponse({
            requestId: `${model}::${reqId}`,
            status: "processing",
          });
        }

        lastError = "No request_id returned";
        continue;
      } catch (modelError) {
        console.warn(`fal.ai ${model} failed:`, modelError);
        lastError = modelError instanceof Error ? modelError.message : String(modelError);
        continue;
      }
    }

    // Fallback: try Replicate
    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (replicateToken) {
      try {
        console.log("Falling back to Replicate...");
        const result = await tryReplicate(imageUrl, animationPrompt, replicateToken, userId);
        if (result) return jsonResponse(result);
      } catch (repErr) {
        console.warn("Replicate fallback failed:", repErr);
        lastError = repErr instanceof Error ? repErr.message : String(repErr);
      }
    }

    // Detect credit/billing exhaustion across all providers
    const isCreditIssue = /exhaust|locked|insufficient|402|billing|quota/i.test(lastError);
    const status = isCreditIssue ? 429 : 500;
    const code = isCreditIssue ? "INSUFFICIENT_CREDIT" : "ALL_MODELS_FAILED";
    return jsonResponse({ error: lastError, code }, status);
  } catch (error) {
    console.error("generate-scene-video error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    const isCreditIssue = /exhaust|locked|insufficient|402|billing|quota/i.test(msg);
    return jsonResponse(
      { error: msg, code: isCreditIssue ? "INSUFFICIENT_CREDIT" : "UNKNOWN" },
      isCreditIssue ? 429 : 500,
    );
  }
});

async function tryPersist(url: string, userId: string | undefined, type: "video" | "audio"): Promise<string> {
  if (!userId) return url; // Can't persist without userId
  try {
    return await persistToStorage(url, userId, type);
  } catch (e) {
    console.warn(`Failed to persist ${type} to storage, using external URL:`, e);
    return url; // Fallback to external URL if upload fails
  }
}

async function pollFalResult(requestId: string, userId?: string): Promise<Response> {
  const falKey = Deno.env.get("FAL_KEY");
  if (!falKey) {
    return jsonResponse({ error: "FAL_KEY not configured" }, 500);
  }

  const sepIdx = requestId.indexOf("::");
  if (sepIdx === -1) {
    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (replicateToken) {
      return await checkReplicateStatus(requestId, replicateToken, userId);
    }
    return jsonResponse({ error: "Invalid requestId format" }, 400);
  }

  const model = requestId.slice(0, sepIdx);
  const reqId = requestId.slice(sepIdx + 2);

  const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${reqId}/status`, {
    headers: { Authorization: `Key ${falKey}` },
  });

  if (!statusRes.ok) {
    const body = await safeReadText(statusRes);
    return jsonResponse({ error: `Status check failed: ${body}` }, statusRes.status);
  }

  const statusData = await statusRes.json();
  console.log("fal.ai status:", JSON.stringify(statusData));

  if (statusData.status === "COMPLETED") {
    const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${reqId}`, {
      headers: { Authorization: `Key ${falKey}` },
    });

    if (resultRes.ok) {
      const resultData = await resultRes.json();
      const videoUrl = extractFalVideoUrl(resultData);
      if (videoUrl) {
        const permanentUrl = await tryPersist(videoUrl, userId, "video");
        return jsonResponse({ videoUrl: permanentUrl, status: "succeeded", requestId });
      }
    }
    return jsonResponse({ status: "succeeded", error: "Could not extract video URL", requestId });
  }

  if (statusData.status === "FAILED") {
    return jsonResponse({
      requestId,
      status: "failed",
      error: statusData.error || "Generation failed",
    });
  }

  return jsonResponse({ requestId, status: "processing" });
}

function extractFalVideoUrl(data: any): string | null {
  if (data?.video?.url) return data.video.url;
  if (data?.output?.video?.url) return data.output.video.url;
  if (typeof data?.video === "string") return data.video;
  if (typeof data?.output === "string") return data.output;
  if (Array.isArray(data?.output) && typeof data.output[0] === "string") return data.output[0];
  return null;
}

// --- Replicate fallback ---

async function tryReplicate(imageUrl: string, prompt: string, token: string, userId?: string) {
  const modelUrl = "https://api.replicate.com/v1/models/kwaivgi/kling-v1.6-standard/predictions";
  const input = {
    prompt,
    start_image: imageUrl,
    duration: 5,
    cfg_scale: 0.7,
  };

  const res = await fetch(modelUrl, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=10",
    },
    body: JSON.stringify({ input }),
  });

  if (res.status === 402) {
    console.warn("Replicate 402 - insufficient credit");
    return null;
  }

  if (!res.ok) {
    const body = await safeReadText(res);
    console.warn(`Replicate error ${res.status}: ${body}`);
    return null;
  }

  const data = await res.json();
  if (data.status === "succeeded" && data.output) {
    const url = typeof data.output === "string" ? data.output : Array.isArray(data.output) ? data.output[0] : null;
    if (url) {
      const permanentUrl = await tryPersist(url, userId, "video");
      return { videoUrl: permanentUrl, status: "succeeded" };
    }
    return { videoUrl: url, status: "succeeded" };
  }

  if (data.id) {
    return { requestId: data.id, status: "processing" };
  }

  return null;
}

async function checkReplicateStatus(predictionId: string, token: string, userId?: string): Promise<Response> {
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
    return jsonResponse({ videoUrl: url, status: "succeeded", requestId: predictionId });
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
