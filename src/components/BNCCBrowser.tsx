import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpDown, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { PORTUGUES_COMPLETO, EIXOS_BNCC, type HabilidadeCompleta, type EixoBNCC } from "@/data/bncc-portugues-completo";
import { BNCC_HABILIDADES } from "@/data/bncc-habilidades";

const ANOS = ["1", "2", "3", "4", "5"];
const ANO_LABELS: Record<string, string> = { "1": "1º Ano", "2": "2º Ano", "3": "3º Ano", "4": "4º Ano", "5": "5º Ano" };

type SortMode = "codigo" | "alfabetica";

export default function BNCCBrowser() {
  const [anoSelecionado, setAnoSelecionado] = useState("1");
  const [materiaSelecionada, setMateriaSelecionada] = useState("portugues");
  const [busca, setBusca] = useState("");
  const [sort, setSort] = useState<SortMode>("codigo");
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [expandedEixos, setExpandedEixos] = useState<Set<string>>(new Set(EIXOS_BNCC));

  // Get materias available for selected year
  const materiasDisponiveis = useMemo(() => {
    const anoData = BNCC_HABILIDADES.find(a => a.ano === anoSelecionado);
    return anoData?.materias || [];
  }, [anoSelecionado]);

  // Get habilidades based on selection
  const habilidadesRaw = useMemo((): HabilidadeCompleta[] => {
    if (materiaSelecionada === "portugues") {
      return PORTUGUES_COMPLETO[anoSelecionado] || [];
    }
    // For other subjects, use the existing data and add a default eixo
    const materia = materiasDisponiveis.find(m => m.materia === materiaSelecionada);
    return (materia?.habilidades || []).map(h => ({ ...h, eixo: "Leitura/Escuta" as EixoBNCC }));
  }, [anoSelecionado, materiaSelecionada, materiasDisponiveis]);

  // Filter by search
  const habilidadesFiltradas = useMemo(() => {
    if (!busca.trim()) return habilidadesRaw;
    const q = busca.toLowerCase();
    return habilidadesRaw.filter(h =>
      h.codigo.toLowerCase().includes(q) ||
      h.nome.toLowerCase().includes(q) ||
      h.label.toLowerCase().includes(q) ||
      h.descricao.toLowerCase().includes(q) ||
      h.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [habilidadesRaw, busca]);

  // Sort
  const habilidadesOrdenadas = useMemo(() => {
    const sorted = [...habilidadesFiltradas];
    if (sort === "alfabetica") {
      sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    } else {
      sorted.sort((a, b) => a.codigo.localeCompare(b.codigo));
    }
    return sorted;
  }, [habilidadesFiltradas, sort]);

  // Group by eixo (only for Portuguese)
  const grupos = useMemo(() => {
    if (materiaSelecionada !== "portugues") return null;
    const map = new Map<string, HabilidadeCompleta[]>();
    for (const h of habilidadesOrdenadas) {
      const eixo = h.eixo || "Outros";
      if (!map.has(eixo)) map.set(eixo, []);
      map.get(eixo)!.push(h);
    }
    return map;
  }, [habilidadesOrdenadas, materiaSelecionada]);

  const toggleEixo = (eixo: string) => {
    setExpandedEixos(prev => {
      const next = new Set(prev);
      if (next.has(eixo)) next.delete(eixo);
      else next.add(eixo);
      return next;
    });
  };

  const expandAll = () => setExpandedEixos(new Set(EIXOS_BNCC));
  const collapseAll = () => setExpandedEixos(new Set());

  const nivelColor: Record<string, string> = {
    basico: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediario: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    avancado: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  const renderHabilidade = (h: HabilidadeCompleta) => {
    const isSelected = selectedCodigo === h.codigo;
    return (
      <motion.div
        key={h.codigo}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setSelectedCodigo(isSelected ? null : h.codigo)}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
            : "border-border hover:border-primary/30 hover:bg-muted/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-mono font-bold ${
            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          }`}>
            {h.codigo}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-primary" : "text-foreground"}`}>
              {h.label}
            </p>
            {isSelected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-2"
              >
                <p className="text-xs text-muted-foreground leading-relaxed">{h.nome}</p>
                <p className="text-xs text-foreground/80">{h.descricao}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${nivelColor[h.nivel]}`}>
                    {h.nivel}
                  </span>
                  {h.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="card-edu p-0 overflow-hidden">
      {/* Header controls */}
      <div className="p-4 bg-muted/50 border-b border-border space-y-3">
        {/* Year selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ano:</span>
          {ANOS.map(ano => (
            <button
              key={ano}
              onClick={() => { setAnoSelecionado(ano); setSelectedCodigo(null); setBusca(""); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                anoSelecionado === ano
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              }`}
            >
              {ANO_LABELS[ano]}
            </button>
          ))}
        </div>

        {/* Subject selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Disciplina:</span>
          {materiasDisponiveis.map(m => (
            <button
              key={m.materia}
              onClick={() => { setMateriaSelecionada(m.materia); setSelectedCodigo(null); setBusca(""); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                materiaSelecionada === m.materia
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              }`}
            >
              {m.icon} {m.materia_label}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por código (EF03LP01) ou texto..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setSort(s => s === "codigo" ? "alfabetica" : "codigo")}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-card border border-border hover:bg-muted text-foreground transition-colors"
            title="Alternar ordenação"
          >
            <ArrowUpDown size={14} />
            {sort === "codigo" ? "Código" : "A-Z"}
          </button>
          {materiaSelecionada === "portugues" && (
            <div className="flex gap-1">
              <button onClick={expandAll} className="px-2 py-2 rounded-lg text-xs font-bold bg-card border border-border hover:bg-muted text-muted-foreground">
                Expandir
              </button>
              <button onClick={collapseAll} className="px-2 py-2 rounded-lg text-xs font-bold bg-card border border-border hover:bg-muted text-muted-foreground">
                Recolher
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
          <BookOpen size={14} />
          <span>{habilidadesOrdenadas.length} habilidade{habilidadesOrdenadas.length !== 1 ? "s" : ""}</span>
          {busca && <span className="text-primary">• filtrado de {habilidadesRaw.length}</span>}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto max-h-[60vh] p-3 space-y-1">
        {habilidadesOrdenadas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm font-semibold">Nenhuma habilidade encontrada</p>
            <p className="text-xs mt-1">Tente outro termo de busca</p>
          </div>
        ) : materiaSelecionada === "portugues" && grupos ? (
          // Grouped by eixo
          Array.from(grupos.entries()).map(([eixo, items]) => (
            <div key={eixo} className="mb-2">
              <button
                onClick={() => toggleEixo(eixo)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left"
              >
                {expandedEixos.has(eixo) ? <ChevronDown size={14} className="text-primary shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{eixo}</span>
                <span className="text-[10px] text-muted-foreground font-semibold">({items.length})</span>
              </button>
              <AnimatePresence>
                {expandedEixos.has(eixo) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 pl-2 overflow-hidden"
                  >
                    {items.map(renderHabilidade)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          // Flat list for other subjects
          habilidadesOrdenadas.map(renderHabilidade)
        )}
      </div>
    </div>
  );
}
