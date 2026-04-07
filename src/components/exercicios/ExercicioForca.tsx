import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Props {
  palavra: string;
  dica: string;
  onComplete: () => void;
}

const MAX_ERRORS = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Tree SVG: 6 stages of leaf loss (0 = full, 6 = bare)
function TreeSVG({ errors, won }: { errors: number; won: boolean }) {
  // Leaf clusters: 6 groups, each disappears at corresponding error count
  const leafGroups = [
    // Top crown
    { cx: 70, cy: 28, rx: 22, ry: 18, stage: 1 },
    // Upper left
    { cx: 45, cy: 42, rx: 18, ry: 14, stage: 2 },
    // Upper right
    { cx: 95, cy: 42, rx: 18, ry: 14, stage: 3 },
    // Mid left
    { cx: 40, cy: 62, rx: 16, ry: 12, stage: 4 },
    // Mid right
    { cx: 100, cy: 62, rx: 16, ry: 12, stage: 5 },
    // Bottom crown
    { cx: 70, cy: 72, rx: 20, ry: 14, stage: 6 },
  ];

  // Flower petals for win state
  const flowers = won ? [
    { cx: 58, cy: 30 }, { cx: 82, cy: 25 }, { cx: 48, cy: 48 },
    { cx: 92, cy: 44 }, { cx: 42, cy: 65 }, { cx: 98, cy: 60 },
  ] : [];

  return (
    <svg viewBox="0 0 140 130" className="w-32 h-32">
      {/* Ground */}
      <ellipse cx="70" cy="118" rx="28" ry="6" fill="rgba(139,90,43,0.3)" />
      {/* Trunk */}
      <rect x="63" y="78" width="14" height="38" rx="7" fill="#8B5A2B" />
      {/* Branches */}
      <line x1="70" y1="85" x2="45" y2="65" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
      <line x1="70" y1="85" x2="95" y2="65" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
      <line x1="70" y1="78" x2="70" y2="45" stroke="#8B5A2B" strokeWidth="6" strokeLinecap="round" />
      {/* Dry branch (appears at max errors) */}
      {errors >= MAX_ERRORS && (
        <>
          <line x1="45" y1="65" x2="35" y2="50" stroke="#6B4423" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="65" x2="105" y2="50" stroke="#6B4423" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {/* Leaf clusters */}
      {leafGroups.map((leaf, i) => {
        const visible = errors < leaf.stage;
        return visible ? (
          <motion.ellipse
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={leaf.rx}
            ry={leaf.ry}
            fill={won ? "#4ade80" : "#22c55e"}
            opacity={won ? 1 : 0.85}
            initial={false}
            animate={{ opacity: visible ? 0.85 : 0, scale: visible ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          // Fallen leaf hint (small dot on ground)
          <motion.circle
            key={`fallen-${i}`}
            cx={leaf.cx + (i % 2 === 0 ? -8 : 8)}
            cy={112}
            r={3}
            fill="#86efac"
            opacity={0.5}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.5, y: 0 }}
          />
        );
      })}
      {/* Flowers (win state) */}
      {flowers.map((f, i) => (
        <motion.g key={`flower-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
          <circle cx={f.cx} cy={f.cy} r={5} fill="#fb7185" opacity={0.9} />
          <circle cx={f.cx} cy={f.cy} r={2} fill="#fef08a" />
        </motion.g>
      ))}
    </svg>
  );
}

export default function ExercicioForca({ palavra, dica, onComplete }: Props) {
  const wordUpper = palavra.toUpperCase();
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const errors = [...guessed].filter(l => !wordUpper.includes(l)).length;
  const won = wordUpper.split("").every(c => c === " " || c === "-" || guessed.has(c));
  const lost = errors >= MAX_ERRORS;

  const handleGuess = (letter: string) => {
    if (finished || guessed.has(letter) || won || lost) return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);
    const newErrors = [...next].filter(l => !wordUpper.includes(l)).length;
    const newWon = wordUpper.split("").every(c => c === " " || c === "-" || next.has(c));
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
        <TreeSVG errors={errors} won={won && finished} />

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

          {/* Word blanks */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {wordUpper.split("").map((c, i) =>
              c === " " ? (
                <span key={i} className="w-3" />
              ) : (
                <motion.div
                  key={i}
                  animate={guessed.has(c) ? { scale: [1, 1.25, 1] } : {}}
                  className="flex flex-col items-center"
                >
                  <span className={`text-lg font-extrabold w-7 text-center transition-colors ${
                    guessed.has(c)
                      ? won ? 'text-green-500' : lost ? 'text-red-400' : 'text-foreground'
                      : lost ? 'text-red-400/60' : 'text-transparent'
                  }`}>
                    {guessed.has(c) || lost ? c : "_"}
                  </span>
                  <div className="w-7 h-0.5 bg-border mt-0.5" />
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
        {ALPHABET.map(letter => {
          const isGuessed = guessed.has(letter);
          const isInWord = wordUpper.includes(letter);
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
