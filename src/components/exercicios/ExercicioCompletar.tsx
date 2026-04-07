import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronDown, BookOpen, Sparkles, AlertTriangle } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

interface Frase {
  frase: string;
  opcoes: string[];
  respostaCorreta: number;
}

interface Props {
  enunciado: string;
  opcoes?: string[];
  respostaCorreta?: number;
  frases?: Frase[];
  onAnswer: (correct: boolean, errorCount?: number, chuteCount?: number) => void;
  showResult: boolean;
}

const STEP_EMOJIS = ['📝', '✏️', '🖊️', '📖'];
const ENCOURAGEMENTS = ['Boa!', 'Muito bem!', 'Arrasou!', 'Perfeito!'];
const CHUTE_MESSAGES = [
  "🐢 Eiii, calma! A pressa é inimiga da perfeição!",
  "🧠 Leia com atenção antes de clicar! Sem chutômetro!",
  "🐌 Devagar se vai ao longe! Pense antes de responder.",
  "🎯 Quem tem pressa come cru! Respire e tente de novo.",
  "🤔 Pense um pouquinho mais! Ler com calma é o segredo.",
];

const CHUTE_THRESHOLD_MS = 2500; // less than 2.5s between attempts = too fast
const CHUTE_STREAK_TRIGGER = 2; // 2 fast wrong answers = chute popup

