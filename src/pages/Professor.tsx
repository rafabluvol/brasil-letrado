import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Save, CheckCircle2, Loader2, Trash2, Sparkles, ClipboardList, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ANOS_ESCOLARES, GENEROS_POR_ANO, TEMAS } from "@/data/bncc-content";
import { getHabilidadesPorMateria, formatHabilidadeDropdown } from "@/data/bncc-habilidades";
import BNCCPicker from "@/components/BNCCPicker";
import Vivenciando from "@/pages/Vivenciando";

export default function Professor() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"missao" | "vivenciando">("missao");
  const [ano, setAno] = useState("");
  const [genero, setGenero] = useState("");
  const [tema, setTema] = useState("");
  const [habilidade, setHabilidade] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentMission, setCurrentMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const generos = ano ? GENEROS_POR_ANO[ano] || [] : [];
  const canSave = ano && genero && tema;

  // Load current active mission
  useEffect(() => {
    loadMission();
  }, []);

  const loadMission = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_missions")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const m = data[0];
        setCurrentMission(m);
        setAno(m.ano_escolar);
        setGenero(m.genero_textual);
        setTema(m.tema);
        setHabilidade(m.habilidade_bncc || "");
      }
    } catch (err) {
      console.error("Error loading mission:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // Deactivate all existing missions
      await supabase
        .from("daily_missions")
        .update({ ativo: false })
        .eq("ativo", true);

      // Create new active mission
      const { data, error } = await supabase
        .from("daily_missions")
        .insert({
          ano_escolar: ano,
          genero_textual: genero,
          tema: tema,
          habilidade_bncc: habilidade || null,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentMission(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({
        title: "✅ Missão do Dia salva!",
        description: "Os alunos verão a nova missão ao acessar a plataforma.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao salvar",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      await supabase
        .from("daily_missions")
        .update({ ativo: false })
        .eq("ativo", true);

      setCurrentMission(null);
      setAno("");
      setGenero("");
      setTema("");
      setHabilidade("");
      toast({
        title: "Missão removida",
        description: "Os alunos verão os seletores padrão.",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const temaLabel = TEMAS.find(t => t.value === tema)?.label || tema;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200 rounded-full px-5 py-2 mb-4">
            <GraduationCap size={20} className="text-violet-600" />
            <span className="text-sm font-bold text-violet-700">Painel da Professora</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-muted/50 rounded-2xl p-1.5">
          <button
            onClick={() => setActiveTab("missao")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === "missao"
                ? "bg-card shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList size={18} />
            Missão do Dia 🎯
          </button>
          <button
            onClick={() => setActiveTab("vivenciando")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === "vivenciando"
                ? "bg-card shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lightbulb size={18} />
            VivencIAndo 💡
          </button>
        </div>

        {activeTab === "vivenciando" ? (
          <Vivenciando />
        ) : (
          <>

        {/* Current mission status */}
        {currentMission && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-emerald-800 text-sm">Missão ativa agora</p>
              <p className="text-emerald-700 text-xs">
                {currentMission.ano_escolar}º ano · {currentMission.genero_textual} · {TEMAS.find(t => t.value === currentMission.tema)?.label || currentMission.tema}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="p-2 rounded-xl hover:bg-emerald-100 text-emerald-600 transition-colors"
              title="Remover missão"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-border/60"
        >
          <div className="space-y-7">
            {/* Ano + Gênero */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2.5">
                  <span className="text-lg">📅</span> Ano Escolar
                </label>
                <select
                  value={ano}
                  onChange={(e) => { setAno(e.target.value); setGenero(""); }}
                  className="w-full h-13 px-5 rounded-xl bg-muted/70 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none font-semibold text-foreground text-[15px] transition-all"
                >
                  <option value="">Selecione o ano</option>
                  {ANOS_ESCOLARES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2.5">
                  <span className="text-lg">📝</span> Gênero Textual
                </label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  disabled={!ano}
                  className="w-full h-13 px-5 rounded-xl bg-muted/70 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none font-semibold text-foreground text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione o gênero</option>
                  {generos.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tema */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2.5">
                <span className="text-lg">🎯</span> Tema / Matéria
              </label>
              <select
                value={tema}
                onChange={(e) => { setTema(e.target.value); setHabilidade(""); }}
                className="w-full h-13 px-5 rounded-xl bg-muted/70 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none font-semibold text-foreground text-[15px] transition-all"
              >
                <option value="">Selecione o tema</option>
                {TEMAS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Habilidade BNCC */}
            {ano && tema && tema !== "crie-voce-mesmo" && (
              <BNCCPicker
                ano={ano}
                tema={tema}
                value={habilidade}
                onChange={setHabilidade}
              />
            )}

            {/* Save button */}
            <motion.button
              whileHover={canSave && !saving ? { scale: 1.02, y: -2 } : {}}
              whileTap={canSave && !saving ? { scale: 0.98 } : {}}
              disabled={!canSave || saving}
              onClick={handleSave}
              className="btn-hero w-full h-14 flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Salvando...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 size={20} />
                  Missão Salva! ✅
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salvar Missão do Dia 🎯
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Preview */}
        {canSave && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl"
          >
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">👁️ Preview — O aluno verá:</p>
            <div className="text-center">
              <h3 className="text-xl font-display font-extrabold text-foreground mb-1">
                Sua missão de hoje: {genero}! 🎯
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Escreva uma ideia e eu transformo em uma aventura incrível!
              </p>
            </div>
          </motion.div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
