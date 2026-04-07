import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, Sparkles, Volume2, RefreshCw, Loader2, BookOpen, Play, Pause, SkipForward, RotateCcw, X, Share2, Wand2, ChevronRight, PanelRightOpen, PanelRightClose, Lightbulb } from "lucide-react";
import CinematicScene from "@/components/CinematicScene";
import { useNavigate, useLocation } from "react-router-dom";
import { ATIVIDADE_EXEMPLO, Atividade as AtividadeType, Exercicio, getExercicios, StoryPage } from "@/data/bncc-content";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GravadorLeitura from "@/components/GravadorLeitura";
import { useToast } from "@/hooks/use-toast";
import { trackActivityResult, ActivityResult, getStudentData } from "@/lib/student-tracker";
import { checkNewTrophies, Trophy as TrophyType } from "@/lib/level-system";
import TrophyPopup from "@/components/TrophyPopup";
import { playCorrectSound, playWrongSound, playPipeSound } from "@/lib/sounds";
import ExercicioLigar from "@/components/exercicios/ExercicioLigar";
import ExercicioMemoria from "@/components/exercicios/ExercicioMemoria";
import ExercicioOrdenar from "@/components/exercicios/ExercicioOrdenar";
import ExercicioAberta from "@/components/exercicios/ExercicioAberta";
import ExercicioCompletar from "@/components/exercicios/ExercicioCompletar";
import CuriosidadesLoading from "@/components/CuriosidadesLoading";
import { useExerciseHint } from "@/hooks/useExerciseHint";
import ExerciseHintBubble from "@/components/ExerciseHintBubble";
import ExercicioLeituraTrecho from "@/components/exercicios/ExercicioLeituraTrecho";
import VideoWaitingScreen from "@/components/VideoWaitingScreen";
import ExercicioLacuna from "@/components/exercicios/ExercicioLacuna";
import ExercicioPostVideo from "@/components/exercicios/ExercicioPostVideo";
import ExercicioPrevisao from "@/components/exercicios/ExercicioPrevisao";
import ExercicioForca from "@/components/exercicios/ExercicioForca";
import ExercicioCruzadinha from "@/components/exercicios/ExercicioCruzadinha";
import ExercicioCacaPalavras from "@/components/exercicios/ExercicioCacaPalavras";
import ExercicioVF from "@/components/exercicios/ExercicioVF";
import ExercicioGramaticaCaindo from "@/components/exercicios/ExercicioGramaticaCaindo";
import ExerciseBreadcrumb from "@/components/ExerciseBreadcrumb";
import StoryFrameImage from "@/components/StoryFrameImage";
import ExerciseProgressWrapper from "@/components/ExerciseProgressWrapper";


const CATEGORIA_LABELS: Record<string, { label: string; icon: string; colorClass: string }> = {
  interpretacao: { label: "Interpretação", icon: "📖", colorClass: "bg-primary/10 text-primary" },
  vocabulario: { label: "Vocabulário", icon: "📚", colorClass: "bg-info/10 text-info" },
  gramatica: { label: "Gramática", icon: "✍️", colorClass: "bg-secondary/10 text-secondary" },
};

