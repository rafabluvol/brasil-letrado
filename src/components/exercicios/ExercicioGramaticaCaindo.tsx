import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface PalavraCaindo {
  palavra: string;
  classe: string; // substantivo, adjetivo, verbo, etc.
}

interface Props {
  textoContexto: string;
  classeAlvo: string; // e.g. "substantivo"
  palavras: PalavraCaindo[];
  onComplete: (acertou: boolean) => void;
}

interface FallingWord {
  id: number;
  palavra: string;
  classe: string;
  x: number;
  y: number;
  speed: number;
  clicked: boolean;
  correct: boolean | null;
}

export default function ExercicioGramaticaCaindo({ textoContexto, classeAlvo, palavras, onComplete }: Props) {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const lastTime = useRef(0);
  const spawnTimer = useRef(0);

  const targetCount = palavras.filter(p => p.classe.toLowerCase() === classeAlvo.toLowerCase()).length;

  useEffect(() => {
    setTotalTarget(targetCount);
  }, [targetCount]);

  // Spawn words one at a time
  useEffect(() => {
    if (gameOver || wordIndex >= palavras.length) return;
    
    const timer = setTimeout(() => {
      const p = palavras[wordIndex];
      const containerWidth = containerRef.current?.clientWidth || 400;
      const maxX = Math.max(containerWidth - 120, 50);
      
      setFallingWords(prev => [...prev, {
        id: wordIndex,
        palavra: p.palavra,
        classe: p.classe,
        x: 30 + Math.random() * (maxX - 30),
        y: -40,
        speed: 40 + Math.random() * 20,
        clicked: false,
        correct: null,
      }]);
      setWordIndex(i => i + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [wordIndex, palavras, gameOver]);

  // Animation loop
  useEffect(() => {
    if (gameOver) return;

    const animate = (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const dt = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      setFallingWords(prev => {
        const containerH = containerRef.current?.clientHeight || 300;
        let newMisses = 0;
        const updated = prev.map(w => {
          if (w.clicked) return w;
          const newY = w.y + w.speed * dt;
          if (newY > containerH + 20) {
            if (w.classe.toLowerCase() === classeAlvo.toLowerCase()) {
              newMisses++;
            }
            return { ...w, y: newY, clicked: true, correct: false };
          }
          return { ...w, y: newY };
        });
        
        if (newMisses > 0) {
          setMisses(m => m + newMisses);
        }
        
        return updated;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameOver, classeAlvo]);

  // Check game over
  useEffect(() => {
    if (gameOver) return;
    const allDone = wordIndex >= palavras.length && fallingWords.every(w => w.clicked || w.y > 400);
    if (allDone && fallingWords.length === palavras.length) {
      setGameOver(true);
      onComplete(score >= Math.ceil(totalTarget * 0.6));
    }
  }, [fallingWords, wordIndex, palavras.length, gameOver, score, totalTarget]);

  const handleClick = (id: number) => {
    if (gameOver) return;
    setFallingWords(prev => prev.map(w => {
      if (w.id !== id || w.clicked) return w;
      const isTarget = w.classe.toLowerCase() === classeAlvo.toLowerCase();
      if (isTarget) setScore(s => s + 1);
      return { ...w, clicked: true, correct: isTarget };
    }));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Context */}
      <div className="bg-muted/50 rounded-xl px-4 py-3 border border-border">
        <p className="text-xs text-muted-foreground font-semibold mb-1">📖 Trecho da história:</p>
        <p className="text-sm text-foreground leading-relaxed">{textoContexto}</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">
          Clique nas palavras que são <span className="text-primary">{classeAlvo}</span>! 👆
        </p>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {score}/{totalTarget}
        </span>
      </div>

      {/* Game area */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl border-2 border-border bg-gradient-to-b from-card to-muted/30 overflow-hidden select-none"
        style={{ height: 280 }}
      >
        <AnimatePresence>
          {fallingWords.map(w => !w.clicked ? (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => handleClick(w.id)}
              className="absolute px-3 py-1.5 rounded-lg font-bold text-sm border-2 border-primary/30 bg-card text-foreground hover:bg-primary/10 hover:border-primary cursor-pointer shadow-md transition-colors"
              style={{
                left: w.x,
                top: w.y,
                zIndex: 10,
              }}
            >
              {w.palavra}
            </motion.button>
          ) : (
            <motion.div
              key={`done-${w.id}`}
              initial={{ scale: 1 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute px-3 py-1.5 rounded-lg font-bold text-sm border-2 ${
                w.correct ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-500 bg-red-100 text-red-700'
              }`}
              style={{ left: w.x, top: w.y }}
            >
              {w.palavra} {w.correct ? '✓' : '✗'}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bottom catch zone indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-destructive/10 to-transparent pointer-events-none" />
      </div>

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center py-3 px-4 rounded-xl font-bold text-sm ${
            score >= Math.ceil(totalTarget * 0.6) ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}
        >
          {score >= Math.ceil(totalTarget * 0.6) ? (
            <><CheckCircle2 className="inline mr-2" size={16} />Ótimo! Você acertou {score} de {totalTarget}! 🎉</>
          ) : (
            <>Você acertou {score} de {totalTarget}. Continue praticando! 💪</>
          )}
        </motion.div>
      )}
    </div>
  );
}
