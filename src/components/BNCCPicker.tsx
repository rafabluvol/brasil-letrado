import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronRight, BookOpen, X, Sparkles } from "lucide-react";
import { PORTUGUES_COMPLETO, EIXOS_BNCC, type HabilidadeCompleta, type EixoBNCC } from "@/data/bncc-portugues-completo";
import { BNCC_HABILIDADES } from "@/data/bncc-habilidades";

interface BNCCPickerProps {
  ano: string;
  tema: string;
  value: string;
  onChange: (codigo: string) => void;
}

const EIXO_ICONS: Record<string, string> = {
  "Oralidade": "🗣️",
  "Leitura/Escuta": "📖",
  "Escrita": "✍️",
  "Análise linguística/semiótica": "🔍",
  "Produção de Textos": "📝",
};

export default function BNCCPicker({ ano, tema, value, onChange }: BNCCPickerProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [expandedEixos, setExpandedEixos] = useState<Set<string>>(new Set(EIXOS_BNCC));

  // Map tema to materia
  const materia = tema === "crie-voce-mesmo" ? "portugues" : tema;

  // Get materias for the year
  const materiasDisponiveis = useMemo(() => {
    const anoData = BNCC_HABILIDADES.find(a => a.ano === ano);
    return anoData?.materias || [];
  }, [ano]);

  // Get habilidades
  const habilidadesRaw = useMemo((): HabilidadeCompleta[] => {
    if (materia === "portugues") {
      return PORTUGUES_COMPLETO[ano] || [];
    }
    const materiaData = materiasDisponiveis.find(m => m.materia === materia);
    return (materiaData?.habilidades || []).map(h => ({ ...h, eixo: "Leitura/Escuta" as EixoBNCC }));
  }, [ano, materia, materiasDisponiveis]);

  // Filter
  const filtered = useMemo(() => {
    if (!busca.trim()) return habilidadesRaw;
    const q = busca.toLowerCase();
    return habilidadesRaw.filter(h =>
      h.codigo.toLowerCase().includes(q) ||
      h.nome.toLowerCase().includes(q) ||
      h.label.toLowerCase().includes(q) ||
      h.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [habilidadesRaw, busca]);

  // Group by eixo
  const grupos = useMemo(() => {
    if (materia !== "portugues") return null;
    const map = new Map<string, HabilidadeCompleta[]>();
    for (const h of filtered) {
      const eixo = h.eixo || "Outros";
      if (!map.has(eixo)) map.set(eixo, []);
      map.get(eixo)!.push(h);
    }
    return map;
  }, [filtered, materia]);

  const selectedHab = habilidadesRaw.find(h => h.codigo === value);

  const toggleEixo = (eixo: string) => {
    setExpandedEixos(prev => {
      const next = new Set(prev);
      if (next.has(eixo)) next.delete(eixo);
      else next.add(eixo);
      return next;
    });
  };

  const handleSelect = (codigo: string) => {
    onChange(codigo);
    setOpen(false);
    setBusca("");
  };

  if (habilidadesRaw.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
    >
      <label className="flex items-center gap-1.5 text-sm font-bold text-primary mb-2">
        <span className="text-base">🎓</span> Habilidade BNCC <span className="text-muted-foreground font-normal">(opcional)</span>
      </label>

      {/* Selected / trigger button */}
      {!open ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full text-left p-3 rounded-xl bg-muted/70 border-2 border-border/50 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all"
          >
            {value && selectedHab ? (
              <div className="flex items-center gap-2">
                <span className="shrink-0 px-2 py-0.5 rounded text-xs font-mono font-bold bg-primary/10 text-primary">{selectedHab.codigo}</span>
                <span className="text-sm font-semibold text-foreground truncate">{selectedHab.label}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(""); }}
                  className="ml-auto shrink-0 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles size={16} />
                <span className="font-semibold text-sm">Automático — toque para escolher uma habilidade</span>
              </div>
            )}
          </button>
          <p className="text-xs text-muted-foreground ml-1">
            {habilidadesRaw.length} habilidades disponíveis para o {ano}º ano
          </p>
        </div>
      ) : (
        /* Expanded picker */
        <div className="rounded-xl border-2 border-primary/30 bg-card shadow-lg overflow-hidden">
          {/* Search bar */}
          <div className="p-3 bg-muted/50 border-b border-border space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="🔎 Buscar código ou tema..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); setBusca(""); }}
                className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <BookOpen size={12} />
              <span>{filtered.length} habilidade{filtered.length !== 1 ? "s" : ""}</span>
              {busca && <span className="text-primary">• filtrado de {habilidadesRaw.length}</span>}
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="ml-auto text-xs font-bold text-primary hover:underline"
              >
                ✨ Deixar automático
              </button>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto max-h-[45vh] p-2 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm font-semibold">Nenhuma habilidade encontrada 🤔</p>
                <p className="text-xs mt-1">Tente outro termo</p>
              </div>
            ) : materia === "portugues" && grupos ? (
              Array.from(grupos.entries()).map(([eixo, items]) => (
                <div key={eixo} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleEixo(eixo)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left"
                  >
                    {expandedEixos.has(eixo) ? (
                      <ChevronDown size={14} className="text-primary shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                    )}
                    <span className="text-lg">{EIXO_ICONS[eixo] || "📋"}</span>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{eixo}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">({items.length})</span>
                  </button>
                  <AnimatePresence>
                    {expandedEixos.has(eixo) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-0.5 pl-2 overflow-hidden"
                      >
                        {items.map(h => {
                          const isSelected = value === h.codigo;
                          return (
                            <button
                              key={h.codigo}
                              type="button"
                              onClick={() => handleSelect(h.codigo)}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                                  : "border-transparent hover:border-border hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                }`}>
                                  {h.codigo}
                                </span>
                                <span className={`text-xs font-semibold leading-snug ${isSelected ? "text-primary" : "text-foreground"}`}>
                                  {h.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              filtered.map(h => {
                const isSelected = value === h.codigo;
                return (
                  <button
                    key={h.codigo}
                    type="button"
                    onClick={() => handleSelect(h.codigo)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                        : "border-transparent hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}>
                        {h.codigo}
                      </span>
                      <span className={`text-xs font-semibold leading-snug ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {h.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
