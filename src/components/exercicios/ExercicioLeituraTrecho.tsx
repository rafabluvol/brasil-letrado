import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, RotateCcw, Star, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  trecho: string;
  instrucao: string;
  genero: string;
  ano: string;
  onComplete: (acertou: boolean) => void;
  showResult: boolean;
}

export default function ExercicioLeituraTrecho({ trecho, instrucao, genero, ano, onComplete, showResult }: Props) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "recording" | "analyzing" | "done">("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [seconds, setSeconds] = useState(0);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    };
  }, []);

  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Não suportado", description: "Use o Google Chrome para gravar.", variant: "destructive" });
      return;
    }

    const recognition = new SR();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        toast({ title: "Microfone bloqueado", description: "Permita o acesso ao microfone.", variant: "destructive" });
        setStatus("idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setStatus("recording");
    setTranscript("");
    setFeedback(null);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [toast]);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const currentTranscript = transcript.trim();
    if (!currentTranscript || currentTranscript.length < 3) {
      toast({ title: "Leitura muito curta", description: "Tente ler o trecho completo.", variant: "destructive" });
      setStatus("idle");
      return;
    }

    setStatus("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-leitura", {
        body: {
          textoOriginal: trecho,
          transcricaoAluno: currentTranscript,
          trechoDestaque: trecho,
          ano,
          genero,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setFeedback(data);
      setStatus("done");
      onComplete(true);
    } catch (err: any) {
      toast({ title: "Erro na análise", description: err.message || "Tente novamente.", variant: "destructive" });
      setStatus("idle");
    }
  }, [transcript, trecho, ano, genero, onComplete, toast]);

  const reset = () => {
    setStatus("idle");
    setTranscript("");
    setFeedback(null);
    setSeconds(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!supported) {
    return (
      <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
        <p className="text-xs text-muted-foreground">⚠️ Use o Google Chrome para esta funcionalidade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Instructions - compact */}
      <div className="p-3 rounded-xl bg-info/5 border border-info/20">
        <p className="text-xs font-semibold text-info mb-1.5">📢 {instrucao}</p>
        <div className="p-3 rounded-lg bg-card border border-info/10">
          <p className="text-sm text-foreground leading-relaxed">{trecho}</p>
        </div>
      </div>

      {/* Recording UI */}
      {status === "idle" && !showResult && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold hover:bg-primary/20 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Mic size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold">Iniciar Gravação</p>
            <p className="text-[10px] font-normal opacity-70">Leia o trecho em voz alta</p>
          </div>
        </motion.button>
      )}

      {status === "recording" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-xl bg-primary/5 border border-primary/30 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 rounded-full bg-primary"
              />
              <span className="text-xs font-bold text-primary">Gravando...</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{formatTime(seconds)}</span>
          </div>

          {transcript && (
            <div className="p-2 rounded-lg bg-card border border-border">
              <p className="text-[10px] font-bold text-muted-foreground mb-0.5">📝 Captando:</p>
              <p className="text-xs text-foreground leading-relaxed">{transcript}</p>
            </div>
          )}

          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-colors"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Square size={14} />
            Parar e Analisar
          </button>
        </motion.div>
      )}

      {status === "analyzing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-2">
          <Loader2 size={24} className="animate-spin text-primary mx-auto" />
          <p className="text-xs font-bold text-primary">Analisando sua leitura...</p>
        </motion.div>
      )}

      {/* Feedback - compact, side-by-side layout */}
      <AnimatePresence>
        {status === "done" && feedback && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className={`p-3 rounded-xl border ${
              feedback.nota >= 4 ? "bg-success/5 border-success/20" :
              "bg-info/5 border-info/20"
            }`}>
              {/* Header */}
              <p className="font-semibold text-foreground text-sm leading-snug mb-1">{feedback.mensagem_principal}</p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} className={i <= feedback.nota ? "text-xp fill-xp" : "text-muted"} />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1">Precisão: {feedback.precisao_estimada}%</span>
              </div>

              {/* Side-by-side: Mandou bem | Para melhorar */}
              <div className="grid grid-cols-2 gap-2">
                {feedback.pontos_positivos?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-success mb-1">✅ Mandou bem:</p>
                    <ul className="space-y-0.5">
                      {feedback.pontos_positivos.map((p: string, i: number) => (
                        <li key={i} className="text-[11px] text-foreground flex items-start gap-1">
                          <CheckCircle2 size={10} className="text-success mt-0.5 flex-shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.pontos_melhoria?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-info mb-1">💡 Para melhorar:</p>
                    <ul className="space-y-0.5">
                      {feedback.pontos_melhoria.map((p: string, i: number) => (
                        <li key={i} className="text-[11px] text-foreground flex items-start gap-1">
                          <AlertCircle size={10} className="text-info mt-0.5 flex-shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {feedback.dica_especial && (
                <div className="mt-2 p-2 rounded-lg bg-card border border-border">
                  <p className="text-[10px] font-bold text-primary mb-0.5">📚 Dica:</p>
                  <p className="text-[11px] text-foreground leading-snug">{feedback.dica_especial}</p>
                </div>
              )}
            </div>

            {!showResult && (
              <button onClick={reset} className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-muted border border-border text-foreground font-semibold text-xs hover:border-primary hover:text-primary transition-colors">
                <RotateCcw size={13} /> Ler novamente
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
