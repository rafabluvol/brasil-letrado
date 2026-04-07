import { ChevronRight } from "lucide-react";

interface Props {
  genero: string;
  habilidadeBNCC?: string;
  exercicioLabel: string;
  exercicioEmoji: string;
  step: number;
  total: number;
}

export default function ExerciseBreadcrumb({ genero, habilidadeBNCC, exercicioLabel, exercicioEmoji, step, total }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
        📖 {genero}
      </span>
      <ChevronRight size={12} className="text-muted-foreground/40" />
      {habilidadeBNCC && (
        <>
          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 truncate max-w-[160px]">
            🎯 {habilidadeBNCC}
          </span>
          <ChevronRight size={12} className="text-muted-foreground/40" />
        </>
      )}
      <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-foreground border border-secondary/20">
        {exercicioEmoji} {exercicioLabel}
      </span>
      <span className="ml-auto text-muted-foreground/60 text-[10px]">
        {step + 1}/{total}
      </span>
    </div>
  );
}
