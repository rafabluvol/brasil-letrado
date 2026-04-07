import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, BookOpen, ChevronDown, ChevronUp, Loader2, Theater, Users, Palette, MessageCircle, Gamepad2, Trophy, Music, Lightbulb, Scissors, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const IDEA_ICONS = [Theater, Users, Palette, MessageCircle, Gamepad2, Trophy, Music, Lightbulb, Scissors, Globe];

interface Idea {
  titulo: string;
  descricao: string;
  passos: string[];
}

interface StoryRef {
  id: string;
  titulo: string;
  historia_texto: string;
  ano: string;
  genero: string;
}

export default function Vivenciando() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<StoryRef | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      // Load from activity_results (stories the student already did)
      const { data: results } = await supabase
        .from("activity_results")
        .select("id, titulo, tema, ano, genero")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Also load from student_productions
      const { data: prods } = await supabase
        .from("student_productions")
        .select("id, titulo, historia_texto, ano, genero")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const combined: StoryRef[] = [];
      if (prods) {
        prods.forEach((p: any) => combined.push({
          id: p.id,
          titulo: p.titulo,
          historia_texto: p.historia_texto || "",
          ano: p.ano || "3",
          genero: p.genero || "",
        }));
      }
      if (results) {
        results.forEach((r: any) => combined.push({
          id: r.id,
          titulo: r.titulo || r.tema,
          historia_texto: "",
          ano: r.ano || "3",
          genero: r.genero || "",
        }));
      }
      setStories(combined);
      setLoading(false);
    };
    load();
  }, [user]);

  const generateIdeas = async (story: StoryRef) => {
    setSelectedStory(story);
    setGenerating(true);
    setIdeas([]);
    setExpandedIdea(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-vivenciando", {
        body: {
          titulo: story.titulo,
          historia_texto: story.historia_texto,
          ano: story.ano,
          genero: story.genero,
        },
      });
      if (error) throw error;
      setIdeas(data.ideias || []);
    } catch (err: any) {
      toast({ title: "Erro ao gerar ideias", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Faça login para acessar o VivencIAndo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background pb-12">
      <div className="container max-w-5xl py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectedStory ? (setSelectedStory(null), setIdeas([])) : navigate("/")}
            className="p-2 rounded-xl bg-card hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Sparkles className="text-secondary" size={28} />
              <span style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                VivencIAndo
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">Ideias criativas para vivenciar histórias fora das telas 🎭</p>
          </div>
        </div>

        {!selectedStory ? (
          /* Story selection */
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              Escolha uma história para gerar ideias
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles size={48} className="mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">Você ainda não tem histórias. Complete uma atividade primeiro!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                >
                  Criar atividade
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stories.map((story, i) => (
                  <motion.button
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => generateIdeas(story)}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                        <BookOpen size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{story.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {story.genero} • {story.ano}º ano
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles size={12} />
                      Gerar 10 ideias criativas
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Ideas display */
          <div>
            <div className="mb-6 p-4 rounded-2xl bg-card border border-border">
              <p className="text-sm text-muted-foreground">Baseado na história:</p>
              <p className="font-semibold text-lg">{selectedStory.titulo}</p>
              <p className="text-xs text-muted-foreground">{selectedStory.genero} • {selectedStory.ano}º ano</p>
            </div>

            {generating ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Sparkles size={40} className="text-secondary" />
                </motion.div>
                <p className="text-muted-foreground font-medium">Criando ideias incríveis para sua turma...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {ideas.map((idea, i) => {
                    const Icon = IDEA_ICONS[i % IDEA_ICONS.length];
                    const isExpanded = expandedIdea === i;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => setExpandedIdea(isExpanded ? null : i)}
                          className="w-full p-4 flex items-center gap-3 text-left group hover:bg-muted/30 transition-colors"
                        >
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                            isExpanded
                              ? "from-primary/20 to-accent/20"
                              : "from-muted to-muted group-hover:from-primary/10 group-hover:to-accent/10"
                          } transition-colors`}>
                            <Icon size={22} className={isExpanded ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{idea.titulo}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{idea.descricao}</p>
                          </div>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                            <ChevronDown size={18} className="text-muted-foreground" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 border-t border-border/50">
                                <p className="text-sm text-muted-foreground mb-3">{idea.descricao}</p>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                                  📋 Passo a passo
                                </h4>
                                <ol className="space-y-2">
                                  {idea.passos.map((passo, pi) => (
                                    <li key={pi} className="flex items-start gap-2 text-sm">
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                        {pi + 1}
                                      </span>
                                      <span className="text-foreground/80">{passo}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
