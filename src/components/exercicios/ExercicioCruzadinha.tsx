import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

interface PalavraInput {
  palavra: string;
  dica: string;
  direcao?: "horizontal" | "vertical";
  linha?: number;
  coluna?: number;
}

interface PlacedWord {
  word: string;
  originalWord: string;
  dica: string;
  direcao: "horizontal" | "vertical";
  row: number;
  col: number;
}

interface Props {
  palavras: PalavraInput[];
  textoContexto?: string;
  onComplete: () => void;
  onProgress?: (completed: number, total: number) => void;
}

const clean = (s: string) => s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function buildCrossword(inputs: PalavraInput[]): { placed: PlacedWord[]; gridSize: number } {
  const sorted = [...inputs].sort((a, b) => b.palavra.length - a.palavra.length);
  const placed: PlacedWord[] = [];

  const first = sorted[0];
  const firstWord = clean(first.palavra);
  const startRow = 6;
  const startCol = Math.max(0, Math.floor((15 - firstWord.length) / 2));

  placed.push({ word: firstWord, originalWord: first.palavra, dica: first.dica, direcao: "horizontal", row: startRow, col: startCol });

  for (let wi = 1; wi < sorted.length; wi++) {
    const inp = sorted[wi];
    const word = clean(inp.palavra);
    let best: PlacedWord | null = null;

    for (const pw of placed) {
      for (let pi = 0; pi < pw.word.length && !best; pi++) {
        for (let wi2 = 0; wi2 < word.length && !best; wi2++) {
          if (pw.word[pi] !== word[wi2]) continue;
          const newDir: "horizontal" | "vertical" = pw.direcao === "horizontal" ? "vertical" : "horizontal";
          const newRow = newDir === "vertical" ? pw.row - wi2 : pw.row + pi;
          const newCol = newDir === "vertical" ? pw.col + pi : pw.col - wi2;
          const endRow = newDir === "vertical" ? newRow + word.length - 1 : newRow;
          const endCol = newDir === "horizontal" ? newCol + word.length - 1 : newCol;
          if (newRow < 0 || newCol < 0 || endRow > 17 || endCol > 17) continue;

          let conflict = false;
          for (let i = 0; i < word.length && !conflict; i++) {
            const r = newDir === "vertical" ? newRow + i : newRow;
            const c = newDir === "horizontal" ? newCol + i : newCol;
            for (const existing of placed) {
              for (let j = 0; j < existing.word.length; j++) {
                const er = existing.direcao === "vertical" ? existing.row + j : existing.row;
                const ec = existing.direcao === "horizontal" ? existing.col + j : existing.col;
                if (r === er && c === ec && word[i] !== existing.word[j]) conflict = true;
              }
            }
          }
          if (!conflict) best = { word, originalWord: inp.palavra, dica: inp.dica, direcao: newDir, row: newRow, col: newCol };
        }
      }
      if (best) break;
    }

    if (best) {
      placed.push(best);
    } else {
      const dir: "horizontal" | "vertical" = wi % 2 === 0 ? "horizontal" : "vertical";
      placed.push({ word: clean(inp.palavra), originalWord: inp.palavra, dica: inp.dica, direcao: dir, row: wi * 2, col: 0 });
    }
  }

  let minR = Infinity, minC = Infinity, maxR = 0, maxC = 0;
  placed.forEach(pw => {
    minR = Math.min(minR, pw.row); minC = Math.min(minC, pw.col);
    maxR = Math.max(maxR, pw.direcao === "vertical" ? pw.row + pw.word.length - 1 : pw.row);
    maxC = Math.max(maxC, pw.direcao === "horizontal" ? pw.col + pw.word.length - 1 : pw.col);
  });
  placed.forEach(pw => { pw.row -= minR; pw.col -= minC; });
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  return { placed, gridSize: Math.max(rows, cols, 5) };
}

