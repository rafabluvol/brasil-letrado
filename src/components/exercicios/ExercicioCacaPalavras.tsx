import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Search } from "lucide-react";

interface Props {
  textoContexto?: string;
  grade: string[][];
  palavras: string[];
  onComplete: () => void;
  /** Called with (found, total) whenever a word is found */
  onProgress?: (found: number, total: number) => void;
}

function cellKey(r: number, c: number) { return `${r},${c}`; }

/* Check if a word exists in the grid in any direction */
function wordExistsInGrid(grid: string[][], word: string): boolean {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const dirs = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of dirs) {
        let found = true;
        for (let k = 0; k < word.length; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) { found = false; break; }
          if ((grid[nr][nc] || "").toUpperCase() !== word[k]) { found = false; break; }
        }
        if (found) return true;
      }
    }
  }
  return false;
}

export default function ExercicioCacaPalavras({ textoContexto, grade, palavras, onComplete, onProgress }: Props) {
  const rows = grade.length;
  const cols = grade[0]?.length || 0;

  // Filter to only words that actually exist in the grid
  const validPalavras = useRef<string[]>([]);
  if (validPalavras.current.length === 0) {
    const upper = palavras.map(p => p.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    validPalavras.current = upper.filter(w => wordExistsInGrid(grade, w));
    // If none valid, use all (fallback)
    if (validPalavras.current.length === 0) validPalavras.current = upper;
  }

  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragEnd, setDragEnd] = useState<[number, number] | null>(null);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const totalWords = validPalavras.current.length;

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
    const rect = gridRef.current.getBoundingClientRect();
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellH);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return [r, c];
  }, [rows, cols]);

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
      const match = validPalavras.current.find(p => p === word || p === wordRev);
      if (match && !foundWords.has(match)) {
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

  // SVG selection line
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

  // Render context text with target words bolded
  const renderContextText = () => {
    if (!textoContexto) return null;
    return (
      <div className="w-full bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-4 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Search size={16} className="text-primary" />
          <p className="text-xs font-bold text-primary uppercase tracking-wide">📖 Encontre as palavras no caça-palavras</p>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {textoContexto.split(/\s+/).map((word, i) => {
            const clean = word.replace(/[.,;:!?"'()]/g, '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const isTarget = validPalavras.current.includes(clean);
            const isFound = foundWords.has(clean);
            return (
              <span key={i}>
                {isTarget ? (
                  <strong className={`font-extrabold transition-colors ${isFound ? "text-green-600 line-through" : "text-primary"}`}>{word}</strong>
                ) : word}
                {' '}
              </span>
            );
          })}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 items-center select-none touch-none w-full max-w-lg mx-auto">
      {renderContextText()}

      <p className="text-xs text-muted-foreground text-center">
        👆 Arraste na horizontal, vertical ou <strong>diagonal</strong> para encontrar as palavras!
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

      {/* Words list */}
      <div className="flex flex-wrap gap-2 justify-center">
        {palavras.map((p, i) => {
          const upper = p.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const found = foundWords.has(upper);
          const exists = validPalavras.current.includes(upper);
          if (!exists) return null; // Hide words not in grid
          return (
            <motion.span
              key={i}
              animate={found ? { scale: [1, 1.15, 1] } : {}}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                found
                  ? "border-green-500 bg-green-100 text-green-700 line-through dark:bg-green-900/30 dark:text-green-300"
                  : "border-border bg-card text-foreground shadow-sm"
              }`}
            >
              {found && <CheckCircle2 size={12} className="inline mr-1" />}
              {p.toUpperCase()}
            </motion.span>
          );
        })}
      </div>

      {/* Progress indicator */}
      <p className="text-xs text-muted-foreground">
        {foundWords.size} de {totalWords} palavras encontradas
      </p>
    </div>
  );
}
