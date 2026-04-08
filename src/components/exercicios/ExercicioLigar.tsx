import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface Par {
  esquerda: string;
  direita: string;
}

interface Props {
  textoContexto?: string;
  pares: Par[];
  onComplete: (acertou: boolean) => void;
  showResult: boolean;
}

export default function ExercicioLigar({ textoContexto, pares, onComplete, showResult }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [connections, setConnections] = useState<Map<number, number>>(new Map());
  const [verified, setVerified] = useState(false);
  const [shuffledRight] = useState(() => {
    const indices = pares.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; leftIdx: number }[]>([]);

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: typeof lines = [];
    connections.forEach((rightShuffledIdx, leftIdx) => {
      const leftEl = leftRefs.current[leftIdx];
      const rightEl = rightRefs.current[rightShuffledIdx];
      if (leftEl && rightEl) {
        const lr = leftEl.getBoundingClientRect();
        const rr = rightEl.getBoundingClientRect();
        newLines.push({
          x1: lr.right - containerRect.left,
          y1: lr.top + lr.height / 2 - containerRect.top,
          x2: rr.left - containerRect.left,
          y2: rr.top + rr.height / 2 - containerRect.top,
          leftIdx,
        });
      }
    });
    setLines(newLines);
  }, [connections]);

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [updateLines]);

  const isLocked = showResult || verified;

  const handleLeftClick = (idx: number) => {
    if (isLocked) return;
    if (connections.has(idx)) {
      const newConnections = new Map(connections);
      newConnections.delete(idx);
      setConnections(newConnections);
    }
    setSelectedLeft(selectedLeft === idx ? null : idx);
  };

  const handleRightClick = (shuffledIdx: number) => {
    if (isLocked || selectedLeft === null) return;
    const newConnections = new Map(connections);
    for (const [k, v] of newConnections) {
      if (v === shuffledIdx) newConnections.delete(k);
    }
    newConnections.set(selectedLeft, shuffledIdx);
    setConnections(newConnections);
    setSelectedLeft(null);

    if (newConnections.size === pares.length) {
      const allCorrect = Array.from(newConnections.entries()).every(
        ([leftIdx, rightShuffledIdx]) => shuffledRight[rightShuffledIdx] === leftIdx
      );
      setVerified(true);
      onComplete(allCorrect);
    }
  };

  const handleRetry = () => {
    setConnections(new Map());
    setSelectedLeft(null);
    setVerified(false);
  };

  const getLineColor = (leftIdx: number) => {
    if (!isLocked) return "#6366f1";
    const rightIdx = connections.get(leftIdx);
    if (rightIdx === undefined) return "#6366f1";
    return shuffledRight[rightIdx] === leftIdx ? "#22c55e" : "#ef4444";
  };

  const allCorrect = verified && Array.from(connections.entries()).every(
    ([leftIdx, rightShuffledIdx]) => shuffledRight[rightShuffledIdx] === leftIdx
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {textoContexto && (
        <div className="bg-muted/50 rounded-xl px-4 py-3 border border-border">
          <p className="text-xs text-muted-foreground font-semibold mb-1">📖 Trecho da história:</p>
          <p className="text-sm text-foreground leading-relaxed">{textoContexto}</p>
        </div>
      )}

      <p className="text-sm text-muted-foreground font-semibold">
        Clique em um item da esquerda e depois no correspondente da direita
      </p>

      <div ref={containerRef} className="relative">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={getLineColor(line.leftIdx)}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.7}
            />
          ))}
        </svg>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            {pares.map((par, idx) => {
              const isSelected = selectedLeft === idx;
              const isConnected = connections.has(idx);
              const isCorrect = isLocked && isConnected && shuffledRight[connections.get(idx)!] === idx;
              const isWrong = isLocked && isConnected && shuffledRight[connections.get(idx)!] !== idx;

              return (
                <motion.button
                  key={`l-${idx}`}
                  ref={el => { leftRefs.current[idx] = el; }}
                  whileHover={!isLocked ? { scale: 1.02 } : {}}
                  onClick={() => handleLeftClick(idx)}
                  className={`w-full text-left p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    isCorrect ? "border-green-500 bg-green-50 text-green-700" :
                    isWrong ? "border-red-500 bg-red-50 text-red-700" :
                    isSelected ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" :
                    isConnected ? "border-primary/50 bg-primary/5 text-foreground" :
                    "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="mr-2 text-xs opacity-60">{idx + 1}.</span>
                  {par.esquerda}
                  {isCorrect && <CheckCircle2 size={16} className="inline ml-2 text-green-600" />}
                  {isWrong && <XCircle size={16} className="inline ml-2 text-red-600" />}
                </motion.button>
              );
            })}
          </div>

          <div className="space-y-2">
            {shuffledRight.map((originalIdx, shuffledIdx) => {
              const isConnected = Array.from(connections.values()).includes(shuffledIdx);
              const direitaText = pares[originalIdx]?.direita || `Opção ${shuffledIdx + 1}`;

              return (
                <motion.button
                  key={`r-${shuffledIdx}`}
                  ref={el => { rightRefs.current[shuffledIdx] = el; }}
                  whileHover={!isLocked ? { scale: 1.02 } : {}}
                  onClick={() => handleRightClick(shuffledIdx)}
                  className={`w-full text-left p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    isConnected
                      ? "border-primary/50 bg-primary/5 text-foreground"
                      : selectedLeft !== null
                        ? "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10 cursor-pointer"
                        : "border-border bg-card text-foreground"
                  }`}
                >
                  {direitaText}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {verified && !allCorrect && (
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
