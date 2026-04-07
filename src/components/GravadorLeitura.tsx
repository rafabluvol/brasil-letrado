import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, RotateCcw, Star, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeituraFeedback {
  nota: number;
  status: string;
  emoji: string;
  mensagem_principal: string;
  pontos_positivos: string[];
  pontos_melhoria: string[];
  dica_especial: string;
  palavras_dificeis: string[];
  precisao_estimada: number;
  deve_repetir: boolean;
}

interface Props {
  textoOriginal: string;
  trechoDestaque: string;
  ano: string;
  onLeituraRealizada: () => void;
}

export default function GravadorLeitura({ textoOriginal, trechoDestaque, ano, onLeituraRealizada }: Props) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "recording" | "analyzing" | "done">("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<LeituraFeedback | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Não suportado", description: "Seu navegador não suporta reconhecimento de voz. Tente no Chrome.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
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
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast({ title: "Microfone bloqueado", description: "Permita o acesso ao microfone nas configurações do navegador.", variant: "destructive" });
        setStatus("idle");
      }
    };

    recognition.onend = () => {
      // If still in recording status, the recognition ended naturally
      if (status === "recording") {
        setTranscript(finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    setStatus("recording");
    setTranscript("");
    setFeedback(null);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [toast, status]);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentTranscript = transcript.trim();
    if (!currentTranscript || currentTranscript.length < 5) {
      toast({ title: "Leitura muito curta", description: "Tente ler o trecho completo em voz alta.", variant: "destructive" });
      setStatus("idle");
      return;
    }

    setStatus("analyzing");
    onLeituraRealizada();

    try {
      const { data, error } = await supabase.functions.invoke("analyze-leitura", {
        body: {
          textoOriginal,
          transcricaoAluno: currentTranscript,
          trechoDestaque,
          ano,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setFeedback(data);
      setStatus("done");
    } catch (err: any) {
      toast({ title: "Erro na análise", description: err.message || "Tente novamente.", variant: "destructive" });
      setStatus("idle");
    }
  }, [transcript, textoOriginal, trechoDestaque, ano, onLeituraRealizada, toast]);

  const reset = () => {
    setStatus("idle");
    setTranscript("");
    setFeedback(null);
    setSeconds(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!supported) {
    return (
      <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
        <p className="text-sm text-muted-foreground">
          ⚠️ Seu navegador não suporta reconhecimento de voz. Use o Google Chrome para esta funcionalidade.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording controls */}
      {status === "idle" && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/10 border-2 border-primary/20 text-primary font-bold hover:bg-primary/20 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Mic size={20} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">Gravar minha leitura</p>
            <p className="text-xs font-normal opacity-70">Clique e leia o trecho em voz alta</p>
          </div>
        </motion.button>
      )}

      {status === "recording" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-xl bg-primary/5 border-2 border-primary/30 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-4 h-4 rounded-full bg-primary"
              />
              <span className="text-sm font-bold text-primary">Gravando...</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{formatTime(seconds)}</span>
          </div>

          {/* Live transcript */}
          {transcript && (
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs font-bold text-muted-foreground mb-1">📝 Captando sua leitura:</p>
              <p className="text-sm text-foreground leading-relaxed italic">{transcript}</p>
            </div>
          )}

          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-white font-bold hover:opacity-90 transition-colors"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Square size={16} />
            Parar e analisar
          </button>
        </motion.div>
      )}

      {status === "analyzing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20 text-center space-y-3"
        >
          <Loader2 size={32} className="animate-spin text-primary mx-auto" />
          <p className="text-sm font-bold text-primary">O Brasil Letrado está analisando sua leitura...</p>
          <p className="text-xs text-muted-foreground">Isso leva só alguns segundos!</p>
        </motion.div>
      )}

      {/* Feedback display */}
      <AnimatePresence>
        {status === "done" && feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main feedback card */}
            <div className={`p-5 rounded-xl border-2 ${
              feedback.nota >= 4 ? "bg-success/5 border-success/20" :
              feedback.nota >= 3 ? "bg-info/5 border-info/20" :
              "bg-secondary/5 border-secondary/20"
            }`}>
              {/* Header with emoji and score */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{feedback.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-lg">{feedback.mensagem_principal}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i <= feedback.nota ? "text-xp fill-xp" : "text-muted"}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">
                      Precisão: {feedback.precisao_estimada}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Positive points */}
              {feedback.pontos_positivos.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-success mb-1.5">✅ O que você mandou bem:</p>
                  <ul className="space-y-1">
                    {feedback.pontos_positivos.map((p, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement points */}
              {feedback.pontos_melhoria.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-info mb-1.5">💡 Para melhorar:</p>
                  <ul className="space-y-1">
                    {feedback.pontos_melhoria.map((p, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <AlertCircle size={14} className="text-info mt-0.5 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Difficult words */}
              {feedback.palavras_dificeis && feedback.palavras_dificeis.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-secondary mb-1.5">📚 Palavras para praticar:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.palavras_dificeis.map((w, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-semibold">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special tip */}
              {feedback.dica_especial && (
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="text-xs font-bold text-primary mb-1">📚 Dica do Brasil Letrado:</p>
                  <p className="text-sm text-foreground">{feedback.dica_especial}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-muted border-2 border-border text-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors"
              >
                <RotateCcw size={16} />
                {feedback.deve_repetir ? "Tentar novamente" : "Ler mais uma vez"}
              </button>
            </div>

            {/* Transcript preview */}
            {transcript && (
              <details className="text-xs">
                <summary className="text-muted-foreground cursor-pointer font-semibold hover:text-foreground">
                  Ver o que foi captado
                </summary>
                <p className="mt-2 p-3 rounded-lg bg-muted text-muted-foreground italic">{transcript}</p>
              </details>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
