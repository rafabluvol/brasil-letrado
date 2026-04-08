import { useState, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Search } from "lucide-react";
import { playCorrectSound } from "@/lib/sounds";

interface Props {
  textoContexto?: string;
  palavras: string[];
  grade?: string[][];
  onComplete: () => void;
  onProgress?: (found: number, total: number) => void;
}

function cellKey(r: number, c: number) { return `${r},${c}`; }

const GRID_SIZE = 10;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Direction = [number, number];
const DIRS: { h: Direction; v: Direction; d: Direction } = {
  h: [0, 1],  // horizontal
  v: [1, 0],  // vertical
  d: [1, 1],  // diagonal
};

function normalize(s: string) {
  return s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function buildGrid(words: string[]): { grid: string[][]; placed: string[] } {
  const size = GRID_SIZE;
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const placed: string[] = [];

  // Assign directions: first=horizontal, second=vertical, third=diagonal
  const dirKeys: (keyof typeof DIRS)[] = ["h", "v", "d"];

  for (let wi = 0; wi < words.length && wi < 3; wi++) {
    const word = normalize(words[wi]);
    if (word.length > size) continue;
    const [dr, dc] = DIRS[dirKeys[wi % 3]];

    let didPlace = false;
    // Try random positions up to 200 times
    for (let attempt = 0; attempt < 200; attempt++) {
      const maxR = size - (dr === 0 ? 1 : word.length);
      const maxC = size - (dc === 0 ? 1 : word.length);
      const startR = Math.floor(Math.random() * (maxR + 1));
      const startC = Math.floor(Math.random() * (maxC + 1));

      let canPlace = true;
      for (let k = 0; k < word.length; k++) {
        const r = startR + dr * k;
        const c = startC + dc * k;
        const existing = grid[r][c];
        if (existing !== null && existing !== word[k]) { canPlace = false; break; }
      }
      if (!canPlace) continue;

      for (let k = 0; k < word.length; k++) {
        grid[startR + dr * k][startC + dc * k] = word[k];
      }
      placed.push(word);
      didPlace = true;
      break;
    }

    // Fallback: try all positions
    if (!didPlace) {
      outer: for (let r = 0; r <= size - (dr === 0 ? 1 : word.length); r++) {
        for (let c = 0; c <= size - (dc === 0 ? 1 : word.length); c++) {
          let canPlace = true;
          for (let k = 0; k < word.length; k++) {
            const existing = grid[r + dr * k][c + dc * k];
            if (existing !== null && existing !== word[k]) { canPlace = false; break; }
          }
          if (!canPlace) continue;
          for (let k = 0; k < word.length; k++) {
            grid[r + dr * k][c + dc * k] = word[k];
          }
          placed.push(word);
          didPlace = true;
          break outer;
        }
      }
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * 26)];
      }
    }
  }

  return { grid: grid as string[][], placed };
}

