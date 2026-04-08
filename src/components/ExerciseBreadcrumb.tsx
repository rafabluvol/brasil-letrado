import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { BNCC_HABILIDADES } from "@/data/bncc-habilidades";
import { PORTUGUES_1, PORTUGUES_2, PORTUGUES_3, PORTUGUES_4, PORTUGUES_5 } from "@/data/bncc-portugues-completo";

interface Props {
  genero: string;
  habilidadeBNCC?: string;
  exercicioLabel: string;
  exercicioEmoji: string;
  step: number;
  total: number;
}

function getHabilidadeNome(codigo?: string): string | null {
  if (!codigo) return null;
  // Search main habilidades
  for (const ano of BNCC_HABILIDADES) {
    for (const materia of ano.materias) {
      for (const hab of materia.habilidades) {
        if (hab.codigo === codigo) return hab.label || hab.nome;
      }
    }
  }
  // Search portugues completo
  for (const list of [PORTUGUES_1, PORTUGUES_2, PORTUGUES_3, PORTUGUES_4, PORTUGUES_5]) {
    for (const hab of list) {
      if (hab.codigo === codigo) return hab.label || hab.nome;
    }
  }
  return null;
}

export default function ExerciseBreadcrumb({ genero, habilidadeBNCC, exercicioLabel, exercicioEmoji, step, total }: Props) {
  const habilidadeDisplay = useMemo(() => {
    const nome = getHabilidadeNome(habilidadeBNCC);
    if (nome && habilidadeBNCC) return `${nome} (${habilidadeBNCC})`;
    return habilidadeBNCC || null;
  }, [habilidadeBNCC]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
        📖 {genero}
      </span>
      <ChevronRight size={12} className="text-muted-foreground/40" />
      {habilidadeDisplay && (
        <>
          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 truncate max-w-[280px]" title={habilidadeDisplay}>
            🎯 {habilidadeDisplay}
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