function RenderContextText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <span key={i} className="font-extrabold text-green-600 bg-green-100 px-1 rounded">
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default function ExercicioCruzadinha({ palavras, textoContexto, onComplete, onProgress }: Props) {
  const { placed, gridSize: GRID_SIZE } = useMemo(() => buildCrossword(palavras), [palavras]);

  const { answerGrid, activeGrid, numbered, wordCells } = useMemo(() => {
    const answer: (string | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    const active: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    const nums: Record<string, number> = {};
    const cells: Record<number, [number, number][]> = {};
    let n = 1;

    placed.forEach((pw, idx) => {
      const key = `${pw.row},${pw.col}`;
      if (!nums[key]) nums[key] = n++;
      cells[idx] = [];
      for (let i = 0; i < pw.word.length; i++) {
        const r = pw.direcao === "vertical" ? pw.row + i : pw.row;
        const c = pw.direcao === "horizontal" ? pw.col + i : pw.col;
        if (r < GRID_SIZE && c < GRID_SIZE) {
          answer[r][c] = pw.word[i];
          active[r][c] = true;
          cells[idx].push([r, c]);
        }
      }
    });
    return { answerGrid: answer, activeGrid: active, numbered: nums, wordCells: cells };
  }, [placed, GRID_SIZE]);

  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""))
  );
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );

  const checkWords = useCallback((grid: string[][]) => {
    const newCompleted = new Set(completedWords);
    let changed = false;

    placed.forEach((pw, idx) => {
      if (newCompleted.has(idx)) return;
      const cells = wordCells[idx];
      if (!cells) return;
      const allFilled = cells.every(([r, c]) => grid[r]?.[c] === answerGrid[r]?.[c]);
      if (allFilled) {
        newCompleted.add(idx);
        changed = true;
        playCorrectSound();
      }
    });

    if (changed) {
      setCompletedWords(newCompleted);
      onProgress?.(newCompleted.size, placed.length);
      if (newCompleted.size === placed.length) {
        setDone(true);
        setTimeout(() => onComplete(), 1200);
      }
    }
  }, [completedWords, placed, wordCells, answerGrid, onComplete, onProgress]);

  const findNextActive = (r: number, c: number): [number, number] | null => {
    for (let nc = c + 1; nc < GRID_SIZE; nc++) if (activeGrid[r]?.[nc]) return [r, nc];
    for (let nr = r + 1; nr < GRID_SIZE; nr++) for (let nc = 0; nc < GRID_SIZE; nc++) if (activeGrid[nr]?.[nc]) return [nr, nc];
    return null;
  };

  const handleInput = (r: number, c: number, val: string) => {
    if (done) return;
    const letter = val.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "").slice(-1);
    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = letter;
    setUserGrid(newGrid);

    if (letter) {
      if (answerGrid[r][c] && letter !== answerGrid[r][c]) playWrongSound();
      checkWords(newGrid);
      const next = findNextActive(r, c);
      if (next) inputRefs.current[next[0]]?.[next[1]]?.focus();
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !userGrid[r][c]) {
      for (let nc = c - 1; nc >= 0; nc--) if (activeGrid[r]?.[nc]) { inputRefs.current[r]?.[nc]?.focus(); return; }
      for (let nr = r - 1; nr >= 0; nr--) for (let nc = GRID_SIZE - 1; nc >= 0; nc--) if (activeGrid[nr]?.[nc]) { inputRefs.current[nr]?.[nc]?.focus(); return; }
    }
  };

  const isCellCompleted = (r: number, c: number) => {
    for (const [idx, cells] of Object.entries(wordCells)) {
      if (completedWords.has(Number(idx)) && cells.some(([cr, cc]) => cr === r && cc === c)) return true;
    }
    return false;
  };

  // Compact cell sizes for fitting on one screen
  const cellPx = GRID_SIZE <= 8 ? 32 : GRID_SIZE <= 10 ? 28 : GRID_SIZE <= 12 ? 24 : 22;
  const fontSize = GRID_SIZE <= 8 ? 'text-sm' : GRID_SIZE <= 10 ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      {/* Context text */}
      {textoContexto && (
        <div className="w-full max-w-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-2.5 border border-green-200 dark:border-green-800">
          <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">🔄 Encontre os antônimos das palavras em verde</p>
          <RenderContextText text={textoContexto} />
        </div>
      )}

      {/* Horizontal layout: clues left, grid right */}
      <div className="flex flex-col md:flex-row gap-3 items-start w-full max-w-2xl">
        {/* Clues */}
        <div className="flex flex-col gap-1 md:w-48 shrink-0">
          {placed.map((pw, i) => {
            const num = numbered[`${pw.row},${pw.col}`];
            const isComplete = completedWords.has(i);
            return (
              <p key={i} className={`text-[11px] leading-tight transition-all ${isComplete ? 'text-green-600 line-through' : 'text-muted-foreground'}`}>
                <span className="text-primary font-bold mr-1">{num}{pw.direcao === "horizontal" ? "→" : "↓"}</span>
                Antônimo de <span className="font-bold text-green-600">"{pw.dica}"</span>
              </p>
            );
          })}
        </div>

        {/* Crossword grid */}
        <div className="flex-1 flex justify-center overflow-auto">
          <div className="inline-grid gap-px" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellPx}px)` }}>
            {Array.from({ length: GRID_SIZE }).map((_, r) =>
              Array.from({ length: GRID_SIZE }).map((_, c) => {
                const isActive = activeGrid[r][c];
                const completed = isCellCompleted(r, c);
                const num = numbered[`${r},${c}`];
                const isWrong = isActive && userGrid[r][c] && answerGrid[r][c] && userGrid[r][c] !== answerGrid[r][c];

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative flex items-center justify-center rounded-sm ${
                      isActive
                        ? completed
                          ? "bg-green-100 border border-green-500"
                          : isWrong
                          ? "bg-pink-100 border border-pink-400"
                          : "bg-card border border-border shadow-sm hover:border-primary/50"
                        : ""
                    }`}
                    style={{ width: cellPx, height: cellPx }}
                    onClick={() => { if (isActive && !done) inputRefs.current[r]?.[c]?.focus(); }}
                  >
                    {num && (
                      <span className="absolute top-0 left-0.5 text-[6px] text-primary font-bold leading-none z-10">{num}</span>
                    )}
                    {isActive && (
                      <input
                        ref={el => { inputRefs.current[r][c] = el; }}
                        maxLength={1}
                        value={userGrid[r][c]}
                        disabled={done || completed}
                        onChange={e => handleInput(r, c, e.target.value)}
                        onKeyDown={e => handleKeyDown(r, c, e)}
                        onFocus={e => e.target.select()}
                        className={`w-full h-full bg-transparent text-center font-extrabold text-foreground uppercase outline-none caret-primary focus:bg-primary/10 rounded-sm cursor-text ${fontSize}`}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {done && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-green-600 font-bold text-sm"
        >
          <CheckCircle2 size={15} className="inline mr-1" />Muito bem, cruzadinha completa!
        </motion.p>
      )}
    </div>
  );
}