export default function ExercicioCacaPalavras({ textoContexto, palavras, onComplete, onProgress }: Props) {
  const { grid: grade, placed: validWords } = useMemo(() => {
    const clean = (palavras || []).map(p => normalize(p)).filter(w => w.length >= 2 && w.length <= GRID_SIZE);
    const words = clean.length > 0 ? clean.slice(0, 3) : ["PALAVRA"];
    return buildGrid(words);
  }, [palavras]);

  const rows = grade.length;
  const cols = grade[0]?.length || 0;
  const totalWords = validWords.length;

  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragEnd, setDragEnd] = useState<[number, number] | null>(null);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const getLineCells = useCallback((start: [number, number], end: [number, number]): [number, number][] => {
    const [r1, c1] = start;
    const [r2, c2] = end;
    const dr = r2 - r1, dc = c2 - c1;
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    if (len === 0) return [[r1, c1]];
    const isDiag = Math.abs(dr) === Math.abs(dc);
    const isHoriz = dr === 0;
    const isVert = dc === 0;
    if (!isDiag && !isHoriz && !isVert) return [];
    const sr = dr === 0 ? 0 : dr / Math.abs(dr);
    const sc = dc === 0 ? 0 : dc / Math.abs(dc);
    return Array.from({ length: len + 1 }, (_, i) => [r1 + i * sr, c1 + i * sc] as [number, number]);
  }, []);

  const previewCells = dragStart && dragEnd ? getLineCells(dragStart, dragEnd) : [];
  const previewKeys = new Set(previewCells.map(([r, c]) => cellKey(r, c)));

  const getCellFromEvent = useCallback((e: React.PointerEvent | PointerEvent): [number, number] | null => {
    if (!gridRef.current) return null;
    const gridEl = gridRef.current;
    const children = gridEl.children;
    // Use actual cell element positions for accurate hit-testing
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const cr = child.getBoundingClientRect();
      if (e.clientX >= cr.left && e.clientX <= cr.right && e.clientY >= cr.top && e.clientY <= cr.bottom) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return [r, c];
      }
    }
    return null;
  }, [cols]);

  const snapToDirection = useCallback((start: [number, number], raw: [number, number]): [number, number] => {
    const [r1, c1] = start;
    const [r2, c2] = raw;
    const dr = r2 - r1, dc = c2 - c1;
    const absDr = Math.abs(dr), absDc = Math.abs(dc);
    if (dr === 0 || dc === 0 || absDr === absDc) return raw;
    if (absDr >= absDc) {
      if (absDc < absDr * 0.4) return [r2, c1];
      const len = absDr;
      const sc = dc > 0 ? 1 : -1;
      return [r2, c1 + len * sc];
    } else {
      if (absDr < absDc * 0.4) return [r1, c2];
      const len = absDc;
      const sr = dr > 0 ? 1 : -1;
      return [r1 + len * sr, c2];
    }
  }, []);

  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragStart([r, c]);
    setDragEnd([r, c]);
    setIsDragging(true);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    const cell = getCellFromEvent(e);
    if (cell) {
      const snapped = snapToDirection(dragStart, cell);
      const clampedR = Math.max(0, Math.min(rows - 1, snapped[0]));
      const clampedC = Math.max(0, Math.min(cols - 1, snapped[1]));
      setDragEnd([clampedR, clampedC]);
    }
  }, [isDragging, dragStart, getCellFromEvent, snapToDirection, rows, cols]);

  const handlePointerUp = () => {
    if (!dragStart || !dragEnd) { setIsDragging(false); return; }
    const cells = getLineCells(dragStart, dragEnd);
    if (cells.length > 1) {
      const word = cells.map(([r, c]) => (grade[r]?.[c] || "").toUpperCase()).join("");
      const wordRev = word.split("").reverse().join("");
      const match = validWords.find(p => p === word || p === wordRev);
      if (match && !foundWords.has(match)) {
        playCorrectSound();
        const newFoundCells = new Set(foundCells);
        cells.forEach(([r, c]) => newFoundCells.add(cellKey(r, c)));
        setFoundCells(newFoundCells);
        const newFoundWords = new Set(foundWords);
        newFoundWords.add(match);
        setFoundWords(newFoundWords);
        onProgress?.(newFoundWords.size, totalWords);
        if (newFoundWords.size === totalWords) {
          setTimeout(() => onComplete(), 1200);
        }
      }
    }
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
  };

  const renderSelectionLine = () => {
    if (!dragStart || !dragEnd || !gridRef.current) return null;
    const cells = getLineCells(dragStart, dragEnd);
    if (cells.length < 2) return null;
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellW = gridRect.width / cols;
    const cellH = gridRect.height / rows;
    const startX = cells[0][1] * cellW + cellW / 2;
    const startY = cells[0][0] * cellH + cellH / 2;
    const endX = cells[cells.length - 1][1] * cellW + cellW / 2;
    const endY = cells[cells.length - 1][0] * cellH + cellH / 2;
    return (
      <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
        <line x1={startX} y1={startY} x2={endX} y2={endY}
          stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-4 items-center select-none touch-none w-full max-w-lg mx-auto">
      {/* Context text with highlighted target words */}
      {textoContexto && (
        <div className="w-full bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Search size={16} className="text-primary" />
            <p className="text-xs font-bold text-primary uppercase tracking-wide">📖 Encontre as palavras destacadas no caça-palavras</p>
          </div>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-medium">
            {textoContexto.split(/\s+/).map((word, i) => {
              const clean = normalize(word.replace(/[.,;:!?"'()]/g, ''));
              const isTarget = validWords.includes(clean);
              const isFound = foundWords.has(clean);
              return (
                <span key={i}>
                  {isTarget ? (
                    <strong className={`font-extrabold px-1.5 py-0.5 rounded-md transition-all ${
                      isFound 
                        ? "bg-green-100 text-green-600 line-through dark:bg-green-900/40 dark:text-green-300" 
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}>
                      {isFound && <CheckCircle2 size={14} className="inline mr-0.5 -mt-0.5" />}
                      {word}
                    </strong>
                  ) : word}
                  {' '}
                </span>
              );
            })}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        👆 Arraste sobre as letras na <strong>horizontal</strong>, <strong>vertical</strong> ou <strong>diagonal</strong> para encontrar {totalWords} palavras!
      </p>

      {/* Grid */}
      <div className="relative w-full flex justify-center">
        <div
          ref={gridRef}
          className="inline-grid gap-px rounded-xl overflow-hidden border-2 border-border bg-border shadow-lg"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, touchAction: "none" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { if (isDragging) { setDragStart(null); setDragEnd(null); setIsDragging(false); } }}
        >
          {grade.map((row, r) =>
            row.map((letter, c) => {
              const key = cellKey(r, c);
              const isFound = foundCells.has(key);
              const isPreview = previewKeys.has(key);
              return (
                <motion.div
                  key={key}
                  onPointerDown={e => handlePointerDown(r, c, e)}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs font-extrabold cursor-pointer transition-all duration-150 ${
                    isFound
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : isPreview
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 scale-105"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {letter.toUpperCase()}
                </motion.div>
              );
            })
          )}
        </div>
        {renderSelectionLine()}
      </div>

      <p className="text-sm font-bold text-muted-foreground">
        {foundWords.size} de {totalWords} palavras encontradas
      </p>
    </div>
  );
}
