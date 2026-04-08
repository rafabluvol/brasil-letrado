import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSceneVideoGeneration = () => {
  const [videoUrls, setVideoUrls] = useState<(string | null)[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videosReady, setVideosReady] = useState(0);
  const abortRef = useRef(false);
  const inProgressRef = useRef<Set<number>>(new Set());

  /**
   * Dispara geração de vídeo em BACKGROUND assim que a imagem fica pronta.
   * Não bloqueia a UI. Faz polling silencioso e salva no cache.
   */
  const generateInBackground = useCallback(async (
    imageUrl: string,
    sceneDescription: string,
    level: string,
    sceneIndex: number,
    totalScenes: number,
    storyId?: string,
    userId?: string
  ) => {
    if (inProgressRef.current.has(sceneIndex)) return;
    inProgressRef.current.add(sceneIndex);

    try {
      // 1. Start video generation
      const { data, error } = await supabase.functions.invoke("generate-scene-video", {
        body: {
          imageUrl,
          prompt: sceneDescription,
          userId,
        },
      });

      if (error || data?.error) {
        console.warn(`[BG Video] Scene ${sceneIndex} start error:`, error || data?.error);
        return;
      }

      // If video is immediately ready
      if (data?.videoUrl) {
        setVideoUrls(prev => {
          const next = [...prev];
          while (next.length <= sceneIndex) next.push(null);
          next[sceneIndex] = data.videoUrl;
          return next;
        });
        setVideosReady(prev => prev + 1);
        console.log(`[BG Video] Scene ${sceneIndex} ready immediately!`);

        // Cache it
        if (storyId) {
          supabase.from("story_video_cache" as any).upsert({
            story_id: storyId,
            image_index: sceneIndex,
            video_url: data.videoUrl,
          } as any, { onConflict: "story_id,image_index" }).then(() => {});
        }
        return;
      }

      if (!data?.requestId) return;
      const requestId = data.requestId;

      // 2. Silent polling (max 5 min)
      for (let i = 0; i < 60; i++) {
        if (abortRef.current) return;
        await new Promise(r => setTimeout(r, 5000));

        const { data: status } = await supabase.functions.invoke("generate-scene-video", {
          body: { requestId, userId },
        });

        if (status?.videoUrl || status?.status === "succeeded") {
          const url = status.videoUrl || (typeof status.output === "string" ? status.output : null);
          if (url) {
            setVideoUrls(prev => {
              const next = [...prev];
              while (next.length <= sceneIndex) next.push(null);
              next[sceneIndex] = url;
              return next;
            });
            setVideosReady(prev => prev + 1);
            console.log(`[BG Video] Scene ${sceneIndex} ready!`);

            // Cache it
            if (storyId) {
              supabase.from("story_video_cache" as any).upsert({
                story_id: storyId,
                image_index: sceneIndex,
                video_url: url,
              } as any, { onConflict: "story_id,image_index" }).then(() => {});
            }
          }
          return;
        }

        if (status?.status === "failed" || status?.status === "canceled") {
          console.warn(`[BG Video] Scene ${sceneIndex} failed`);
          return;
        }
      }
    } catch (err) {
      console.warn(`[BG Video] Scene ${sceneIndex} error:`, err);
    } finally {
      inProgressRef.current.delete(sceneIndex);
    }
  }, []);

  /**
   * Disparar geração de uma cena individual assim que sua imagem fica pronta.
   */
  const generateSingleInBackground = useCallback((
    imageUrl: string,
    description: string,
    level: string,
    sceneIndex: number,
    totalScenes: number,
    storyId?: string,
    userId?: string
  ) => {
    setIsGenerating(true);
    if (abortRef.current) abortRef.current = false;

    // Ensure array is big enough
    setVideoUrls(prev => {
      if (prev.length < totalScenes) {
        const next = [...prev];
        while (next.length < totalScenes) next.push(null);
        return next;
      }
      return prev;
    });

    generateInBackground(imageUrl, description, level, sceneIndex, totalScenes, storyId, userId);
  }, [generateInBackground]);

  /**
   * Check cache for existing videos.
   */
  const checkCache = useCallback(async (storyId: string): Promise<(string | null)[]> => {
    const { data } = await supabase
      .from("story_video_cache" as any)
      .select("image_index, video_url")
      .eq("story_id", storyId)
      .order("image_index");

    if (!data?.length) return [];

    const cached: (string | null)[] = [];
    (data as any[]).forEach((row: any) => {
      while (cached.length <= row.image_index) cached.push(null);
      cached[row.image_index] = row.video_url;
    });

    setVideoUrls(cached);
    setVideosReady(cached.filter(Boolean).length);
    return cached;
  }, []);

  const cancel = useCallback(() => { abortRef.current = true; }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    inProgressRef.current.clear();
    setVideoUrls([]);
    setVideosReady(0);
    setIsGenerating(false);
    // Allow restart
    setTimeout(() => { abortRef.current = false; }, 100);
  }, []);

  return {
    generateSingleInBackground,
    generateInBackground,
    checkCache,
    cancel,
    reset,
    videoUrls,
    isGenerating,
    videosReady,
  };
};
