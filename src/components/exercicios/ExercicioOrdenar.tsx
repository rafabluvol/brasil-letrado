import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

interface Props {
  itensOrdenados: string[];
  onComplete: (acertou: boolean) => void;
  showResult: boolean;
}

export default function ExercicioOrdenar({ itensOrdenados: rawItens, onComplete, showResult }: Props) {
  const itensOrdenados = rawItens.slice(0, 4);

  const [items] = useState(() => {
    const shuffled = [...itensOrdenados];
    for (let attempt = 0; attempt < 10; attempt++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      if (shuffled.some((item, idx) => item !== itensOrdenados[idx])) break;
    }
    return shuffled;
  });

  // Each item gets a user-assigned number (1-based) or null
  const [assignments, setAssignments] = useState<Record<number, number | null>>({});
  const [verified, setVerified] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleAssign = (itemIdx: number, num: number) => {
    if (verified) return;
    setAssignments(prev => {
      const next = { ...prev };
      // Remove this number from any other item
      for (const key of Object.keys(next)) {
        if (next[Number(key)] === num) {
          next[Number(key)] = null;
        }
      }
      next[itemIdx] = num;
      return next;
    });
  };

  const allAssigned = items.every((_, idx) => assignments[idx] != null);

  const checkOrder = () => {
    // For each item, the user assigned a position number.
    // The correct position for items[idx] is its index in itensOrdenados + 1
    const correctResults = items.map((item, idx) => {
      const correctPos = itensOrdenados.indexOf(item) + 1;
      return assignments[idx] === correctPos;
    });
    setResults(correctResults);
    setVerified(true);

    const allCorrect = correctResults.every(Boolean);
    if (allCorrect) {
      playCorrectSound();
      onComplete(true);
    } else {
      playWrongSound();
    }
  };

  const handleRetry = () => {
    setVerified(false);
    setResults([]);
    setAssignments({});
  };

  const numberOptions = items.map((_, i) => i + 1);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-semibold mb-2">
        Coloque o número correto (1, 2, 3, 4) na ordem da história
      </p>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const assigned = assignments[idx];
          const isCorrect = verified && results[idx] === true;
          const isWrong = verified && results[idx] === false;

          return (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : isWrong
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-border bg-card"
              }`}
            >
              {/* Number selector buttons */}
              <div className="flex gap-1 flex-shrink-0">
                {numberOptions.map(num => {
                  const isSelected = assigned === num;
                  const isUsedElsewhere = !isSelected && Object.values(assignments).includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => handleAssign(idx, num)}
                      disabled={verified || isUsedElsewhere}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all border-2 ${
                        isSelected
                          ? isCorrect
                            ? "border-green-500 bg-green-100 text-green-700"
                            : isWrong
                            ? "border-red-500 bg-red-100 text-red-700"
                            : "border-primary bg-primary/10 text-primary"
                          : isUsedElsewhere
                          ? "border-muted bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                          : "border-border bg-muted/50 text-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <span className="flex-1 font-medium text-sm text-foreground">{item}</span>
              {isCorrect && <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />}
              {isWrong && <XCircle size={18} className="text-red-600 flex-shrink-0" />}
            </motion.div>
          );
        })}
      </div>
      {!verified && (
        <button onClick={checkOrder} disabled={!allAssigned} className="btn-hero w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed">
          Verificar Ordem
        </button>
      )}
      {verified && !results.every(Boolean) && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-bold text-destructive text-center">😊 Quase lá! Tente reorganizar.</p>
          <button onClick={handleRetry} className="btn-hero w-full flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
}