export default function Atividade() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const [atividade, setAtividade] = useState<AtividadeType>(
    location.state?.atividade || ATIVIDADE_EXEMPLO
  );
  const [currentIdx, setCurrentIdx] = useState(-1); // Always start at -1 (intro/reading phase)
  const [showLeitura, setShowLeitura] = useState(false);
  const [leituraRealizada, setLeituraRealizada] = useState(false);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [pontos, setPontos] = useState(0);
  const [cacaProgress, setCacaProgress] = useState(0);
  const [combo, setCombo] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [generatingBook, setGeneratingBook] = useState(false);
  const exerciseResults = useRef<{ categoria: string; acertou: boolean; exercicioIdx: number }[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const [wonTrophy, setWonTrophy] = useState<TrophyType | null>(null);

  // Story mode states
  const hasStoryMode = !!(atividade.storyPages && atividade.storyPages.length > 0);
  const [revealedPages, setRevealedPages] = useState(0);
  const [exerciseImageRevealed, setExerciseImageRevealed] = useState(false);
  const [showImageInterstitial, setShowImageInterstitial] = useState<number | null>(null); // which image index to show
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [generatingImagePage, setGeneratingImagePage] = useState<number | null>(null);
  const [showScenePlayer, setShowScenePlayer] = useState(false);
  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [showVideoSidebar, setShowVideoSidebar] = useState(false);
  const [showVideoWaiting, setShowVideoWaiting] = useState(true);
  const illustrationRef = useRef<HTMLDivElement | null>(null);

  // Scene archive - stores completed scenes and challenges for sidebar
  const sceneArchive = useRef<{ type: 'scene' | 'challenge'; idx: number; title: string; image?: string; acertou?: boolean }[]>([]);
  const [archiveVersion, setArchiveVersion] = useState(0); // trigger re-renders
  const [selectedArchiveItem, setSelectedArchiveItem] = useState<number | null>(null);
  const firstSceneRef = useRef<{ image: string; description: string } | null>(null);

  // Scene player states
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneAudios, setSceneAudios] = useState<Record<number, string>>({});
  const [sceneVideos, setSceneVideos] = useState<Record<number, string>>({});
  const [sceneRequestIds, setSceneRequestIds] = useState<Record<number, string>>({});
  const [generatingVideos, setGeneratingVideos] = useState<Record<number, boolean>>({});
  const [loadingAudios, setLoadingAudios] = useState<Record<number, boolean>>({});
  const [ttsUnavailable, setTtsUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioGenInProgress = useRef<Set<number>>(new Set());
  const ttsWarningShownRef = useRef(false);
  // Track video generation in progress to avoid duplicates
  const videoGenInProgress = useRef<Set<number>>(new Set());

  // Linear exercise flow — 8 steps total for story mode

  // Both story and non-story modes start at -1 (intro/reading)
  const isStoryMode = hasStoryMode;

  // Detect new integrated exercise mode (storyPages with exercicio_cena)
  const hasIntegratedExercises = isStoryMode &&
    !!(atividade.storyPages?.some((p: any) => p.exercicio_cena));
  const storyTotalScenes = atividade.storyPages?.length || 4;

  useEffect(() => {
    setCurrentIdx(-1);
  }, []);

  const allExercicios = getExercicios(atividade).map(e => {
    // Normalize synonyms data - AI may return under different keys
    if (e.tipo === "memoria" && !e.paresSinonimos?.length) {
      const raw = (e as any).pares_sinonimos || (e as any).pairs || (e as any).sinonimos || (e as any).paresSinonimos;
      if (Array.isArray(raw) && raw.length > 0) {
        return { ...e, paresSinonimos: raw.map((p: any) => ({ palavra: p.palavra || p.word || p[0] || '', sinonimo: p.sinonimo || p.synonym || p[1] || '' })).filter((p: any) => p.palavra && p.sinonimo) };
      }
    }
    // Normalize completar frases - AI may return frases with null/missing opcoes
    if (e.tipo === "completar" && Array.isArray(e.frases)) {
      return {
        ...e,
        frases: e.frases.map((f: any) => ({
          ...f,
          opcoes: Array.isArray(f.opcoes) ? f.opcoes : [],
          respostaCorreta: typeof f.respostaCorreta === 'number' ? f.respostaCorreta : 0,
        })),
      };
    }
    return e;
  });
  const isReading = currentIdx === -1;
  const isDone = hasIntegratedExercises
    ? currentIdx >= 8
    : currentIdx >= allExercicios.length;
  const exercicio = !isReading && !isDone && !hasIntegratedExercises ? allExercicios[currentIdx] : null;
  const TOTAL_LINEAR_STEPS = 8;

  const categoriaInfo = exercicio
    ? CATEGORIA_LABELS[exercicio.categoria] || CATEGORIA_LABELS.interpretacao
    : null;

  // Archive a scene when page is revealed
  const archiveScene = useCallback((pageIdx: number, imgUrl?: string) => {
    const page = atividade.storyPages?.[pageIdx];
    if (!page) return;
    // Store first scene for character consistency
    if (pageIdx === 0 && imgUrl && !firstSceneRef.current) {
      firstSceneRef.current = { image: imgUrl, description: page.descricaoImagem };
    }
    const exists = sceneArchive.current.find(a => a.type === 'scene' && a.idx === pageIdx);
    if (!exists) {
      sceneArchive.current.push({ type: 'scene', idx: pageIdx, title: page.titulo, image: imgUrl });
      setArchiveVersion(v => v + 1);
    }
  }, [atividade]);

  const archiveChallenge = useCallback((challengeIdx: number, acertou: boolean) => {
    const ex = allExercicios[challengeIdx];
    if (!ex) return;
    const exists = sceneArchive.current.find(a => a.type === 'challenge' && a.idx === challengeIdx);
    if (!exists) {
      sceneArchive.current.push({ type: 'challenge', idx: challengeIdx, title: `Desafio ${challengeIdx + 1}`, acertou });
      setArchiveVersion(v => v + 1);
    }
  }, [allExercicios]);

  // Generate image for a story page
  const generatePageImage = useCallback(async (pageIdx: number) => {
    const page = atividade.storyPages?.[pageIdx];
    if (!page || pageImages[pageIdx]) return;

    // Measure illustration container for aspect-ratio-matched generation
    const containerW = illustrationRef.current?.clientWidth || 600;
    const containerH = illustrationRef.current?.clientHeight || 400;

    setGeneratingImagePage(pageIdx);
    try {
      const { data, error } = await supabase.functions.invoke("generate-story-image", {
        body: {
          description: page.descricaoImagem,
          bookId: atividade.id,
          pageNumber: page.numero,
          characterSheet: (atividade as any).characterSheet || '',
          targetWidth: containerW,
          targetHeight: containerH,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setPageImages(prev => ({ ...prev, [pageIdx]: data.imageUrl }));
        archiveScene(pageIdx, data.imageUrl);
        setExerciseImageRevealed(true);
      }
    } catch (err) {
      console.error("Error generating image:", err);
      const label = encodeURIComponent(`Cena ${pageIdx + 1}`);
      setPageImages(prev => ({ ...prev, [pageIdx]: `https://placehold.co/${containerW}x${containerH}/png?text=${label}` }));
      setExerciseImageRevealed(true);
    } finally {
      setGeneratingImagePage(null);
    }
  }, [atividade, pageImages]);

  const handleAnswer = () => {
    if (selected === null || !exercicio) return;
    setShowResult(true);
    const correct = selected === exercicio.respostaCorreta;

    exerciseResults.current.push({
      categoria: exercicio.categoria || "interpretacao",
      acertou: correct,
      exercicioIdx: currentIdx,
    });

    archiveChallenge(currentIdx, correct);

    if (correct) {
      playCorrectSound();
      setPontos((p) => p + 10 + combo * 5);
      setCombo((c) => c + 1);
      setAcertos((a) => a + 1);
      if (isStoryMode && currentIdx < 4 && revealedPages <= currentIdx) {
        setRevealedPages(currentIdx + 1);
        generatePageImage(currentIdx);
      }
    } else {
      playWrongSound();
      setCombo(0);
    }
  };

  const handleSpecialComplete = (acertou: boolean) => {
    setShowResult(true);
    exerciseResults.current.push({
      categoria: exercicio?.categoria || "interpretacao",
      acertou,
      exercicioIdx: currentIdx,
    });
    archiveChallenge(currentIdx, acertou);
    if (acertou) {
      playCorrectSound();
      setPontos((p) => p + 10 + combo * 5);
      setCombo((c) => c + 1);
      setAcertos((a) => a + 1);
      if (isStoryMode && currentIdx < 4 && revealedPages <= currentIdx) {
        setRevealedPages(currentIdx + 1);
        generatePageImage(currentIdx);
      }
    } else {
      playWrongSound();
      setCombo(0);
    }
  };

  const handleAbertaComplete = (resposta: string) => {
    setShowResult(true);
    exerciseResults.current.push({
      categoria: exercicio?.categoria || "interpretacao",
      acertou: true,
      exercicioIdx: currentIdx,
    });
    archiveChallenge(currentIdx, true);
    playCorrectSound();
    setPontos((p) => p + 15);
    setAcertos((a) => a + 1);
    if (isStoryMode && currentIdx < 4 && revealedPages <= currentIdx) {
      setRevealedPages(currentIdx + 1);
      generatePageImage(currentIdx);
    }
  };
  const handleRetry = () => {
    setSelected(null);
    setShowResult(false);
    setRetryKey(k => k + 1);
  };

  // ── Linear 8-step exercise flow ────────────────────────────────────────────

  // Image generation milestones: after completing step N → generate scene image M
  const LINEAR_IMAGE_SCHEDULE: Record<number, number> = { 1: 0, 3: 1, 5: 2, 7: 3 }; // after every 2 exercises

  const advanceLinearStep = (completedStep: number) => {
    // Trigger image generation silently
    const imgIdx = LINEAR_IMAGE_SCHEDULE[completedStep];
    if (imgIdx !== undefined) {
      generatePageImage(imgIdx);
      // Show interstitial after image milestone
      setShowImageInterstitial(imgIdx);
      // Don't advance yet - wait for user to dismiss interstitial
      // Save results on last step
      if (completedStep === TOTAL_LINEAR_STEPS - 1) {
        const oldData = getStudentData();
        const oldXp = oldData.total_xp;
        const result: ActivityResult = {
          ano: atividade.ano || location.state?.ano || "3",
          genero: atividade.genero,
          tema: atividade.tema || location.state?.tema || "portugues",
          subtema: atividade.titulo,
          titulo: atividade.titulo,
          habilidade_bncc: atividade.habilidadeBNCC,
          exercicios: exerciseResults.current,
          xp: pontos,
          leitura_realizada: leituraRealizada,
        };
        trackActivityResult(result).then((newData) => {
          const newTrophies = checkNewTrophies(oldXp, newData.total_xp);
          if (newTrophies.length > 0) setWonTrophy(newTrophies[newTrophies.length - 1]);
        }).catch(console.error);
      }
      return; // Don't advance yet
    }
    // No image milestone - advance normally
    if (completedStep === TOTAL_LINEAR_STEPS - 1) {
      const oldData = getStudentData();
      const oldXp = oldData.total_xp;
      const result: ActivityResult = {
        ano: atividade.ano || location.state?.ano || "3",
        genero: atividade.genero,
        tema: atividade.tema || location.state?.tema || "portugues",
        subtema: atividade.titulo,
        titulo: atividade.titulo,
        habilidade_bncc: atividade.habilidadeBNCC,
        exercicios: exerciseResults.current,
        xp: pontos,
        leitura_realizada: leituraRealizada,
      };
      trackActivityResult(result).then((newData) => {
        const newTrophies = checkNewTrophies(oldXp, newData.total_xp);
        if (newTrophies.length > 0) setWonTrophy(newTrophies[newTrophies.length - 1]);
      }).catch(console.error);
    }
    setCurrentIdx(completedStep + 1);
  };

  const dismissImageInterstitial = () => {
    setShowImageInterstitial(null);
    setCurrentIdx(prev => prev + 1);
  };

  // ── End integrated scene handlers ──────────────────────────────────────────

  const handleNext = () => {
    // Story mode: intro → linear 8-step exercises
    if (isReading && hasIntegratedExercises) {
      setCurrentIdx(0);
      return;
    }

    setSelected(null);
    setShowResult(false);
    setExerciseImageRevealed(false);
    setCurrentIdx((i) => i + 1);

    if (currentIdx === allExercicios.length - 1) {
      const oldData = getStudentData();
      const oldXp = oldData.total_xp;
      const result: ActivityResult = {
        ano: atividade.ano || location.state?.ano || "3",
        genero: atividade.genero,
        tema: atividade.tema || location.state?.tema || "portugues",
        subtema: atividade.titulo,
        titulo: atividade.titulo,
        habilidade_bncc: atividade.habilidadeBNCC,
        exercicios: exerciseResults.current,
        xp: pontos,
        leitura_realizada: leituraRealizada,
      };
      trackActivityResult(result).then((newData) => {
        const newTrophies = checkNewTrophies(oldXp, newData.total_xp);
        if (newTrophies.length > 0) {
          // Show the highest (most recent) trophy unlocked
          setWonTrophy(newTrophies[newTrophies.length - 1]);
        }
      }).catch(console.error);
    }
  };

  const handleRegenerate = async () => {
    const { ano, genero, tema, prompt, historiaAluno } = location.state || {};
    if (!ano || !genero || !tema) {
      navigate("/");
      return;
    }
    setRegenerating(true);
    try {
      const body: Record<string, string> = { ano, genero, tema };
      if (prompt) body.prompt = prompt;
      if (historiaAluno) body.historiaAluno = historiaAluno;

      const { data, error } = await supabase.functions.invoke("generate-atividade", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAtividade(data);
      setShowImageInterstitial(null);
      setCurrentIdx(-1);
      setShowLeitura(false);
      setLeituraRealizada(false);
      setSelected(null);
      setShowResult(false);
      setPontos(0);
      setCombo(0);
      setAcertos(0);
      setRevealedPages(0);
      setExerciseImageRevealed(false);
      setPageImages({});
      setSceneVideos({});
      setSceneAudios({});
      setSceneRequestIds({});
      setGeneratingVideos({});
      setLoadingAudios({});
      setTtsUnavailable(false);
      audioGenInProgress.current.clear();
      ttsWarningShownRef.current = false;
      exerciseResults.current = [];
      sceneArchive.current = [];
      firstSceneRef.current = null;
      bgGenTriggered.current = false;
      setArchiveVersion(0);
      setSelectedArchiveItem(null);
      toast({ title: "✨ Nova história gerada!", description: "Uma nova aventura foi criada para você." });
    } catch (err: any) {
      toast({ title: "Erro ao gerar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setRegenerating(false);
    }
  };

  // Generate TTS audio for a scene
  const generateSceneAudio = useCallback(async (sceneIdx: number) => {
    const page = atividade.storyPages?.[sceneIdx];
    if (!page?.texto || sceneAudios[sceneIdx] || ttsUnavailable || audioGenInProgress.current.has(sceneIdx)) return;

    audioGenInProgress.current.add(sceneIdx);
    setLoadingAudios(prev => ({ ...prev, [sceneIdx]: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ text: page.texto, userId: user?.id, persist: true }),
        }
      );

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        const payload = contentType.includes("application/json")
          ? await response.json().catch(() => null)
          : null;
        const providerCode = payload?.code || "";
        const providerMessage = String(payload?.error || "TTS failed");
        const normalizedMessage = providerMessage.toLowerCase();
        const quotaExceeded = response.status === 429 || providerCode === "QUOTA_EXCEEDED" || normalizedMessage.includes("quota");

        if (quotaExceeded) {
          setTtsUnavailable(true);
          if (!ttsWarningShownRef.current) {
            ttsWarningShownRef.current = true;
            toast({
              title: "Narration temporarily unavailable",
              description: "We’ll keep the story running with video and subtitles while voice credits are unavailable.",
            });
          }
          return;
        }

        throw new Error(providerMessage);
      }

      let audioUrl: string | undefined;
      if (contentType.includes("application/json")) {
        const json = await response.json();
        audioUrl = json.audioUrl;
      } else {
        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
      }

      if (!audioUrl) throw new Error("Audio URL missing from TTS response");
      setSceneAudios(prev => ({ ...prev, [sceneIdx]: audioUrl }));
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      audioGenInProgress.current.delete(sceneIdx);
      setLoadingAudios(prev => ({ ...prev, [sceneIdx]: false }));
    }
  }, [atividade, sceneAudios, toast, ttsUnavailable, user?.id]);

  // Generate video for a scene - tries external APIs, gracefully falls back to cinematic Ken Burns
  const generateSceneVideo = useCallback(async (sceneIdx: number, images?: Record<number, string>) => {
    const allImages = images || pageImages;
    const imgUrl = allImages[sceneIdx];
    if (!imgUrl) return;
    if (sceneVideos[sceneIdx]) return;
    if (videoGenInProgress.current.has(sceneIdx)) return;
    videoGenInProgress.current.add(sceneIdx);
    
    setGeneratingVideos(prev => ({ ...prev, [sceneIdx]: true }));
    try {
      const page = atividade.storyPages?.[sceneIdx];
      const { data, error } = await supabase.functions.invoke("generate-scene-video", {
        body: {
          imageUrl: imgUrl,
          prompt: `Scene ${sceneIdx + 1}. ${page?.descricaoImagem || 'children characters in a magical scene'}. Convert this exact illustration into a short animated video with natural character movement, blinking, gestures and environmental motion.`,
          userId: user?.id,
        },
      });
      if (error) {
        const errMsg = typeof error === 'string' ? error : error?.message || '';
        if (errMsg.includes('INSUFFICIENT_CREDIT') || errMsg.includes('402') || errMsg.includes('credit')) {
          console.warn("No API credits, using cinematic Ken Burns fallback for scene", sceneIdx);
          return;
        }
        console.warn("Video generation error, cinematic fallback active", errMsg);
        return;
      }
      if (data?.error) {
        console.warn("Video API error, cinematic fallback active:", data.error);
        return;
      }
      if (data?.videoUrl) {
        setSceneVideos(prev => ({ ...prev, [sceneIdx]: data.videoUrl }));
        setSceneRequestIds(prev => {
          const next = { ...prev };
          delete next[sceneIdx];
          return next;
        });
      } else if (data?.requestId) {
        setSceneRequestIds(prev => ({ ...prev, [sceneIdx]: data.requestId }));
      }
    } catch (err) {
      console.warn("Video generation failed, cinematic fallback active", err);
    } finally {
      videoGenInProgress.current.delete(sceneIdx);
      setGeneratingVideos(prev => ({ ...prev, [sceneIdx]: false }));
    }
  }, [atividade, pageImages, sceneVideos]);

  useEffect(() => {
    const pendingEntries = Object.entries(sceneRequestIds);
    if (pendingEntries.length === 0) return;

    const interval = window.setInterval(async () => {
      await Promise.allSettled(
        pendingEntries.map(async ([sceneKey, requestId]) => {
          const sceneIdx = Number(sceneKey);
          if (!requestId || sceneVideos[sceneIdx]) return;

          try {
            const { data, error } = await supabase.functions.invoke("generate-scene-video", {
              body: { requestId, userId: user?.id },
            });

            if (error) throw error;

            if (data?.videoUrl) {
              setSceneVideos(prev => ({ ...prev, [sceneIdx]: data.videoUrl }));
              setSceneRequestIds(prev => {
                const next = { ...prev };
                delete next[sceneIdx];
                return next;
              });
              setGeneratingVideos(prev => ({ ...prev, [sceneIdx]: false }));
            } else if (data?.status === "failed" || data?.status === "canceled") {
              setSceneRequestIds(prev => {
                const next = { ...prev };
                delete next[sceneIdx];
                return next;
              });
              setGeneratingVideos(prev => ({ ...prev, [sceneIdx]: false }));
              console.error(`Video generation failed for scene ${sceneIdx}`, data?.error || data?.status);
            }
          } catch (err) {
            console.error("Video polling error for scene", sceneIdx, err);
          }
        })
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [sceneRequestIds, sceneVideos]);

  // ── Silent background generation: remaining images + videos ────────────────

  // Track whether background generation has been kicked off
  const bgGenTriggered = useRef(false);

  // When the first image is generated, immediately kick off generation of all remaining images
  useEffect(() => {
    if (!hasIntegratedExercises) return;
    if (bgGenTriggered.current) return;
    // Wait until at least 1 image exists
    const existingImages = Object.keys(pageImages);
    if (existingImages.length === 0) return;
    bgGenTriggered.current = true;

    // Generate remaining images in background
    const totalPages = atividade.storyPages?.length || 4;
    for (let i = 0; i < totalPages; i++) {
      if (!pageImages[i]) {
        generatePageImage(i);
      }
    }
  }, [pageImages, hasIntegratedExercises]);

  // When an image becomes available, silently generate the video so it's ready for FASE 2
  useEffect(() => {
    if (!hasIntegratedExercises) return;
    Object.entries(pageImages).forEach(([idxStr, imgUrl]) => {
      const idx = Number(idxStr);
      if (imgUrl && !sceneVideos[idx] && !generatingVideos[idx] && !videoGenInProgress.current.has(idx)) {
        generateSceneVideo(idx);
      }
    });
  }, [pageImages]);

  // ── End effects ─────────────────────────────────────────────────────────────

  // Handle scene player - generate ONLY the first scene, then phased
  const handleOpenScenePlayer = async () => {
    setGeneratingScenes(true);
    const ensuredImages: Record<number, string> = { ...pageImages };

    // Only generate image + audio + video for scene 0
    if (!ensuredImages[0]) {
      await generatePageImage(0);
    }

    await new Promise(r => setTimeout(r, 150));

    setPageImages(prev => {
      Object.assign(ensuredImages, prev);
      return prev;
    });

    // Generate audio and video for first scene only
    await generateSceneAudio(0);
    generateSceneVideo(0, ensuredImages);

    setShowScenePlayer(true);
    setCurrentScene(0);
    setIsPlaying(true);
    setGeneratingScenes(false);
  };

  // Generate the next scene (phased)
  const handleGenerateNextScene = async (nextIdx: number) => {
    const ensuredImages: Record<number, string> = { ...pageImages };
    if (!ensuredImages[nextIdx]) {
      await generatePageImage(nextIdx);
      await new Promise(r => setTimeout(r, 150));
      setPageImages(prev => {
        Object.assign(ensuredImages, prev);
        return prev;
      });
    }
    await generateSceneAudio(nextIdx);
    generateSceneVideo(nextIdx, ensuredImages);
    setIsPlaying(true);
    setCurrentScene(nextIdx);
  };

  // Save production to database
  const handleSaveProduction = async () => {
    if (!user) return;
    const cenas = (atividade.storyPages || []).map((page, idx) => ({
      titulo: page.titulo,
      texto: page.texto,
      imageUrl: pageImages[idx] || null,
      videoUrl: sceneVideos[idx] || null,
      audioUrl: sceneAudios[idx] || null,
    }));
    try {
      await supabase.from("student_productions" as any).insert({
        user_id: user.id,
        titulo: atividade.titulo,
        historia_texto: atividade.texto,
        ano: atividade.ano || location.state?.ano || "3",
        genero: atividade.genero,
        cenas,
        capa_url: pageImages[0] || null,
      } as any);
      toast({ title: "🎬 Produção salva!", description: "Acesse em Minhas Produções no menu." });
    } catch (err: any) {
      toast({ title: "Erro ao salvar produção", description: err.message, variant: "destructive" });
    }
  };

  const playScene = useCallback((idx: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioUrl = sceneAudios[idx];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(console.error);
      audio.onended = () => {
        setIsPlaying(false);
      };
      setIsPlaying(true);
    } else {
      setIsPlaying(!!sceneVideos[idx]);
    }

    // Restart video from beginning
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [sceneAudios, sceneVideos]);

  useEffect(() => {
    if (showScenePlayer && isPlaying) {
      playScene(currentScene);
    }
  }, [currentScene, showScenePlayer]);

  useEffect(() => {
    if (showScenePlayer && sceneVideos[currentScene] && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [showScenePlayer, currentScene, sceneVideos]);

  const handleNextScene = async () => {
    const nextIdx = currentScene + 1;
    if (nextIdx < (atividade.storyPages?.length || 0)) {
      // Generate next scene phasedly if not already generated
      if (!sceneVideos[nextIdx] && !sceneAudios[nextIdx]) {
        setGeneratingVideos(prev => ({ ...prev, [nextIdx]: true }));
        await handleGenerateNextScene(nextIdx);
      } else {
        setIsPlaying(true);
        setCurrentScene(nextIdx);
      }
    }
  };

  const handleReplayScene = () => {
    playScene(currentScene);
  };

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        if (videoRef.current) videoRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        if (videoRef.current) videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const handleCloseScenePlayer = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    // Auto-save production when closing scene player
    await handleSaveProduction();
    setShowScenePlayer(false);
    setIsPlaying(false);
  };

  // MagicBook generation
  const handleGenerateMagicBook = async () => {
    setGeneratingBook(true);
    try {
      // Reuse existing scene images instead of regenerating
      const existingImages: Record<number, string> = {};
      const storyPages = atividade.storyPages || [];
      for (let i = 0; i < storyPages.length; i++) {
        if (pageImages[i]) {
          existingImages[i] = pageImages[i];
        }
      }

      const { data, error } = await supabase.functions.invoke("generate-livrinho", {
        body: {
          titulo: atividade.titulo,
          texto: atividade.texto,
          genero: atividade.genero,
          ano: atividade.ano || location.state?.ano || "3",
          autorNome: profile?.nome || user?.email?.split("@")[0] || "Jovem Autor",
          existingImages, // Pass existing images to avoid regeneration
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      navigate("/estante", { state: { novoLivro: data } });
      toast({ title: "📚 MagicBook criado!", description: "Seu livro mágico foi salvo na estante!" });
    } catch (err: any) {
      toast({ title: "Erro ao gerar MagicBook", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setGeneratingBook(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📚 Olha a história incrível que eu criei no Brasil Letrado!\n\n"${atividade.titulo}"\n\nVem criar a sua também!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLeitura = () => {
    setShowLeitura(!showLeitura);
    if (!leituraRealizada) setLeituraRealizada(true);
  };

  const isCorrect = exercicio && selected === exercicio.respostaCorreta;
  const progress = isReading ? 0 : isDone ? 100 : hasIntegratedExercises
    ? (currentIdx / TOTAL_LINEAR_STEPS) * 100
    : ((currentIdx + 1) / allExercicios.length) * 100;
  const isSpecialType = exercicio && ["ligar", "memoria", "ordenar", "aberta", "completar", "leitura-trecho"].includes(exercicio.tipo);

  const { hint, registerInteraction, dismissHint } = useExerciseHint({
    categoria: exercicio?.categoria,
    tipo: exercicio?.tipo,
    isActive: !!exercicio && !showResult && !isDone,
  });

  const handleExerciseClick = () => { registerInteraction(); };

  // Render the book page preview
  const renderBookPage = (pageIdx: number) => {
    const page = atividade.storyPages?.[pageIdx];
    if (!page) return null;
    const imgUrl = pageImages[pageIdx];
    const isGenerating = generatingImagePage === pageIdx;

    return (
      <motion.div
        key={`book-page-${pageIdx}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col md:flex-row rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg mb-6"
        style={{ fontFamily: "'Comic Sans MS', 'Segoe UI', sans-serif", minHeight: "280px", background: "white" }}
      >
        {/* Left: Image */}
        <div className="md:w-1/2 w-full flex items-center justify-center overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-semibold">Gerando ilustração...</p>
            </div>
          ) : imgUrl ? (
            <img src={imgUrl} alt={page.titulo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <span className="text-5xl">🎨</span>
            </div>
          )}
        </div>
        {/* Right: Text */}
        <div className="md:w-1/2 w-full flex flex-col items-center justify-center p-6">
          <h4 className="text-lg font-bold text-primary mb-3 text-center">{page.titulo}</h4>
          <p className="text-sm leading-relaxed text-foreground text-center">{page.texto}</p>
          <p className="text-xs text-muted-foreground mt-4">Página {pageIdx + 1}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden" onClick={handleExerciseClick}>
      {regenerating && <CuriosidadesLoading message="Gerando nova história..." />}
      {generatingBook && <CuriosidadesLoading message="Criando seu MagicBook com ilustrações..." />}
      {generatingScenes && <CuriosidadesLoading message="Preparando suas cenas animadas..." />}

      {/* Top Bar - compact */}
      <div className="flex-shrink-0 z-30 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-2">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 progress-bar">
            <motion.div className="progress-bar-fill" animate={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-2">
            {combo > 1 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[11px] font-bold text-secondary px-2 py-0.5 rounded-full bg-secondary/10">
                🔥 {combo}x combo
              </motion.span>
            )}
            <span className="badge-xp text-[11px]">⭐ {pontos} Brazukas</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-3 w-full px-2 py-1">
        {/* Collapsible Scene Archive Sidebar */}
        {isStoryMode && sceneArchive.current.length > 0 && (
          <>
            {/* Sidebar toggle button - always visible */}
            <button
              onClick={() => setShowVideoSidebar(s => !s)}
              className="hidden md:flex fixed left-2 top-1/2 -translate-y-1/2 z-40 items-center gap-1 px-2 py-3 rounded-r-xl bg-primary/90 text-white font-bold text-xs shadow-lg hover:bg-primary transition-colors"
              style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
            >
              <BookOpen size={14} />
              <span className="mt-1">Jornada</span>
            </button>

            {/* Sidebar panel */}
            <AnimatePresence>
              {showVideoSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 224, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="hidden md:flex flex-shrink-0 overflow-hidden flex-col max-h-full"
                >
                  <div className="h-full overflow-y-auto space-y-2 w-56 pb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Jornada</span>
                      </div>
                      <button onClick={() => setShowVideoSidebar(false)} className="text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    </div>
                    {sceneArchive.current.map((item, i) => (
                      <div key={`${item.type}-${item.idx}-${i}`}>
                        <motion.button
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedArchiveItem(selectedArchiveItem === i ? null : i)}
                          className={`w-full text-left p-2 rounded-xl border transition-all text-xs ${
                            selectedArchiveItem === i
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.type === 'scene' ? (
                              <>
                                {item.image ? (
                                  <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                  <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">🎨</span>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground truncate">{item.title}</p>
                                  <p className="text-muted-foreground">Cena {item.idx + 1}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-primary/10">
                                  {item.acertou ? '⭐' : '📝'}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground truncate">{item.title}</p>
                                  <p className="text-muted-foreground">{item.acertou ? 'Concluído!' : 'Concluído'}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.button>
                        {/* Expanded content right below the clicked item */}
                        <AnimatePresence>
                          {selectedArchiveItem === i && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden rounded-xl border border-primary/20 bg-card mt-1"
                            >
                              {(() => {
                                if (item.type === 'scene') {
                                  const page = atividade.storyPages?.[item.idx];
                                  return page ? (
                                    <div className="p-3">
                                      {item.image && <img src={item.image} alt="" className="w-full rounded-lg mb-2" />}
                                      <p className="text-xs text-foreground leading-relaxed">{page.texto}</p>
                                    </div>
                                  ) : null;
                                } else {
                                  const ex = allExercicios[item.idx];
                                  return ex ? (
                                    <div className="p-3">
                                      <p className="text-xs font-semibold text-primary mb-1">{ex.tipo}</p>
                                      <p className="text-xs text-foreground leading-relaxed">{ex.enunciado}</p>
                                    </div>
                                  ) : null;
                                }
                              })()}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 min-h-0 flex flex-col" style={{ marginLeft: 24, marginRight: 24, width: 'calc(100% - 48px)' }}>
        <AnimatePresence mode="wait">
          {/* INTRO / READING PHASE */}
          {isReading && (
            <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}
              className="flex-1 min-h-0 flex items-center justify-center relative overflow-hidden"
            >
              {isStoryMode ? (
                /* ========== STORY MODE: Cinematic Intro ========== */
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: 4 + Math.random() * 8,
                          height: 4 + Math.random() * 8,
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          background: ['#2ecc40', '#f9e230', '#1ab0c8', '#f4a400', '#a8e63d'][i % 5],
                          opacity: 0.15,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          opacity: [0.1, 0.3, 0.1],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 max-w-xl w-full text-center px-6">
                    {/* Genre & BNCC badges */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-center gap-2 mb-4"
                    >
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{atividade.genero}</span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">✨ IA</span>
                    </motion.div>

                    {/* Title with gradient */}
                    <motion.h2
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="font-display text-4xl md:text-5xl font-extrabold mb-5 leading-tight"
                      style={{
                        background: 'linear-gradient(135deg, #2ecc40, #a8e63d, #f9e230, #f4a400, #1ab0c8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      }}
                    >
                      {atividade.titulo}
                    </motion.h2>

                    {/* Short teaser - just 1-2 sentences */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-lg md:text-xl leading-relaxed text-foreground/70 mb-3 max-w-md mx-auto"
                      style={{ fontFamily: "'Comic Sans MS', 'Segoe UI', sans-serif" }}
                    >
                      {(() => {
                        const fullText = atividade.storyPages?.[0]?.texto || atividade.texto || '';
                        const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
                        return sentences.slice(0, 2).join(' ').trim();
                      })()}
                    </motion.p>

                    {atividade.historiaAluno && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xs text-muted-foreground mb-4"
                      >
                        💡 Baseado na sua ideia: <span className="italic">{atividade.historiaAluno}</span>
                      </motion.p>
                    )}

                    {/* Info pills */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center justify-center gap-3 mb-8 text-muted-foreground"
                    >
                      <span className="flex items-center gap-1 text-xs font-medium">
                        <BookOpen size={14} /> {atividade.storyPages?.length || 4} cenas
                      </span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="flex items-center gap-1 text-xs font-medium">
                        <Sparkles size={14} /> {hasIntegratedExercises ? `${TOTAL_LINEAR_STEPS} desafios` : `${allExercicios.length} desafios`}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-xs font-medium">{atividade.habilidadeBNCC}</span>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, type: "spring" }}
                      className="flex flex-col items-center gap-3"
                    >
                      <motion.button
                        onClick={handleNext}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-hero px-10 py-4 text-xl font-extrabold flex items-center gap-3 shadow-xl"
                      >
                        🚀 Vamos Nessa! <ArrowRight size={22} />
                      </motion.button>
                      <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      >
                        {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Gerar outra história
                      </button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                /* ========== NON-STORY MODE: Classic text reading ========== */
                <div className="card-edu max-w-2xl w-full overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-info px-2 py-0.5 rounded-full bg-info/10">{atividade.genero}</span>
                    <span className="text-xs text-muted-foreground font-semibold">{atividade.habilidadeBNCC}</span>
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">✨ Gerado por IA</span>
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-4">{atividade.titulo}</h3>
                  <div className="bg-muted rounded-xl p-6 leading-relaxed text-foreground whitespace-pre-line text-base">
                    {atividade.texto}
                  </div>

                  {atividade.leituraEmVozAlta && (
                    <div className="mt-4">
                      <button onClick={handleLeitura} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-info/10 border-2 border-info/20 text-info font-bold text-sm hover:bg-info/20 transition-colors">
                        <Volume2 size={18} />
                        {showLeitura ? "Ocultar Leitura em Voz Alta" : "📢 Ler em Voz Alta"}
                      </button>
                      <AnimatePresence>
                        {showLeitura && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-3 p-5 rounded-xl bg-info/5 border-2 border-info/15 space-y-4">
                              <div>
                                <p className="text-sm font-bold text-info mb-1">📖 Instrução:</p>
                                <p className="text-sm text-foreground">{atividade.leituraEmVozAlta.instrucao}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-card border border-info/20">
                                <p className="text-sm font-bold text-info mb-2">🎯 Trecho:</p>
                                <p className="text-base text-foreground font-semibold leading-relaxed italic">"{atividade.leituraEmVozAlta.trechoDestaque}"</p>
                              </div>
                              <GravadorLeitura textoOriginal={atividade.texto} trechoDestaque={atividade.leituraEmVozAlta.trechoDestaque} ano={atividade.ano || "3"} onLeituraRealizada={() => { if (!leituraRealizada) setLeituraRealizada(true); }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleRegenerate} disabled={regenerating} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted border-2 border-border text-muted-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
                      {regenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      Gerar novo texto
                    </button>
                    <button onClick={handleNext} className="btn-hero flex-1 flex items-center justify-center gap-2">
                      Começar Exercícios <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* EXERCISE */}
          {exercicio && !isDone && (
            <motion.div key={`${exercicio.id}-${retryKey}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="flex-1 min-h-0 flex flex-col md:flex-row gap-4"
            >
              {/* LEFT COLUMN: Story text + Illustration */}
              {isStoryMode && atividade.storyPages && (() => {
                const storyPageIdx = Math.min(currentIdx, (atividade.storyPages?.length || 1) - 1);
                const page = atividade.storyPages?.[storyPageIdx];
                const imgUrl = pageImages[storyPageIdx];
                const isGeneratingImg = generatingImagePage === storyPageIdx;
                const lastResult = exerciseResults.current[exerciseResults.current.length - 1];
                const justAnsweredCorrectly = showResult && (isSpecialType ? lastResult?.acertou : isCorrect);

                return (
                  <div className="w-full md:w-[40%] flex flex-col gap-3 min-h-0 h-full">
                     {/* Story text card - auto height, scrollable */}
                     <div className="rounded-2xl relative flex flex-col" style={{
                       flex: '0 1 auto',
                       maxHeight: '35%',
                       fontFamily: "'Georgia', 'Palatino', serif",
                       background: 'linear-gradient(to right, #faf8f2 0%, #fffef9 90%, #f5f0e6 100%)',
                       boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
                       padding: '14px 18px',
                     }}>
                      {/* Page texture lines */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #8B7355 24px)',
                        backgroundSize: '100% 24px',
                      }} />
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/5 to-transparent z-10" />
                      
                      <div className="flex items-center gap-1.5 mb-1 relative z-10 flex-shrink-0">
                        <BookOpen size={12} className="text-primary" />
                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Cena {storyPageIdx + 1}</span>
                      </div>
                      <h4 className="text-xs font-bold text-primary mb-1 relative z-10 flex-shrink-0">{page?.titulo}</h4>
                      <div className="relative z-10 overflow-y-auto flex-1 min-h-0" style={{ fontSize: '0.92rem', lineHeight: '1.7' }}>
                        <p className="text-foreground/90">
                          {page?.texto}
                        </p>
                      </div>
                    </div>

                     {/* Illustration card - fills remaining space, contained */}
                     <div ref={illustrationRef} className="rounded-2xl overflow-hidden relative flex-1" style={{
                       minHeight: 0,
                       maxHeight: '100%',
                       background: '#f0ece4',
                       boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
                     }}>
                      <AnimatePresence mode="wait">
                        {justAnsweredCorrectly && imgUrl ? (
                          <motion.div
                            key="revealed-image"
                            initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, duration: 0.8 }}
                            className="absolute inset-0 overflow-hidden"
                          >
                            <motion.div
                              className="absolute inset-0 z-20 pointer-events-none"
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 0 }}
                              transition={{ duration: 2, delay: 0.5 }}
                            >
                              {[...Array(8)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute text-lg"
                                  style={{ left: `${15 + Math.random() * 70}%`, top: `${15 + Math.random() * 70}%` }}
                                  initial={{ opacity: 1, scale: 0 }}
                                  animate={{ opacity: [1, 1, 0], scale: [0, 1.5, 0], rotate: [0, 180, 360] }}
                                  transition={{ duration: 1.5, delay: i * 0.1 }}
                                >
                                  ✨
                                </motion.div>
                              ))}
                            </motion.div>
                            <img src={imgUrl} alt="Ilustração da cena" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                          </motion.div>
                        ) : justAnsweredCorrectly && isGeneratingImg ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                            <motion.p
                              className="text-lg font-extrabold text-center tracking-wide"
                              style={{
                                background: 'linear-gradient(135deg, #2ecc40, #a8e63d, #f9e230, #f4a400, #1ab0c8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Revelando ilustração...
                            </motion.p>
                          </motion.div>
                        ) : (
                          <motion.div key="blank" className="absolute inset-0 flex items-center justify-center">
                            <motion.p
                              className="text-base font-bold text-center px-6"
                              style={{
                                background: 'linear-gradient(135deg, #2ecc40, #a8e63d, #f9e230, #f4a400, #1ab0c8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              Acerte o desafio para revelar a ilustração!
                            </motion.p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })()}

              {/* RIGHT COLUMN: Challenge */}
              <div className={isStoryMode ? 'w-full md:w-[60%] overflow-y-auto rounded-2xl border border-border bg-card p-4 flex flex-col justify-between' : 'card-edu'} style={isStoryMode ? { minHeight: 0, boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)', height: '100%' } : {}}>
                 <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${categoriaInfo?.colorClass || "bg-primary/10 text-primary"}`}>
                    {categoriaInfo?.icon} {categoriaInfo?.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Desafio {currentIdx + 1} de {allExercicios.length}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                    {"⭐".repeat(exercicio.dificuldade)}
                  </span>
                  {exercicio.tipo === "completar" && <span className="text-[10px] font-bold text-info bg-info/10 px-1.5 py-0.5 rounded-full">📝 Complete</span>}
                  {exercicio.tipo === "ligar" && <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">🔗 Ligar</span>}
                  {exercicio.tipo === "memoria" && <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">🧠 Memória</span>}
                  {exercicio.tipo === "ordenar" && <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">📋 Ordenar</span>}
                  {exercicio.tipo === "aberta" && <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">✏️ Questão Aberta</span>}
                  {exercicio.tipo === "leitura-trecho" && <span className="text-[10px] font-bold text-info bg-info/10 px-1.5 py-0.5 rounded-full">🎤 Leitura Oral</span>}
                </div>

                <h4 className={`font-bold text-foreground mb-2 ${isStoryMode ? 'text-[0.9rem]' : 'text-base'}`}>
                  {exercicio.tipo === "completar" ? "Complete a frase:" : exercicio.tipo === "leitura-trecho" ? "Leia em voz alta:" : exercicio.enunciado}
                </h4>

                <div className="flex-1 min-h-0">
                  {exercicio.tipo === "ligar" && exercicio.pares && (
                    <ExercicioLigar key={`ligar-${retryKey}`} pares={exercicio.pares} onComplete={handleSpecialComplete} showResult={showResult} />
                  )}
                  {exercicio.tipo === "memoria" && exercicio.paresSinonimos && (
                    <ExercicioMemoria key={`memoria-${retryKey}`} pares={exercicio.paresSinonimos} onComplete={handleSpecialComplete} />
                  )}
                  {exercicio.tipo === "ordenar" && exercicio.itensOrdenados && (
                    <ExercicioOrdenar key={`ordenar-${retryKey}`} itensOrdenados={exercicio.itensOrdenados} onComplete={handleSpecialComplete} showResult={showResult} />
                  )}
                  {exercicio.tipo === "aberta" && (
                    <ExercicioAberta key={`aberta-${retryKey}`} pergunta={exercicio.perguntaAberta || exercicio.enunciado} dicaResposta={exercicio.dicaResposta} onComplete={handleAbertaComplete} showResult={showResult} />
                  )}
                  {exercicio.tipo === "completar" && (exercicio.frases || exercicio.opcoes) && (
                    <ExercicioCompletar key={`completar-${retryKey}`} enunciado={exercicio.enunciado} opcoes={exercicio.opcoes} respostaCorreta={exercicio.respostaCorreta as number} frases={exercicio.frases} onAnswer={handleSpecialComplete} showResult={showResult} />
                  )}
                  {exercicio.tipo === "leitura-trecho" && (
                    <ExercicioLeituraTrecho
                      key={`leitura-${retryKey}`}
                      trecho={(exercicio as any).trechoLeitura || exercicio.enunciado}
                      instrucao={exercicio.enunciado}
                      genero={atividade.genero}
                      ano={atividade.ano || "3"}
                      onComplete={() => handleAbertaComplete("leitura")}
                      showResult={showResult}
                    />
                  )}

                  {(exercicio.tipo === "multipla-escolha" || exercicio.tipo === "verdadeiro-falso") && (
                    <div className="space-y-2">
                      {(exercicio.tipo === "verdadeiro-falso" ? ["verdadeiro", "falso"] : exercicio.opcoes || []).map((opt, idx) => {
                        const val = exercicio.tipo === "verdadeiro-falso" ? opt : idx;
                        const isSelected = selected === val;
                        const isCorrectOption = showResult && val === exercicio.respostaCorreta;
                        const isWrongSelected = showResult && isSelected && !isCorrectOption;

                        return (
                          <motion.button
                            key={idx}
                            whileHover={!showResult ? { scale: 1.01 } : {}}
                            whileTap={!showResult ? { scale: 0.99 } : {}}
                            disabled={showResult}
                            onClick={() => setSelected(val)}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                              isCorrectOption ? "border-success bg-success/10 text-success"
                              : isWrongSelected ? "border-destructive bg-destructive/10 text-destructive"
                              : isSelected ? "border-primary bg-primary/5 text-foreground"
                              : "border-muted bg-muted/50 text-foreground hover:border-muted-foreground/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-full bg-card border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {exercicio.tipo === "verdadeiro-falso" ? (opt === "verdadeiro" ? "V" : "F") : String.fromCharCode(65 + idx)}
                              </span>
                              <span>{typeof opt === "string" ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}</span>
                              {isCorrectOption && <CheckCircle2 size={18} className="ml-auto" />}
                              {isWrongSelected && <XCircle size={18} className="ml-auto" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Result feedback */}
                <AnimatePresence>
                  {showResult && exercicio.tipo !== "aberta" && exercicio.tipo !== "leitura-trecho" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 p-2 rounded-lg border ${
                        isSpecialType
                          ? exerciseResults.current[exerciseResults.current.length - 1]?.acertou ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                          : isCorrect ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                      }`}
                    >
                      <p className={`font-bold text-[0.8rem] mb-0.5 ${
                        (isSpecialType ? exerciseResults.current[exerciseResults.current.length - 1]?.acertou : isCorrect) ? "text-success" : "text-destructive"
                      }`}>
                        {(isSpecialType ? exerciseResults.current[exerciseResults.current.length - 1]?.acertou : isCorrect)
                          ? "🎉 Muito bem! A ilustração foi revelada!" : "😊 Quase lá!"}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{exercicio.explicacao}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="mt-auto pt-2 flex gap-2">
                  {!showResult && !isSpecialType ? (
                    <button onClick={handleAnswer} disabled={selected === null} className="btn-hero w-full disabled:opacity-40 disabled:cursor-not-allowed">
                      Verificar Resposta
                    </button>
                  ) : showResult ? (
                    <>
                      {!(isSpecialType ? exerciseResults.current[exerciseResults.current.length - 1]?.acertou : isCorrect) ? (
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRetry(); }} className="btn-hero flex-1 flex items-center justify-center gap-2">
                          <RotateCcw size={16} /> Tentar Novamente
                        </button>
                      ) : (
                        isStoryMode && !exerciseImageRevealed && generatingImagePage !== null ? (
                          <button disabled className="btn-hero flex-1 flex items-center justify-center gap-2 opacity-60">
                            <Loader2 size={16} className="animate-spin" /> Revelando ilustração...
                          </button>
                        ) : (
                          <button onClick={handleNext} className="btn-hero flex-1 flex items-center justify-center gap-2">
                            {currentIdx < allExercicios.length - 1 ? "Próximo Desafio" : "Ver Resultado"} <ArrowRight size={18} />
                          </button>
                        )
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── IMAGE INTERSTITIAL ── */}
          {hasIntegratedExercises && !isReading && !isDone && showImageInterstitial !== null && (() => {
            const imgIdx = showImageInterstitial;
            const page = atividade.storyPages?.[imgIdx];
            const imgUrl = pageImages[imgIdx];
            const isGen = generatingImagePage === imgIdx;

            return (
              <motion.div
                key={`interstitial-${imgIdx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-2xl bg-card border border-border overflow-y-auto relative px-6 py-4"
              >
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-bold text-foreground text-center mb-4 flex-shrink-0"
                >
                  🎨 Nova cena desbloqueada!
                </motion.p>

                <div className="w-full max-w-3xl flex-shrink-0">
                  <StoryFrameImage
                    imageUrl={imgUrl}
                    isGenerating={isGen || !imgUrl}
                    title={page?.titulo || `Cena ${imgIdx + 1}`}
                  />
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={dismissImageInterstitial}
                  disabled={isGen || !imgUrl}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-hero px-8 py-3 flex items-center gap-2 disabled:opacity-50 mt-6 flex-shrink-0"
                >
                  Continuar Aventura <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            );
          })()}

          {/* ── LINEAR 8-STEP EXERCISES (story mode) ── */}
          {hasIntegratedExercises && !isReading && !isDone && showImageInterstitial === null && (() => {
            const step = currentIdx;
            const minijogos = (atividade as any).minijogos_aquecimento;
            const pages = atividade.storyPages || [];

            type ExStep = { type: string; label: string; emoji: string; data?: any; text?: string };
            const sequence: ExStep[] = [
              { type: 'lacunas',       label: 'Preencha as Lacunas',       emoji: '✍️', data: minijogos?.lacunas },
              { type: 'forca',         label: 'Forca',                     emoji: '🌳', data: minijogos?.forca },
              { type: 'cruzadinha',    label: 'Cruzadinha',                emoji: '🔲', data: minijogos?.cruzadinha },
              { type: 'cacapalavras',  label: 'Caça-Palavras',             emoji: '🔍', data: minijogos?.cacapalavras },
              { type: 'ordenar',       label: 'Ordene os Eventos',         emoji: '📋', data: minijogos?.ordenar },
              { type: 'ligar',         label: 'Relacione as Colunas',      emoji: '🔗', data: minijogos?.ligar },
              { type: 'vf',            label: 'Verdadeiro ou Falso',       emoji: '✅', data: minijogos?.verdadeiroFalso },
              { type: 'gramatica',     label: 'Gramática em Ação',         emoji: '🎯', data: minijogos?.gramatica },
            ];
            const ex = sequence[step];
            if (!ex) return null;

            const genStatus = (
              <div className="absolute top-2.5 right-3 z-20 flex items-center gap-1" title="Status das cenas">
                {Array.from({ length: storyTotalScenes }).map((_, i) => {
                  const hasVid = !!sceneVideos[i];
                  const isGen = generatingVideos[i] || !!sceneRequestIds[i] || generatingImagePage === i;
                  const hasImg = !!pageImages[i];
                  return (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                      hasVid ? 'bg-green-400' : isGen ? 'bg-yellow-400 animate-pulse' : hasImg ? 'bg-yellow-600/60' : 'bg-white/15'
                    }`} />
                  );
                })}
                <span className="text-[9px] text-muted-foreground/50 ml-0.5">🎬</span>
              </div>
            );

            return (
              <motion.div
                key={`linear-ex-${step}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="flex-1 min-h-0 flex flex-col rounded-2xl bg-card border border-border overflow-hidden relative"
              >
                {genStatus}

                <div className="px-5 pt-4 pb-3 border-b border-border/50 flex-shrink-0 space-y-2">
                  {/* Breadcrumb */}
                  <ExerciseBreadcrumb
                    genero={atividade.genero}
                    habilidadeBNCC={atividade.habilidadeBNCC}
                    exercicioLabel={ex.label}
                    exercicioEmoji={ex.emoji}
                    step={step}
                    total={TOTAL_LINEAR_STEPS}
                  />
                  {/* Progress dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {sequence.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${
                          i < step ? 'bg-primary w-4' : i === step ? 'bg-primary/60 w-5 animate-pulse' : 'bg-muted w-3'
                        }`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>{ex.emoji}</span> {ex.label}
                  </p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-5">
                  {ex.type === 'lacunas' && ex.data?.frases?.length > 0 && (
                    <ExercicioCompletar
                      key={`lacunas-${step}`}
                      enunciado={ex.data.textoContexto || 'Complete as frases com base no texto:'}
                      frases={ex.data.frases}
                      opcoes={[]}
                      respostaCorreta={0}
                      onAnswer={(acertou, erros, chutes) => {
                        exerciseResults.current.push({ categoria: 'interpretacao', acertou, exercicioIdx: step });
                        setPontos(p => p + 10);
                        setAcertos(a => a + 1);
                        setTimeout(() => advanceLinearStep(step), 900);
                      }}
                      showResult={false}
                    />
                  )}

                  {ex.type === 'forca' && ex.data?.palavra && (
                    <ExerciseProgressWrapper
                      textoContexto={ex.data.textoContexto}
                      label={ex.label}
                      emoji={ex.emoji}
                    >
                      <ExercicioForca
                        key={`forca-${step}`}
                        palavra={ex.data.palavra}
                        dica={ex.data.dica || ''}
                        onComplete={() => {
                          exerciseResults.current.push({ categoria: 'vocabulario', acertou: true, exercicioIdx: step });
                          playCorrectSound();
                          setPontos(p => p + 8);
                          setAcertos(a => a + 1);
                          advanceLinearStep(step);
                        }}
                      />
                    </ExerciseProgressWrapper>
                  )}

                  {ex.type === 'cruzadinha' && (ex.data?.palavras?.length > 0) && (
                    <ExerciseProgressWrapper
                      textoContexto={ex.data.textoContexto}
                      label={ex.label}
                      emoji={ex.emoji}
                      answeredCount={0}
                      totalCount={ex.data.palavras?.length || 0}
                    >
                      <ExercicioCruzadinha
                        key={`cruz-${step}`}
                        palavras={ex.data.palavras}
                        onComplete={() => {
                          exerciseResults.current.push({ categoria: 'vocabulario', acertou: true, exercicioIdx: step });
                          playCorrectSound();
                          setPontos(p => p + 8);
                          setAcertos(a => a + 1);
                          advanceLinearStep(step);
                        }}
                      />
                    </ExerciseProgressWrapper>
                  )}

                  {ex.type === 'cacapalavras' && (ex.data?.grade?.length > 0) && (() => {
                    const totalW = (ex.data.palavras || []).length;
                    return (
                    <ExerciseProgressWrapper
                      textoContexto={undefined}
                      label={ex.label}
                      emoji={ex.emoji}
                      answeredCount={cacaProgress}
                      totalCount={totalW}
                    >
                      <ExercicioCacaPalavras
                        key={`caca-${step}`}
                        textoContexto={ex.data.textoContexto}
                        grade={ex.data.grade}
                        palavras={ex.data.palavras || []}
                        onProgress={(found, total) => setCacaProgress(found)}
                        onComplete={() => {
                          exerciseResults.current.push({ categoria: 'vocabulario', acertou: true, exercicioIdx: step });
                          playCorrectSound();
                          setPontos(p => p + 8);
                          setAcertos(a => a + 1);
                          advanceLinearStep(step);
                        }}
                      />
                    </ExerciseProgressWrapper>
                    );
                  })()}

                  {ex.type === 'ordenar' && ex.data?.itensOrdenados?.length > 0 && (
                    <ExerciseProgressWrapper
                      textoContexto={ex.data.textoContexto}
                      label={ex.label}
                      emoji={ex.emoji}
                      answeredCount={0}
                      totalCount={ex.data.itensOrdenados?.length || 0}
                    >
                      <ExercicioOrdenar
                        key={`ordenar-${step}`}
                        itensOrdenados={ex.data.itensOrdenados}
                        onComplete={(acertou) => {
                          exerciseResults.current.push({ categoria: 'interpretacao', acertou, exercicioIdx: step });
                          if (acertou) { playCorrectSound(); setPontos(p => p + 10); setAcertos(a => a + 1); }
                          else { playWrongSound(); setCombo(0); }
                          setTimeout(() => advanceLinearStep(step), 900);
                        }}
                        showResult={false}
                      />
                    </ExerciseProgressWrapper>
                  )}

                  {ex.type === 'ligar' && ex.data?.pares?.length > 0 && (
                    <ExerciseProgressWrapper
                      textoContexto={ex.data.textoContexto}
                      label={ex.label}
                      emoji={ex.emoji}
                      answeredCount={0}
                      totalCount={ex.data.pares?.length || 0}
                    >
                      <ExercicioLigar
                        key={`ligar-${step}`}
                        textoContexto={undefined}
                        pares={ex.data.pares}
                        onComplete={(acertou) => {
                          exerciseResults.current.push({ categoria: 'interpretacao', acertou, exercicioIdx: step });
                          if (acertou) { playCorrectSound(); setPontos(p => p + 10); setAcertos(a => a + 1); }
                          else { playWrongSound(); setCombo(0); }
                          setTimeout(() => advanceLinearStep(step), 900);
                        }}
                        showResult={false}
                      />
                    </ExerciseProgressWrapper>
                  )}

                  {ex.type === 'vf' && ex.data?.afirmacoes?.length > 0 && (
                    <ExerciseProgressWrapper
                      textoContexto={ex.data.textoContexto}
                      label={ex.label}
                      emoji={ex.emoji}
                      answeredCount={0}
                      totalCount={ex.data.afirmacoes?.length || 0}
                    >
                      <ExercicioVF
                        key={`vf-${step}`}
                        textoContexto={ex.data.textoContexto || ''}
                        afirmacoes={ex.data.afirmacoes}
                        onComplete={(acertou) => {
                          exerciseResults.current.push({ categoria: 'interpretacao', acertou, exercicioIdx: step });
                          if (acertou) { playCorrectSound(); setPontos(p => p + 12); setAcertos(a => a + 1); }
                          else { playWrongSound(); setCombo(0); }
                          setTimeout(() => advanceLinearStep(step), 900);
                        }}
                      />
                    </ExerciseProgressWrapper>
                  )}

                  {ex.type === 'gramatica' && ex.data?.palavras?.length > 0 && (
                    <ExerciseProgressWrapper
                      textoContexto={ex.data.textoContexto}
                      label={ex.label}
                      emoji={ex.emoji}
                      answeredCount={0}
                      totalCount={ex.data.palavras?.filter((p: any) => p.classe?.toLowerCase() === (ex.data.classeAlvo || 'substantivo').toLowerCase()).length || 0}
                    >
                      <ExercicioGramaticaCaindo
                        key={`gram-${step}`}
                        textoContexto={ex.data.textoContexto || ''}
                        classeAlvo={ex.data.classeAlvo || 'substantivo'}
                        palavras={ex.data.palavras}
                        onComplete={(acertou) => {
                          exerciseResults.current.push({ categoria: 'gramatica', acertou, exercicioIdx: step });
                          if (acertou) { playCorrectSound(); setPontos(p => p + 10); setAcertos(a => a + 1); }
                          else { playWrongSound(); setCombo(0); }
                          setTimeout(() => advanceLinearStep(step), 900);
                        }}
                      />
                    </ExerciseProgressWrapper>
                  )}

                  {!ex.data && (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <p className="text-muted-foreground text-sm">Exercício não disponível.</p>
                      <button onClick={() => advanceLinearStep(step)} className="btn-hero px-6 py-2 text-sm flex items-center gap-2">
                        Continuar <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}
          {/* ── END LINEAR EXERCISES ── */}

          {/* DONE */}
          {isDone && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 min-h-0 overflow-y-auto"
            >
              {/* Show all revealed story pages */}
              {isStoryMode && revealedPages > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={20} className="text-primary" />
                    <h3 className="font-display text-xl text-foreground">Sua História</h3>
                  </div>
                  {Array.from({ length: revealedPages }).map((_, i) => renderBookPage(i))}
                </div>
              )}

              <div className="card-edu text-center py-12">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-4">
                  🏆
                </motion.div>
                <h3 className="font-display text-3xl text-foreground mb-2">Parabéns!</h3>
                <p className="text-muted-foreground font-semibold mb-6">
                  Você completou a história "{atividade.titulo}"
                </p>
                <div className="flex justify-center gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{acertos}</p>
                    <p className="text-xs text-muted-foreground font-semibold">Acertos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">{exerciseResults.current.length - acertos}</p>
                    <p className="text-xs text-muted-foreground font-semibold">Erros</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Sparkles size={20} className="text-xp" />
                      <p className="text-3xl font-bold text-xp">{pontos}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold">Brazukas ganhos</p>
                  </div>
                </div>

                {/* Scene Player Button (story mode) */}
                {isStoryMode && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenScenePlayer}
                    disabled={generatingScenes}
                    className="w-full mb-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {generatingScenes ? (
                      <><Loader2 size={22} className="animate-spin" /> Preparando cenas...</>
                    ) : (
                      <><Play size={22} /> 🎬 Ver Minha História Completa</>
                    )}
                  </motion.button>
                )}

                {/* MagicBook Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateMagicBook}
                  disabled={generatingBook}
                  className="w-full mb-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-info/10 border-2 border-primary/30 text-foreground font-bold hover:border-primary transition-colors disabled:opacity-50"
                >
                  {generatingBook ? (
                    <><Loader2 size={20} className="animate-spin" /> Criando MagicBook...</>
                  ) : (
                    <><Wand2 size={20} className="text-primary" /> ✨ Transformar em MagicBook</>
                  )}
                </motion.button>

                <div className="flex gap-3 justify-center">
                  <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 border-2 border-[#25D366]/30 text-[#25D366] font-bold hover:bg-[#25D366]/20 transition-colors">
                    <Share2 size={18} /> WhatsApp
                  </button>
                  <button onClick={handleRegenerate} disabled={regenerating} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted border-2 border-border text-foreground font-bold hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
                    {regenerating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    Nova história
                  </button>
                  <button onClick={() => navigate("/")} className="btn-hero">
                    Voltar ao Início
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>{/* end main content */}
      </div>

      {/* SCENE PLAYER MODAL */}
      <AnimatePresence>
        {showScenePlayer && atividade.storyPages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex"
          >
            {/* Scene content + controls */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {atividade.storyPages[currentScene] && (
                    <motion.div
                      key={`scene-${currentScene}`}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {sceneVideos[currentScene] ? (
                        <div className="absolute inset-0">
                          <video
                            ref={videoRef}
                            src={sceneVideos[currentScene]}
                            className="w-full h-full object-cover"
                            autoPlay loop playsInline
                          />
                        </div>
                      ) : (
                        pageImages[currentScene] ? (
                          <CinematicScene
                            imageUrl={pageImages[currentScene]}
                            isPlaying={isPlaying}
                            sceneIndex={currentScene}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                        )
                      )}
                      {/* Video waiting screen with facts while video is generating/polling */}
                      {!sceneVideos[currentScene] && (generatingVideos[currentScene] || sceneRequestIds[currentScene]) && (
                        <VideoWaitingScreen visible={showVideoWaiting} />
                      )}
                      {/* Cinema-style yellow subtitle at bottom */}
                      <div className="absolute bottom-2 left-0 right-0 px-6 flex flex-col items-center pointer-events-none z-20">
                        <div className="max-w-3xl w-full">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-5 py-2.5">
                            <p
                              className="text-center font-bold leading-relaxed drop-shadow-lg"
                              style={{
                                color: '#FFD700',
                                fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
                                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.7)',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {atividade.storyPages[currentScene].texto}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-3 mt-1.5">
                            <span className="text-white/40 text-[10px] font-medium tracking-wide uppercase">
                              {atividade.storyPages[currentScene].titulo}
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="text-white/30 text-[10px]">
                              {currentScene + 1}/{atividade.storyPages.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-black/90 border-t border-white/10">
                <button onClick={handleCloseScenePlayer} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                  <X size={16} /> Sair
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={handleReplayScene} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                    <RotateCcw size={16} /> Rever
                  </button>
                  <button onClick={handleTogglePlay} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  {currentScene < (atividade.storyPages?.length || 0) - 1 ? (
                    <button
                      onClick={handleNextScene}
                      disabled={generatingVideos[currentScene + 1]}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                      {generatingVideos[currentScene + 1] ? (
                        <><Loader2 size={14} className="animate-spin" /> Gerando...</>
                      ) : sceneVideos[currentScene + 1] ? (
                        <>Próxima <SkipForward size={16} /></>
                      ) : (
                        <>Gerar Próxima Cena <Sparkles size={14} /></>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={handleSaveProduction} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-secondary/20 text-secondary font-bold text-sm hover:bg-secondary/30 transition-colors">
                        💾 Salvar Produção
                      </button>
                      <button onClick={() => handleCloseScenePlayer()} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/80 transition-colors">
                        Finalizar <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {loadingAudios[currentScene] && (
                    <span className="text-xs text-white/50 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Áudio...</span>
                  )}
                  {(!sceneVideos[currentScene] && (generatingVideos[currentScene] || sceneRequestIds[currentScene])) && (
                    <button
                      onClick={() => setShowVideoWaiting(v => !v)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${showVideoWaiting ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                    >
                      <Lightbulb size={14} /> Você Sabia
                    </button>
                  )}
                  <button onClick={() => setShowVideoSidebar(s => !s)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                    {showVideoSidebar ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                    Cenas
                  </button>
                  <button onClick={handleShareWhatsApp} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#25D366]/20 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/30 transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Sidebar */}
            <AnimatePresence>
              {showVideoSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-black/95 border-l border-white/10 overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <BookOpen size={16} /> Cenas Geradas
                      </h4>
                      <button onClick={() => setShowVideoSidebar(false)} className="text-white/50 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {atividade.storyPages?.map((page, idx) => (
                      <motion.button
                        key={`sidebar-scene-${idx}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => { setCurrentScene(idx); playScene(idx); }}
                        className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all ${
                          currentScene === idx ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="relative aspect-video">
                          {sceneVideos[idx] ? (
                            <video src={sceneVideos[idx]} className="w-full h-full object-cover" muted playsInline />
                          ) : pageImages[idx] ? (
                            <img src={pageImages[idx]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <span className="text-2xl">🎨</span>
                            </div>
                          )}
                          <div className="absolute top-1.5 right-1.5">
                            {sceneVideos[idx] ? (
                              <span className="px-1.5 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-bold">▶ Vídeo</span>
                            ) : generatingVideos[idx] ? (
                              <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/80 text-white text-[10px] font-bold flex items-center gap-1">
                                <Loader2 size={8} className="animate-spin" /> Gerando
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full bg-white/30 text-white text-[10px] font-bold">📷 Imagem</span>
                            )}
                          </div>
                          {currentScene === idx && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Play size={24} className="text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-white text-xs font-bold truncate">{page.titulo}</p>
                          <p className="text-white/50 text-[10px]">Cena {idx + 1}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <ExerciseHintBubble hint={hint} onDismiss={dismissHint} />
      <TrophyPopup trophy={wonTrophy} onClose={() => setWonTrophy(null)} />
    </div>
  );
}
