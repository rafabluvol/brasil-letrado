import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import TreeSVG from "./forca/TreeSVG";

interface Props {
  palavra: string;
  dica: string;
  onComplete: () => void;
}

const MAX_ERRORS = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Strip accents for comparison */
const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function ExercicioForca({ palavra, dica, onComplete }: Props) {
  const wordUpper = palavra.toUpperCase();
  const wordStripped = strip(wordUpper); // accent-free version for matching
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const errors = [...guessed].filter(l => !wordStripped.includes(l)).length;
  const won = wordStripped.split("").every(c => c === " " || c === "-" || guessed.has(c));
  const lost = errors >= MAX_ERRORS;

  const handleGuess = (letter: string) => {
    if (finished || guessed.has(letter) || won || lost) return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);
    const newErrors = [...next].filter(l => !wordStripped.includes(l)).length;
    const newWon = wordStripped.split("").every(c => c === " " || c === "-" || next.has(c));
    if (newWon || newErrors >= MAX_ERRORS) {
      setFinished(true);
      setTimeout(() => onComplete(), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Hint */}
      <p className="text-muted-foreground text-xs font-medium text-center">
        💡 Dica: <span className="text-foreground font-semibold">{dica}</span>
      </p>

      <div className="flex items-center gap-6 flex-wrap justify-center">
        {/* Tree */}
        <TreeSVG errors={errors} won={won && finished} maxErrors={MAX_ERRORS} />

        <div className="flex flex-col items-center gap-3">
          {/* Leaf counter */}
          <div className="flex gap-1 items-center">
            <span className="text-[10px] text-muted-foreground font-medium mr-1">Folhas:</span>
            {Array.from({ length: MAX_ERRORS }).map((_, i) => (
              <motion.span
                key={i}
                animate={i < errors ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
                className="text-base leading-none"
              >
                {i < errors ? "🍂" : "🍃"}
              </motion.span>
            ))}
          </div>

          {/* Word blanks — show accented original when won, stripped while guessing */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {wordUpper.split("").map((originalChar, i) => {
              const strippedChar = strip(originalChar);
              const isRevealed = guessed.has(strippedChar);
              // Show the accented original char when revealed or lost, stripped while hidden
              const displayChar = isRevealed || lost ? originalChar : "_";

              return originalChar === " " ? (
                <span key={i} className="w-3" />
              ) : (
                <motion.div
                  key={i}
                  animate={isRevealed ? { scale: [1, 1.25, 1] } : {}}
                  className="flex flex-col items-center"
                >
                  <span className={`text-lg font-extrabold w-7 text-center transition-colors ${
                    isRevealed
                      ? won ? 'text-green-500' : lost ? 'text-red-400' : 'text-foreground'
                      : lost ? 'text-red-400/60' : 'text-transparent'
                  }`}>
                    {displayChar}
                  </span>
                  <div className="w-7 h-0.5 bg-border mt-0.5" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
        {ALPHABET.map(letter => {
          const isGuessed = guessed.has(letter);
          const isInWord = wordStripped.includes(letter);
          return (
            <motion.button
              key={letter}
              whileTap={!isGuessed && !finished ? { scale: 0.85 } : {}}
              disabled={isGuessed || finished}
              onClick={() => handleGuess(letter)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                isGuessed
                  ? isInWord
                    ? 'border-green-400 bg-green-400/15 text-green-600 dark:text-green-300'
                    : 'border-destructive/20 bg-destructive/5 text-destructive/30'
                  : 'border-border bg-muted/50 text-foreground hover:bg-primary/10 hover:border-primary/50'
              }`}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>

      {/* Result message */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center px-5 py-2.5 rounded-xl font-bold text-sm ${
              won ? 'bg-green-400/15 text-green-600 dark:text-green-300 border border-green-400/30'
                  : 'bg-orange-400/15 text-orange-600 dark:text-orange-300 border border-orange-400/30'
            }`}
          >
            {won
              ? <><CheckCircle2 size={15} className="inline mr-1.5" />A árvore floresceu! 🌸</>
              : <>🍂 A palavra era: <strong>{wordUpper}</strong> — continue assim!</>
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
