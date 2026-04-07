import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Palavra {
  palavra: string;
  dica: string;
  direcao: "horizontal" | "vertical";
  linha: number;
  coluna: number;
}

interface Props {
  palavras: Palavra[];
  onComplete: () => void;
}

export default function ExercicioCruzadinha({ palavras, onComplete }: Props) {
  const GRID_SIZE = useMemo(() => {
    let maxR = 0, maxC = 0;
    palavras.forEach(pw => {
      const word = pw.palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const endR = pw.direcao === "vertical" ? pw.linha - 1 + word.length - 1 : pw.linha - 1;
      const endC = pw.direcao === "horizontal" ? pw.coluna - 1 + word.length - 1 : pw.coluna - 1;
      maxR = Math.max(maxR, endR);
      maxC = Math.max(maxC, endC);
    });
    return Math.max(maxR + 1, maxC + 1, 5);
  }, [palavras]);

  const { answerGrid, activeGrid, numbered } = useMemo(() => {
    const answer: (string | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    const active: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    const nums: Record<string, number> = {};
    let n = 1;
    palavras.forEach(pw => {
      const word = pw.palavra.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const key = `${pw.linha - 1},${pw.coluna - 1}`;
      if (!nums[key]) nums[key] = n++;
      for (let i = 0; i < word.length; i++) {
        const r = pw.direcao === "horizontal" ? pw.linha - 1 : pw.linha - 1 + i;
        const c = pw.direcao === "horizontal" ? pw.coluna - 1 + i : pw.coluna - 1;
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          answer[r][c] = word[i];
          active[r][c] = true;
        }
      }
    });
    return { answerGrid: answer, activeGrid: active, numbered: nums };
  }, [palavras, GRID_SIZE]);

  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""))
  );
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );

  // Find next active cell from (r,c) scanning right then down
  const findNextActive = (r: number, c: number): [number, number] | null => {
    // Try same row, next columns
    for (let nc = c + 1; nc < GRID_SIZE; nc++) {
      if (activeGrid[r]?.[nc]) return [r, nc];
    }
    // Try next rows
    for (let nr = r + 1; nr < GRID_SIZE; nr++) {
      for (let nc = 0; nc < GRID_SIZE; nc++) {
        if (activeGrid[nr]?.[nc]) return [nr, nc];
      }
    }
    return null;
  };

  const handleInput = (r: number, c: number, val: string) => {
    if (checked) return;
    const letter = val.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setUserGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = letter;
      return next;
    });
    if (letter) {
      const next = findNextActive(r, c);
      if (next) inputRefs.current[next[0]]?.[next[1]]?.focus();
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !userGrid[r][c]) {
      // Move to previous active cell
      for (let nc = c - 1; nc >= 0; nc--) {
        if (activeGrid[r]?.[nc]) {
          inputRefs.current[r]?.[nc]?.focus();
          return;
        }
      }
      for (let nr = r - 1; nr >= 0; nr--) {
        for (let nc = GRID_SIZE - 1; nc >= 0; nc--) {
          if (activeGrid[nr]?.[nc]) {
            inputRefs.current[nr]?.[nc]?.focus();
            return;
          }
        }
      }
    }
  };

  const handleCheck = () => {
    setChecked(true);
    setDone(true);
    setTimeout(() => onComplete(), 1500);
  };

  const getCellStatus = (r: number, c: number) => {
    if (!checked || !activeGrid[r][c]) return null;
    return userGrid[r][c] === answerGrid[r][c] ? "correct" : "wrong";
  };

  // Calculate cell size based on grid size
  const cellSize = GRID_SIZE <= 6 ? 'w-10 h-10 text-sm' : GRID_SIZE <= 8 ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs';

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs font-semibold text-center">✏️ Preencha a cruzadinha:</p>

      <div className="flex justify-center">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {Array.from({ length: GRID_SIZE }).map((_, r) =>
            Array.from({ length: GRID_SIZE }).map((_, c) => {
              const isActive = activeGrid[r][c];
              const status = getCellStatus(r, c);
              const num = numbered[`${r},${c}`];
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative ${cellSize} flex items-center justify-center rounded ${
                    isActive
                      ? status === "correct"
                        ? "bg-green-100 border-2 border-green-500"
                        : status === "wrong"
                        ? "bg-red-100 border-2 border-red-500"
                        : "bg-card border-2 border-border shadow-sm hover:border-primary/50"
                      : ""
                  }`}
                  onClick={() => {
                    if (isActive && !done) {
                      inputRefs.current[r]?.[c]?.focus();
                    }
                  }}
                >
                  {num && (
                    <span className="absolute top-0 left-0.5 text-[7px] text-primary font-bold leading-none z-10">
                      {num}
                    </span>
                  )}
                  {isActive && (
                    <input
                      ref={el => { inputRefs.current[r][c] = el; }}
                      maxLength={1}
                      value={userGrid[r][c]}
                      disabled={done}
                      onChange={e => handleInput(r, c, e.target.value)}
                      onKeyDown={e => handleKeyDown(r, c, e)}
                      onFocus={e => e.target.select()}
                      className={`w-full h-full bg-transparent text-center font-extrabold text-foreground uppercase outline-none caret-primary focus:bg-primary/10 rounded cursor-text ${cellSize.split(' ').pop()}`}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clues */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-2">
        {palavras.map((pw, i) => {
          const num = numbered[`${pw.linha - 1},${pw.coluna - 1}`];
          return (
            <p key={i} className="text-muted-foreground text-[11px] leading-tight">
              <span className="text-primary font-bold mr-1">{num}{pw.direcao === "horizontal" ? "→" : "↓"}</span>
              {pw.dica}
            </p>
          );
        })}
      </div>

      {!checked && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCheck}
            className="btn-hero px-8 py-2.5 text-sm flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Verificar
          </motion.button>
        </div>
      )}
      {checked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-green-600 font-bold text-sm"
        >
          <CheckCircle2 size={15} className="inline mr-1" />Muito bem, continue!
        </motion.p>
      )}
    </div>
  );
}
