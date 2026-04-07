import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, TrendingUp, TrendingDown, Target, ChevronRight, BookOpen, Palette, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getLevelInfo, calculateLevelFromXp } from "@/lib/level-system";
import TutorArmario from "./TutorArmario";
import TutorConquistas from "./TutorConquistas";

type PanelView = "home" | "melhorar" | "indo-bem" | "indicados" | "armario" | "conquistas";

export default function TutorWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<PanelView>("home");
  const [stats, setStats] = useState({ accuracy: 0, brazukas: 0, level: 1 });
  const [equippedLevel, setEquippedLevel] = useState<number | null>(null);
  const levelInfo = equippedLevel ? getLevelInfo(equippedLevel) : getLevelInfo(stats.level);
  const [categories, setCategories] = useState<{ name: string; label: string; rate: number; total: number }[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [animClass, setAnimClass] = useState("tutor-idle");
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ANIM_CLASSES = ["tutor-anim-bounce", "tutor-anim-wiggle", "tutor-anim-wave", "tutor-anim-peek"];

  const playRandomAnim = useCallback(() => {
    const pick = ANIM_CLASSES[Math.floor(Math.random() * ANIM_CLASSES.length)];
    setAnimClass(pick);
    // After animation ends, go back to idle breathing
    setTimeout(() => setAnimClass("tutor-idle"), 2000);
  }, []);

  useEffect(() => {
    if (isOpen) return; // Don't animate when panel is open
    const schedule = () => {
      const delay = 4000 + Math.random() * 5000; // 4-9s between animations
      animTimer.current = setTimeout(() => {
        playRandomAnim();
        schedule();
      }, delay);
    };
    schedule();
    return () => { if (animTimer.current) clearTimeout(animTimer.current); };
  }, [isOpen, playRandomAnim]);

  useEffect(() => {
    if (!isOpen || !user) return;
    setPanel("home");

    Promise.all([
      supabase.from("profiles").select("total_xp, nivel").eq("user_id", user.id).single(),
      supabase.from("student_performance").select("*").eq("user_id", user.id).single(),
      supabase.from("activity_results").select("genero, tema, acertos, total_exercicios").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]).then(([profileRes, perfRes, actRes]) => {
      const p = profileRes.data;
      const perf = perfRes.data;

      if (p) {
        const lvl = calculateLevelFromXp(p.total_xp || 0);
        setStats({ brazukas: p.total_xp || 0, level: lvl, accuracy: 0 });
      }

      if (perf) {
        const cats = [
          { name: "interpretacao", label: "Interpretação", acertos: perf.interpretacao_acertos || 0, total: perf.interpretacao_total || 0 },
          { name: "vocabulario", label: "Vocabulário", acertos: perf.vocabulario_acertos || 0, total: perf.vocabulario_total || 0 },
          { name: "gramatica", label: "Gramática", acertos: perf.gramatica_acertos || 0, total: perf.gramatica_total || 0 },
        ].map(c => ({
          name: c.name, label: c.label,
          rate: c.total > 0 ? Math.round((c.acertos / c.total) * 100) : 0,
          total: c.total,
        }));
        const totalAll = cats.reduce((s, c) => s + c.total, 0);
        const acertosAll = [perf.interpretacao_acertos || 0, perf.vocabulario_acertos || 0, perf.gramatica_acertos || 0].reduce((a, b) => a + b, 0);
        setStats(prev => ({ ...prev, accuracy: totalAll > 0 ? Math.round((acertosAll / totalAll) * 100) : 0 }));
        setCategories(cats);
      }

      if (actRes.data) setActivities(actRes.data);
    });
  }, [isOpen, user]);

  const fortes = categories.filter(c => c.total > 0 && c.rate >= 60);
  const fracos = categories.filter(c => c.total > 0 && c.rate < 60);
  const semDados = categories.filter(c => c.total === 0);

  const getRecommendation = () => {
    if (activities.length === 0) return "Complete sua primeira atividade para receber recomendações personalizadas! 🚀";
    const weakCat = fracos.length > 0 ? fracos.sort((a, b) => a.rate - b.rate)[0] : null;
    const temaCount: Record<string, number> = {};
    activities.forEach(a => { temaCount[a.tema] = (temaCount[a.tema] || 0) + 1; });
    const leastTema = Object.entries(temaCount).sort((a, b) => a[1] - b[1])[0]?.[0];
    if (weakCat) {
      return `No seu caso, recomendo focar em ${weakCat.label} (${weakCat.rate}% de acerto). Tente explorar mais atividades ${leastTema ? `no tema "${leastTema}"` : ""} para diversificar seu aprendizado e fortalecer essa habilidade. 💪`;
    }
    return `Você está indo muito bem! Para continuar evoluindo, explore temas diferentes ${leastTema ? `como "${leastTema}"` : ""} e desafie-se com gêneros textuais variados. 🌟`;
  };

  const handleEquip = (nivel: number) => {
    setEquippedLevel(prev => prev === nivel ? null : nivel);
  };

  const tutorImg = levelInfo.image;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 rounded-2xl bg-card overflow-hidden"
            style={{ boxShadow: "var(--shadow-tutor)" }}
          >
            {/* Header */}
            <div className="p-4 flex items-center gap-3" style={{ background: "var(--gradient-hero)" }}>
              <img src={tutorImg} alt="Brasil Letrado Tutor" className="w-11 h-11 rounded-full bg-white/20 p-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-white font-display text-sm">Brasil Letrado - Seu Tutor</h3>
                <p className="text-xs text-white/80">Sempre aqui para ajudar!</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>

            {/* Stats */}
            <div className="px-4 py-3 border-b border-border flex gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
                <TrendingUp size={14} />
                <span>{stats.accuracy}% acertos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-xp">
                <Sparkles size={14} />
                <span>{stats.brazukas} Brazukas</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-info">
                <Target size={14} />
                <span>Nível {stats.level}</span>
              </div>
            </div>

            {/* Content area */}
            <div className="max-h-72 overflow-y-auto">
              <AnimatePresence mode="wait">
                {panel === "home" && (
                  <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 space-y-2">
                    {[
                      { id: "melhorar" as PanelView, label: "O que posso melhorar?", icon: TrendingDown, color: "text-destructive" },
                      { id: "indo-bem" as PanelView, label: "Onde estou mandando bem?", icon: TrendingUp, color: "text-success" },
                      { id: "indicados" as PanelView, label: "Exercícios indicados pra mim", icon: BookOpen, color: "text-info" },
                      { id: "armario" as PanelView, label: "Nosso Estilo", icon: Palette, color: "text-secondary" },
                      { id: "conquistas" as PanelView, label: "Conquistas", icon: Trophy, color: "text-xp" },
                    ].map((btn, i) => (
                      <motion.button
                        key={btn.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setPanel(btn.id)}
                        className="w-full flex items-center gap-3 text-sm px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left font-semibold text-foreground"
                      >
                        <btn.icon size={18} className={btn.color} />
                        <span className="flex-1">{btn.label}</span>
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {panel === "melhorar" && (
                  <motion.div key="melhorar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                    <button onClick={() => setPanel("home")} className="text-xs text-primary font-semibold flex items-center gap-1 mb-1">← Voltar</button>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <TrendingDown size={16} className="text-destructive" /> Áreas para melhorar
                    </h4>
                    {fracos.length > 0 ? fracos.map((c, i) => (
                      <div key={i} className="bg-destructive/5 border border-destructive/10 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-foreground">{c.label}</span>
                          <span className="text-xs font-bold text-destructive">{c.rate}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full">
                          <div className="h-full rounded-full bg-destructive/60" style={{ width: `${c.rate}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          {c.rate < 30 ? "Precisa de atenção especial" : "Está quase lá, continue praticando!"}
                        </p>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">
                        {semDados.length === categories.length ? "Complete atividades para ver seu desempenho! 📚" : "Parabéns! Você está bem em todas as áreas! 🎉"}
                      </p>
                    )}
                  </motion.div>
                )}

                {panel === "indo-bem" && (
                  <motion.div key="indo-bem" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                    <button onClick={() => setPanel("home")} className="text-xs text-primary font-semibold flex items-center gap-1 mb-1">← Voltar</button>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <TrendingUp size={16} className="text-success" /> Seus pontos fortes
                    </h4>
                    {fortes.length > 0 ? fortes.map((c, i) => (
                      <div key={i} className="bg-success/5 border border-success/10 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-foreground">{c.label}</span>
                          <span className="text-xs font-bold text-success">{c.rate}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full">
                          <div className="h-full rounded-full bg-success/60" style={{ width: `${c.rate}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          {c.rate >= 80 ? "Excelente! Continue assim! ⭐" : "Bom trabalho, você está no caminho certo!"}
                        </p>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">
                        {semDados.length === categories.length ? "Complete atividades para ver seu desempenho! 📚" : "Continue praticando para fortalecer suas habilidades! 💪"}
                      </p>
                    )}
                  </motion.div>
                )}

                {panel === "indicados" && (
                  <motion.div key="indicados" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                    <button onClick={() => setPanel("home")} className="text-xs text-primary font-semibold flex items-center gap-1 mb-1">← Voltar</button>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <BookOpen size={16} className="text-info" /> Recomendação para você
                    </h4>
                    <div className="bg-info/5 border border-info/10 rounded-lg p-3">
                      <p className="text-sm text-foreground leading-relaxed">{getRecommendation()}</p>
                    </div>
                  </motion.div>
                )}

                {panel === "armario" && (
                  <TutorArmario
                    currentXp={stats.brazukas}
                    equippedLevel={equippedLevel}
                    onEquip={handleEquip}
                    onBack={() => setPanel("home")}
                  />
                )}

                {panel === "conquistas" && (
                  <TutorConquistas
                    currentXp={stats.brazukas}
                    onBack={() => setPanel("home")}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-full flex items-center justify-center overflow-visible bg-white ${isOpen ? "w-10 h-10" : "w-20 h-20"}`}
        style={{ boxShadow: "0 4px 20px -4px hsl(145 65% 45% / 0.4)" }}
      >
        {isOpen ? (
          <X size={16} className="text-muted-foreground" />
        ) : (
          <img
            src={tutorImg}
            alt={levelInfo.titulo}
            className={`w-[72px] h-[72px] object-contain rounded-full ${animClass}`}
          />
        )}
      </motion.button>
    </div>
  );
}