export default function ExercicioCompletar({ enunciado, opcoes, respostaCorreta, frases, onAnswer, showResult }: Props) {
  const normalizedFrases: Frase[] = frases && frases.length > 0
    ? frases
    : opcoes
    ? [{ frase: enunciado, opcoes, respostaCorreta: respostaCorreta as number }]
    : [];

  const [confirmedCorrect, setConfirmedCorrect] = useState<Set<number>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [currentFrase, setCurrentFrase] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(normalizedFrases.length).fill(null));
  const [showChutePopup, setShowChutePopup] = useState(false);
  const [chuteMessage, setChuteMessage] = useState("");

  // Tracking
  const errorCount = useRef(0);
  const chuteCount = useRef(0);
  const lastAttemptTime = useRef<number[]>(new Array(normalizedFrases.length).fill(0));
  const fastWrongStreak = useRef(0);

  const handleSelect = useCallback((fraseIdx: number, optIdx: number) => {
    if (confirmedCorrect.has(fraseIdx)) return;

    setSelectedAnswers(prev => {
      const next = [...prev];
      next[fraseIdx] = optIdx;
      return next;
    });

    const correct = optIdx === normalizedFrases[fraseIdx].respostaCorreta;
    const now = Date.now();
    const timeSinceLast = now - (lastAttemptTime.current[fraseIdx] || 0);
    lastAttemptTime.current[fraseIdx] = now;

    if (correct) {
      playCorrectSound();
      fastWrongStreak.current = 0;
      setConfirmedCorrect(prev => {
        const next = new Set(prev);
        next.add(fraseIdx);
        return next;
      });

      // Auto-advance to next unanswered
      setTimeout(() => {
        setCurrentFrase(cur => {
          for (let i = 1; i <= normalizedFrases.length; i++) {
            const idx = (fraseIdx + i) % normalizedFrases.length;
            if (!confirmedCorrect.has(idx) && idx !== fraseIdx) return idx;
          }
          return cur;
        });
      }, 600);

      // Check if all done
      const newSize = confirmedCorrect.size + 1;
      if (newSize === normalizedFrases.length) {
        setTimeout(() => {
          onAnswer(true, errorCount.current, chuteCount.current);
        }, 1000);
      }
    } else {
      playWrongSound();
      errorCount.current++;
      setWrongFlash(fraseIdx);
      setTimeout(() => setWrongFlash(null), 800);

      // Chute detection
      if (timeSinceLast > 0 && timeSinceLast < CHUTE_THRESHOLD_MS) {
        fastWrongStreak.current++;
        if (fastWrongStreak.current >= CHUTE_STREAK_TRIGGER) {
          chuteCount.current++;
          fastWrongStreak.current = 0;
          const msg = CHUTE_MESSAGES[Math.floor(Math.random() * CHUTE_MESSAGES.length)];
          setChuteMessage(msg);
          setShowChutePopup(true);
        }
      } else {
        fastWrongStreak.current = 1;
      }

      // Reset selection after flash
      setTimeout(() => {
        setSelectedAnswers(prev => {
          const next = [...prev];
          next[fraseIdx] = null;
          return next;
        });
      }, 800);
    }
  }, [confirmedCorrect, normalizedFrases, onAnswer]);

  const answeredCount = confirmedCorrect.size;
  const progressPct = (answeredCount / normalizedFrases.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto gap-4 relative">
      {/* Chute popup */}
      <AnimatePresence>
        {showChutePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowChutePopup(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ rotate: -2 }}
              animate={{ rotate: [-2, 2, -1, 1, 0] }}
              transition={{ duration: 0.5 }}
              className="relative bg-card rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-primary/30 text-center z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">🐢</div>
              <p className="text-lg font-bold text-foreground mb-2">{chuteMessage}</p>
              <p className="text-sm text-muted-foreground mb-4">Leia o texto com atenção e pense na resposta!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChutePopup(false)}
                className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm"
              >
                Entendi! Vou com calma 🧘
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with context */}
      <div className="w-full bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-4 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-primary" />
          <p className="text-xs font-bold text-primary uppercase tracking-wide">Complete as Lacunas</p>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{enunciado}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">{answeredCount}/{normalizedFrases.length}</span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 justify-center">
        {normalizedFrases.map((_, i) => {
          const done = confirmedCorrect.has(i);
          const isWrong = wrongFlash === i;
          const isCurrent = i === currentFrase;
          return (
            <motion.button
              key={i}
              onClick={() => !confirmedCorrect.has(i) && setCurrentFrase(i)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all border-2 ${
                done ? 'border-green-500 bg-green-500/15 text-green-600'
                : isWrong ? 'border-pink-400 bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300'
                : isCurrent ? 'border-primary bg-primary/10 text-primary scale-110 shadow-lg'
                : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {done ? <CheckCircle2 size={16} /> : isWrong ? <XCircle size={16} /> : STEP_EMOJIS[i] || '📝'}
            </motion.button>
          );
        })}
      </div>

      {/* Sentence cards */}
      <div className="w-full space-y-3">
        {normalizedFrases.map((frase, fraseIdx) => {
          const parts = frase.frase.split(/_____+/);
          const hasBlank = parts.length > 1;
          const done = confirmedCorrect.has(fraseIdx);
          const isWrong = wrongFlash === fraseIdx;
          const isCurrent = fraseIdx === currentFrase;
          const displayOpcoes = (frase.opcoes ?? []).map((opt, i) => ({ text: opt, originalIdx: i }));

          return (
            <motion.div
              key={fraseIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1, y: 0,
                x: isWrong ? [0, -6, 6, -4, 4, 0] : 0,
              }}
              transition={isWrong ? { duration: 0.4 } : { delay: fraseIdx * 0.08 }}
              onClick={() => !done && setCurrentFrase(fraseIdx)}
              className={`relative rounded-2xl border-2 transition-all overflow-hidden cursor-pointer ${
                done ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10 shadow-green-500/10 shadow-md'
                : isWrong ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20 shadow-pink-400/20 shadow-md'
                : isCurrent ? 'border-primary bg-primary/5 shadow-primary/10 shadow-lg'
                : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              {/* Card number badge */}
              <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl text-xs font-bold ${
                done ? 'bg-green-500 text-white'
                : isWrong ? 'bg-pink-400 text-white'
                : isCurrent ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
              }`}>
                {fraseIdx + 1}
              </div>

              <div className="pt-6 px-4 pb-3">
                {hasBlank ? (
                  <p className="text-sm leading-relaxed text-foreground font-medium">
                    {parts.map((part, i) => (
                      <span key={i}>
                        <span>{part}</span>
                        {i < parts.length - 1 && (
                          <span className="inline-block relative mx-1 align-middle">
                            <select
                              value={selectedAnswers[fraseIdx] !== null ? String(selectedAnswers[fraseIdx]) : ""}
                              onChange={(e) => handleSelect(fraseIdx, Number(e.target.value))}
                              disabled={done}
                              className={`appearance-none inline-flex items-center px-3 py-1 pr-7 rounded-lg border-2 font-bold text-sm min-w-[120px] cursor-pointer transition-all ${
                                done
                                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                  : isWrong
                                  ? "border-pink-400 bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-300"
                                  : selectedAnswers[fraseIdx] !== null
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-primary/50 bg-card text-muted-foreground animate-pulse"
                              }`}
                            >
                              <option value="" disabled>Escolha...</option>
                              {displayOpcoes.map((opt) => (
                                <option key={opt.originalIdx} value={String(opt.originalIdx)}>
                                  {opt.text}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">{frase.frase}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {displayOpcoes.map((opt) => {
                        const isSelected = selectedAnswers[fraseIdx] === opt.originalIdx;
                        const isCorrectDone = done && opt.originalIdx === frase.respostaCorreta;
                        const isWrongSelected = isWrong && isSelected;

                        return (
                          <motion.button
                            key={opt.originalIdx}
                            whileHover={!done ? { scale: 1.03, y: -1 } : {}}
                            whileTap={!done ? { scale: 0.97 } : {}}
                            disabled={done}
                            onClick={(e) => { e.stopPropagation(); handleSelect(fraseIdx, opt.originalIdx); }}
                            className={`p-2.5 rounded-xl border-2 text-center font-bold text-sm transition-all ${
                              isCorrectDone
                                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                : isWrongSelected
                                ? "border-pink-400 bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-300"
                                : isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-md"
                                : "border-muted bg-card text-foreground hover:border-primary/40 hover:bg-muted/50"
                            }`}
                          >
                            {opt.text}
                            {isCorrectDone && <CheckCircle2 size={14} className="inline ml-1.5" />}
                            {isWrongSelected && <XCircle size={14} className="inline ml-1.5" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {isWrong && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-300 font-semibold mt-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg px-2 py-1"
                    >
                      <XCircle size={12} />
                      Tente novamente! Leia o texto com atenção.
                    </motion.div>
                  )}
                  {done && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-300 font-bold mt-2"
                    >
                      <Sparkles size={12} /> {ENCOURAGEMENTS[fraseIdx % ENCOURAGEMENTS.length]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
