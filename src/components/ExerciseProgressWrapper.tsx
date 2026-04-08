import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface Props {
  /** Context phrase from the story */
  textoContexto?: string;
  /** Exercise title */
  label: string;
  /** Exercise emoji */
  emoji: string;
  /** Current step (0-based) among the items within THIS exercise (e.g. 4 phrases) */
  answeredCount?: number;
  /** Total items within this exercise */
  totalCount?: number;
  children: React.ReactNode;
}

export default function ExerciseProgressWrapper({
  textoContexto,
  label,
  emoji,
  answeredCount,
  totalCount,
  children,
}: Props) {
  const hasProgress = totalCount !== undefined && totalCount > 0;
  const progressPct = hasProgress ? ((answeredCount || 0) / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto gap-4">
      {/* Header with context phrase from the story */}
      {textoContexto && (
        <div className="w-full bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl px-4 py-3 border-2 border-primary/20 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-primary" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{emoji} {label}</p>
          </div>
          <p className="text-base md:text-lg text-foreground font-normal leading-none" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%' }}>{textoContexto}</p>
        </div>
      )}

      {/* Progress bar */}
      {hasProgress && (
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground">{answeredCount || 0}/{totalCount}</span>
        </div>
      )}

      {children}
    </div>
  );
}
