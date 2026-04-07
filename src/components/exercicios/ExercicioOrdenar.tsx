import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, GripVertical } from "lucide-react";

interface Props {
  itensOrdenados: string[];
  onComplete: (acertou: boolean) => void;
  showResult: boolean;
}

export default function ExercicioOrdenar({ itensOrdenados, onComplete, showResult }: Props) {
  const [items, setItems] = useState(() => {
    const shuffled = [...itensOrdenados];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (showResult || from === to) return;
    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleMoveUp = (idx: number) => {
    if (idx > 0) move(idx, idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    if (idx < items.length - 1) move(idx, idx + 1);
  };

  const checkOrder = () => {
    const correct = items.every((item, idx) => item === itensOrdenados[idx]);
    onComplete(correct);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-semibold mb-2">
        Arraste ou use as setas para organizar na ordem correta da história
      </p>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isCorrectPosition = showResult && item === itensOrdenados[idx];
          const isWrongPosition = showResult && item !== itensOrdenados[idx];
          const isDragging = dragIdx === idx;
          const isOver = overIdx === idx && dragIdx !== idx;

          return (
            <motion.div
              key={item}
              layout
              draggable={!showResult}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIdx(idx);
              }}
              onDragEnd={() => {
                if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
                  move(dragIdx, overIdx);
                }
                setDragIdx(null);
                setOverIdx(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                isCorrectPosition
                  ? "border-success bg-success/10"
                  : isWrongPosition
                  ? "border-destructive bg-destructive/10"
                  : isOver
                  ? "border-primary bg-primary/10"
                  : isDragging
                  ? "opacity-50 border-muted"
                  : "border-muted bg-muted/50 hover:border-muted-foreground/30"
              }`}
            >
              {!showResult && (
                <GripVertical size={18} className="text-muted-foreground flex-shrink-0" />
              )}
              <span className="w-7 h-7 rounded-full bg-card border-2 border-current flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                {idx + 1}
              </span>
              <span className="flex-1 font-semibold text-sm text-foreground">{item}</span>
              {!showResult && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary disabled:opacity-30 transition-colors font-bold"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === items.length - 1}
                    className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary disabled:opacity-30 transition-colors font-bold"
                  >
                    ↓
                  </button>
                </div>
              )}
              {isCorrectPosition && <CheckCircle2 size={18} className="text-success flex-shrink-0" />}
              {isWrongPosition && <XCircle size={18} className="text-destructive flex-shrink-0" />}
            </motion.div>
          );
        })}
      </div>
      {!showResult && (
        <button onClick={checkOrder} className="btn-hero w-full mt-4">
          Verificar Ordem
        </button>
      )}
    </div>
  );
}
