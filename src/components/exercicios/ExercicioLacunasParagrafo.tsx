import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, Sparkles } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

function shuffleOptions(opcoes: string[], respostaCorreta: number): { shuffled: string[]; correctIdx: number } {
  const indexed = opcoes.map((opt, i) => ({ opt, isCorrect: i === respostaCorreta }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    shuffled: indexed.map(x => x.opt),
    correctIdx: indexed.findIndex(x => x.isCorrect),
  };
}

interface Frase {
  frase: string;
  opcoes: string[];
  respostaCorreta: number;
}

interface Emocao {
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
}

interface Paragrafo {
  textoContexto: string;
  frases: Frase[];
  emocao?: Emocao;
}

interface Props {
  paragrafos: Paragrafo[];
  onAllDone: () => void;
  onPhaseChange?: (phase: number) => void;
}

const CHUTE_THRESHOLD_MS = 2500;
const CHUTE_STREAK_TRIGGER = 2;
const CHUTE_MESSAGES = [
  "🐢 Eiii, calma! A pressa é inimiga da perfeição!",
  "🧠 Leia com atenção antes de clicar! Sem chutômetro!",
  "🐌 Devagar se vai ao longe! Pense antes de responder.",
  "🎯 Quem tem pressa come cru! Respire e tente de novo.",
  "🤔 Pense um pouquinho mais! Ler com calma é o segredo.",
];

export default function ExercicioLacunasParagrafo({ paragrafos, onAllDone, onPhaseChange }: Props) {
  const [phase, setPhase] = useState(0);
  const [confirmedCorrect, setConfirmedCorrect] = useState<Set<number>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [showChutePopup, setShowChutePopup] = useState(false);
  const [chuteMessage, setChuteMessage] = useState("");
  
  // Emoji state
  const [emojiSelected, setEmojiSelected] = useState<number | null>(null);
  const [emojiDone, setEmojiDone] = useState(false);
  const [emojiWrong, setEmojiWrong] = useState(false);

  const initialized = useRef(false);
  const lastAttemptTime = useRef<number[]>([]);
  const fastWrongStreak = useRef(0);

  const currentPara = paragrafos[phase];
  const frases = currentPara?.frases || [];
  const emocao = currentPara?.emocao;
  const hasEmocao = !!emocao;

  const shuffledFrases = useMemo(() => {
    return frases.map(f => {
      const { shuffled, correctIdx } = shuffleOptions(f.opcoes, f.respostaCorreta);
      return { ...f, opcoes: shuffled, respostaCorreta: correctIdx };
    });
  }, [phase, frases.length]);

  // Total items = frases + (emocao ? 1 : 0)
  const totalInPhase = frases.length + (hasEmocao ? 1 : 0);

  if (!initialized.current || selectedAnswers.length !== frases.length) {
    initialized.current = true;
    if (selectedAnswers.length !== frases.length) {
      setSelectedAnswers(new Array(frases.length).fill(null));
      setConfirmedCorrect(new Set());
      setWrongFlash(null);
      setEmojiSelected(null);
      setEmojiDone(false);
      setEmojiWrong(false);
      lastAttemptTime.current = new Array(frases.length).fill(0);
      fastWrongStreak.current = 0;
    }
  }

  const allLacunasDone = confirmedCorrect.size === frases.length;
  const allDone = allLacunasDone && (!hasEmocao || emojiDone);
  const answeredCount = confirmedCorrect.size + (emojiDone ? 1 : 0);

  const advancePhase = useCallback(() => {
    setTimeout(() => {
      if (phase < paragrafos.length - 1) {
        const newPhase = phase + 1;
        setPhase(newPhase);
        setConfirmedCorrect(new Set());
        setSelectedAnswers(new Array(paragrafos[newPhase]?.frases?.length || 0).fill(null));
        setEmojiSelected(null);
        setEmojiDone(false);
        setEmojiWrong(false);
        lastAttemptTime.current = new Array(paragrafos[newPhase]?.frases?.length || 0).fill(0);
        fastWrongStreak.current = 0;
        onPhaseChange?.(newPhase);
      } else {
        onAllDone();
      }
    }, 1200);
  }, [phase, paragrafos, onAllDone, onPhaseChange]);

  const handleSelect = useCallback((fraseIdx: number, optIdx: number) => {
    if (confirmedCorrect.has(fraseIdx)) return;

    setSelectedAnswers(prev => {
      const next = [...prev];
      next[fraseIdx] = optIdx;
      return next;
    });

    const correct = optIdx === shuffledFrases[fraseIdx].respostaCorreta;
    const now = Date.now();
    const timeSinceLast = now - (lastAttemptTime.current[fraseIdx] || 0);
    lastAttemptTime.current[fraseIdx] = now;

    if (correct) {
      playCorrectSound();
      fastWrongStreak.current = 0;
      setConfirmedCorrect(prev => {
        const next = new Set(prev);
        next.add(fraseIdx);
        // If all lacunas done and no emocao (or emocao already done), advance
        if (next.size === frases.length && (!hasEmocao || emojiDone)) {
          advancePhase();
        }
        return next;
      });
    } else {
      playWrongSound();
      setWrongFlash(fraseIdx);

      if (timeSinceLast > 0 && timeSinceLast < CHUTE_THRESHOLD_MS) {
        fastWrongStreak.current++;
        if (fastWrongStreak.current >= CHUTE_STREAK_TRIGGER) {
          fastWrongStreak.current = 0;
          const msg = CHUTE_MESSAGES[Math.floor(Math.random() * CHUTE_MESSAGES.length)];
          setChuteMessage(msg);
          setShowChutePopup(true);
        }
      } else {
        fastWrongStreak.current = 1;
      }

      setTimeout(() => {
        setWrongFlash(null);
        setSelectedAnswers(prev => {
          const next = [...prev];
          next[fraseIdx] = null;
          return next;
        });
      }, 800);
    }
  }, [confirmedCorrect, shuffledFrases, frases, hasEmocao, emojiDone, advancePhase]);

  const handleEmojiSelect = useCallback((idx: number) => {
    if (emojiDone || !emocao) return;
    setEmojiSelected(idx);

    if (idx === emocao.respostaCorreta) {
      playCorrectSound();
      setEmojiDone(true);
      setEmojiWrong(false);
      // If lacunas already done, advance
      if (allLacunasDone) {
        advancePhase();
      }
    } else {
      playWrongSound();
      setEmojiWrong(true);
      setTimeout(() => {
        setEmojiSelected(null);
        setEmojiWrong(false);
      }, 800);
    }
  }, [emojiDone, emocao, allLacunasDone, advancePhase]);

  const progressPct = totalInPhase > 0 ? (answeredCount / totalInPhase) * 100 : 0;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-4 relative">
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

      {/* Phase dots */}
      <div className="flex items-center justify-center gap-3">
        {paragrafos.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${
            i < phase ? 'bg-primary' : i === phase ? 'bg-primary/60 animate-pulse scale-125' : 'bg-muted'
          }`} />
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Parágrafo {phase + 1} de {paragrafos.length}
      </p>

      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">{answeredCount}/{totalInPhase}</span>
      </div>

      {/* Paragraph as flowing text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`phase-${phase}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-5 shadow-sm"
        >
          <div className="text-base leading-[2.2] text-foreground">
            {shuffledFrases.map((frase, fraseIdx) => {
              const parts = frase.frase.split(/_____+/);
              const done = confirmedCorrect.has(fraseIdx);
              const isWrong = wrongFlash === fraseIdx;

              return (
                <span key={fraseIdx}>
                  {parts.map((part, i) => (
                    <span key={i}>
                      <span>{part}</span>
                      {i < parts.length - 1 && (
                        <span className="inline-block relative mx-1 align-middle">
                          <motion.span
                            animate={isWrong ? { x: [0, -4, 4, -3, 3, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="inline-block"
                          >
                            <select
                              value={selectedAnswers[fraseIdx] !== null ? String(selectedAnswers[fraseIdx]) : ""}
                              onChange={(e) => handleSelect(fraseIdx, Number(e.target.value))}
                              disabled={done}
                              className={`appearance-none inline-flex items-center px-3 py-0.5 pr-7 rounded-lg font-bold text-sm min-w-[110px] cursor-pointer transition-all ${
                                done
                                  ? "border-2 border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                  : isWrong
                                  ? "border-2 border-pink-400 bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-300"
                                  : selectedAnswers[fraseIdx] !== null
                                  ? "border-2 border-primary bg-primary/10 text-primary"
                                  : "border-2 border-dashed border-primary/50 bg-transparent text-primary/40 lacuna-shimmer"
                              }`}
                            >
                              <option value="" disabled className="text-muted-foreground bg-card"> </option>
                              {frase.opcoes.map((opt, optIdx) => (
                                <option key={optIdx} value={String(optIdx)} className="bg-card text-foreground">{opt}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                              done ? "text-green-600" : selectedAnswers[fraseIdx] !== null ? "text-primary" : "text-primary/50"
                            }`} />
                          </motion.span>
                          {done && <CheckCircle2 size={12} className="inline ml-0.5 text-green-500" />}
                        </span>
                      )}
                    </span>
                  ))}
                  {' '}
                </span>
              );
            })}
          </div>

          {/* Emoji emotion picker */}
          {hasEmocao && emocao && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: allLacunasDone ? 1 : 0.4, y: 0 }}
              className={`mt-5 p-4 rounded-xl border-2 transition-all ${
                emojiDone
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : emojiWrong
                  ? "border-pink-400 bg-pink-50 dark:bg-pink-900/20"
                  : allLacunasDone
                  ? "border-primary/30 bg-primary/5"
                  : "border-muted bg-muted/30"
              }`}
            >
              <p className="text-sm font-bold text-foreground mb-3 text-center">
                {emocao.pergunta}
              </p>
              <div className="flex items-center justify-center gap-3">
                {emocao.opcoes.map((emoji, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={allLacunasDone && !emojiDone ? { scale: 1.2 } : {}}
                    whileTap={allLacunasDone && !emojiDone ? { scale: 0.9 } : {}}
                    animate={
                      emojiDone && idx === emocao.respostaCorreta
                        ? { scale: [1, 1.3, 1.1], rotate: [0, -10, 10, 0] }
                        : emojiWrong && idx === emojiSelected
                        ? { x: [0, -4, 4, -3, 3, 0] }
                        : {}
                    }
                    onClick={() => allLacunasDone && handleEmojiSelect(idx)}
                    disabled={!allLacunasDone || emojiDone}
                    className={`text-3xl p-2 rounded-xl transition-all ${
                      emojiDone && idx === emocao.respostaCorreta
                        ? "bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500 scale-110"
                        : emojiDone
                        ? "opacity-30 grayscale"
                        : emojiWrong && idx === emojiSelected
                        ? "bg-pink-100 dark:bg-pink-900/30 ring-2 ring-pink-400"
                        : allLacunasDone
                        ? "hover:bg-primary/10 cursor-pointer"
                        : "opacity-40 grayscale cursor-not-allowed"
                    }`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
              {!allLacunasDone && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Complete as lacunas primeiro! ☝️
                </p>
              )}
              {emojiDone && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-600 dark:text-green-400 text-center mt-2 font-bold"
                >
                  Isso aí! Você entendeu o sentimento! ✨
                </motion.p>
              )}
            </motion.div>
          )}

          {/* All done message */}
          <AnimatePresence>
            {allDone && totalInPhase > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-center py-2 px-4 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                {phase < paragrafos.length - 1 ? 'Ótimo! Próximo parágrafo...' : 'Parabéns! Todas as lacunas preenchidas!'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
