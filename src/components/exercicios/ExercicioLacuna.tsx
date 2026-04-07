import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface Props {
  texto: string;
  palavraCorreta: string;
  alternativas: [string, string];
  onCorrect: (attempts: number) => void;
  onWrong: () => void;
}

export default function ExercicioLacuna({ texto, palavraCorreta, alternativas, onCorrect, onWrong }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  const options = useMemo(() => {
    const all = [palavraCorreta, ...alternativas];
    return all.sort(() => Math.random() - 0.5);
  }, [palavraCorreta, alternativas[0], alternativas[1]]);

  const textParts = useMemo(() => {
    const lower = texto.toLowerCase();
    const lowerWord = palavraCorreta.toLowerCase();
    const idx = lower.indexOf(lowerWord);
    if (idx === -1) return { before: texto, word: palavraCorreta, after: '' };
    return {
      before: texto.slice(0, idx),
      word: texto.slice(idx, idx + palavraCorreta.length),
      after: texto.slice(idx + palavraCorreta.length),
    };
  }, [texto, palavraCorreta]);

  const handleVerify = () => {
    if (!selected) return;
    const correct = selected.toLowerCase() === palavraCorreta.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      onCorrect(newAttempts);
    } else {
      onWrong();
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setShowResult(false);
    setIsCorrect(null);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Text with blank */}
      <div
        className="text-xl md:text-2xl leading-relaxed font-semibold text-center px-4 py-5 rounded-2xl bg-muted/50 text-foreground"
      >
        {textParts.before}
        {isCorrect ? (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block mx-1 px-2 font-bold text-green-600 bg-green-100 rounded-lg"
          >
            {textParts.word}
          </motion.span>
        ) : (
          <span
            className={`inline-block mx-1 min-w-[90px] text-center border-b-2 font-bold transition-all ${
              selected ? 'border-primary text-primary' : 'border-muted-foreground/40 text-muted-foreground/40'
            }`}
          >
            {selected || '______'}
          </span>
        )}
        {textParts.after}
      </div>

      {/* Options */}
      <AnimatePresence mode="wait">
        {!isCorrect && (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3 justify-center flex-wrap"
          >
            {options.map((opt) => {
              const isSelectedOpt = selected === opt;
              const isWrong = showResult && isSelectedOpt && opt.toLowerCase() !== palavraCorreta.toLowerCase();
              const isCorrectOpt = showResult && opt.toLowerCase() === palavraCorreta.toLowerCase();
              return (
                <motion.button
                  key={opt}
                  whileHover={!showResult ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!showResult ? { scale: 0.95 } : {}}
                  disabled={showResult}
                  onClick={() => !showResult && setSelected(opt)}
                  className={`px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all min-w-[100px] ${
                    isCorrectOpt
                      ? 'border-green-500 bg-green-100 text-green-700'
                      : isWrong
                        ? 'border-red-500 bg-red-100 text-red-700'
                        : isSelectedOpt
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted'
                  }`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-3 px-4 rounded-xl font-bold text-sm ${
              isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            {isCorrect ? (
              <><CheckCircle2 className="inline mr-2" size={16} />Ótimo! Agora ouça a história!</>
            ) : (
              <>Quase! Tente outra vez 😊</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action */}
      <div className="flex justify-center">
        {!showResult ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleVerify}
            disabled={!selected}
            className="btn-hero px-10 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Verificar Resposta
          </motion.button>
        ) : !isCorrect ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRetry}
            className="btn-hero px-10 py-3 flex items-center gap-2"
          >
            <RotateCcw size={16} /> Tentar Novamente
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
