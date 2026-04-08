import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Sparkles, Loader2, Eye, PenLine, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import sabiaLogo from "@/assets/sabia-logo.png";
import CuriosidadesLoading from "@/components/CuriosidadesLoading";
import AnimatedSky from "@/components/AnimatedSky";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ano, setAno] = useState("");
  const [genero, setGenero] = useState("");
  const [tema, setTema] = useState("");
  const [promptAluno, setPromptAluno] = useState("");
  const [historiaAluno, setHistoriaAluno] = useState("");
  const [habilidade, setHabilidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyMission, setDailyMission] = useState<any>(null);
  const [missionLoaded, setMissionLoaded] = useState(false);

  // Load daily mission on mount
  useEffect(() => {
    const loadMission = async () => {
      try {
        const { data } = await supabase
          .from("daily_missions")
          .select("*")
          .eq("ativo", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const m = data[0];
          setDailyMission(m);
          setAno(m.ano_escolar);
          setGenero(m.genero_textual);
          setTema(m.tema);
          setHabilidade(m.habilidade_bncc || "");
        }
      } catch (err) {
        console.error("Error loading daily mission:", err);
      } finally {
        setMissionLoaded(true);
      }
    };
    loadMission();
  }, []);

  const isCrieVoceMesmo = tema === "crie-voce-mesmo";
  const hasMission = !!dailyMission;

  const handleStart = async () => {
    // Use mission values or defaults
    const finalAno = ano || "3";
    const finalGenero = genero || "Conto";
    const finalTema = tema || "portugues";
    setLoading(true);
    try {
      const body: Record<string, string> = { ano: finalAno, genero: finalGenero, tema: finalTema };
      if (isCrieVoceMesmo) body.prompt = promptAluno;
      if (habilidade) body.habilidade = habilidade;
      body.historiaAluno = historiaAluno;

      const { data, error } = await supabase.functions.invoke("generate-atividade", { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      navigate("/atividade", { state: { atividade: data, ano: finalAno, genero: finalGenero, tema: finalTema, prompt: promptAluno, historiaAluno } });
    } catch (err: any) {
      toast({
        title: "Erro ao gerar atividade",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const depoimentos = [
    { nome: "Ana Paula S.", papel: "Mãe de aluno – 3º ano", avatar: "👩", texto: "Meu filho melhorou muito na leitura em apenas 2 meses. Ele pede pra usar a plataforma todo dia! A parte de leitura em voz alta é fantástica.", estrelas: 5 },
    { nome: "Prof. Carla Mendes", papel: "Professora – 2º ano", avatar: "👩‍🏫", texto: "Finalmente uma ferramenta 100% alinhada à BNCC. Consigo acompanhar a evolução de cada aluno e planejar melhor minhas aulas.", estrelas: 5 },
    { nome: "Roberto Lima", papel: "Pai de aluna – 5º ano", avatar: "👨", texto: "A Juliana sempre teve dificuldade em interpretação de texto. Com o tutor inteligente, ela ganhou confiança e as notas subiram!", estrelas: 5 },
    { nome: "Prof. Marcos Oliveira", papel: "Coordenador pedagógico", avatar: "👨‍🏫", texto: "O alinhamento com a BNCC é impecável. Os relatórios por habilidade nos ajudam a identificar exatamente onde cada turma precisa de reforço.", estrelas: 5 },
    { nome: "Fernanda Costa", papel: "Mãe de aluno – 1º ano", avatar: "👩", texto: "Meu filho está sendo alfabetizado e adora as atividades com parlendas e cantigas. É lúdico e educativo ao mesmo tempo.", estrelas: 5 },
    { nome: "Prof. Luciana Ramos", papel: "Professora – 4º ano", avatar: "👩‍🏫", texto: "A variedade de gêneros textuais e a integração com outras disciplinas fazem toda a diferença. Os alunos aprendem sem perceber!", estrelas: 5 },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {loading && <CuriosidadesLoading message="Gerando sua atividade com IA..." />}
      {/* Hero with video background */}
      <section className="relative overflow-hidden py-10 md:py-16 pb-52 md:pb-64">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/35 to-[#E8EEF7]" />
        <div className="container relative flex items-center justify-center min-h-[480px] md:min-h-[520px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto bg-white/25 backdrop-blur-sm rounded-2xl px-8 py-8 shadow-lg"
          >
            <div className="inline-flex items-center gap-2 badge-xp mb-5 text-sm">
              <Sparkles size={16} />
              100% alinhado à BNCC
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight mb-3 text-foreground">
              Aprenda de um jeito{" "}
              <span className="font-black inline-flex">
                {"Divertido!".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    className="inline-block cursor-default"
                    style={{
                      background: "linear-gradient(45deg, hsl(145,85%,30%) 0%, hsl(50,100%,42%) 15%, hsl(210,85%,38%) 30%, hsl(145,85%,30%) 45%, hsl(50,100%,42%) 60%, hsl(210,85%,38%) 75%, hsl(145,85%,30%) 100%)",
                      backgroundSize: "500% 100%",
                      backgroundPosition: `${i * 12}% 0`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    whileHover={{ rotateY: 360, transition: { duration: 0.6, ease: "easeInOut" } }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            </h2>
            <p className="text-base md:text-lg text-foreground font-semibold leading-relaxed mb-5">
              Leitura, Interpretação, Gramática no contexto<br />e um Tutor Inteligente feito para te ajudar.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("comece-atividade")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-hero px-8 py-3 text-base font-bold"
            >
              🚀 Vamos nessa!
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Seletores */}
      <section className="relative -mt-28 z-10 py-10 overflow-hidden">
        {/* Animated sky background */}
        <AnimatedSky />

        <div className="container relative px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-[var(--shadow-elevated)] border border-border/60"
        >
          <div id="comece-atividade" className="scroll-mt-24">
            <div className="space-y-8">
              {hasMission ? (
                /* ─── MISSION MODE: Show mission title ─── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, -3, 3, -3, 0] }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-5xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <h3 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                    Sua missão de hoje:{" "}
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      {dailyMission.genero_textual}!
                    </span>
                  </h3>
                  <p className="text-base text-muted-foreground font-semibold">
                    Escreva uma ideia e eu transformo em uma aventura incrível! ✨
                  </p>
                </motion.div>
              ) : (
                /* ─── NO MISSION: Simple header ─── */
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shadow-sm">
                      <BookOpen size={26} className="text-primary" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">Crie sua história!</h3>
                  </div>
                  <p className="text-base text-muted-foreground font-semibold">
                    Escreva uma ideia e a IA transforma em uma aventura com ilustrações! ✨
                  </p>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="flex items-center gap-2 text-sm md:text-base font-bold text-primary mb-2.5">
                  <span className="text-lg">📖</span> Escreva sua história!
                </label>
                <textarea
                  value={historiaAluno}
                  onChange={(e) => setHistoriaAluno(e.target.value)}
                  placeholder={`Ex: "O urso polar e seu amigo Natan viviam em uma caverna gelada até que um dia encontraram um mapa misterioso..."`}
                  className="w-full p-5 rounded-xl bg-muted/70 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none font-semibold text-foreground text-[15px] transition-all resize-none min-h-[140px] placeholder:text-muted-foreground/50 placeholder:font-normal"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-2 text-right font-medium">{historiaAluno.length}/500</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={historiaAluno.trim().length >= 10 && !loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={historiaAluno.trim().length >= 10 && !loading ? { scale: 0.98 } : {}}
                disabled={historiaAluno.trim().length < 10 || loading}
                onClick={handleStart}
                className="btn-hero w-full h-16 flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed mt-3 rounded-2xl"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Gerando atividade...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Criar Minha História! 🚀
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative py-14 overflow-hidden">
        <AnimatedSky />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { Icon: Eye, title: "Interpretação", desc: "80% do foco em compreensão textual", gradient: "from-primary via-emerald-500 to-teal-500", hoverGlow: "group-hover:shadow-primary/25" },
              { Icon: PenLine, title: "Gramática no Contexto", desc: "Aprenda gramática dentro do texto", gradient: "from-secondary via-amber-400 to-yellow-500", hoverGlow: "group-hover:shadow-secondary/25" },
              { Icon: Bot, title: "Tutor Inteligente", desc: "Um tutor que te conhece e te ajuda", gradient: "from-accent via-sky-400 to-blue-500", hoverGlow: "group-hover:shadow-accent/25" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.15 }}
                whileHover={{ scale: 1.06, y: -6 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative bg-card/90 backdrop-blur-md text-center cursor-pointer rounded-2xl p-7 border border-border/50 shadow-lg hover:shadow-2xl ${f.hoverGlow} transition-all duration-300`}
              >
                {/* Gradient border effect on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
                
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <f.Icon size={28} className="text-white" strokeWidth={2} />
                </div>
                <h4 className="font-display text-lg text-foreground mb-1.5 group-hover:text-primary transition-colors duration-200">{f.title}</h4>
                <p className="text-sm text-muted-foreground font-semibold group-hover:text-foreground/70 transition-colors duration-200">{f.desc}</p>

                {/* Bottom gradient line on hover */}
                <motion.div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full bg-gradient-to-r ${f.gradient}`}
                  initial={{ width: 0, opacity: 0 }}
                  whileHover={{ width: "60%", opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Classroom showcase with cloud transition */}
      <section className="relative overflow-hidden py-0">
        {/* Cloud/gradient transition from above */}
        <div className="h-24 bg-gradient-to-b from-background via-background/90 to-transparent relative z-10" />
        
        {/* Classroom image */}
        <div className="relative">
          <img
            src="/hero-classroom.jpg"
            alt="Sala de aula com alunos aprendendo de forma lúdica"
            className="w-full h-[420px] md:h-[500px] object-cover"
            loading="lazy"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center px-4"
            >
              <h2 className="font-display text-3xl md:text-4xl text-white mb-3" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
                Aprender pode ser divertido de verdade
              </h2>
              <p className="text-white/90 font-semibold text-lg max-w-lg mx-auto" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
                Atividades lúdicas e interativas que transformam a sala de aula
              </p>
            </motion.div>
          </div>
        </div>

        {/* Cloud/gradient transition to below */}
        <div className="h-24 bg-gradient-to-t from-background via-background/90 to-transparent relative z-10 -mt-1" />
      </section>

      {/* Testimonials */}
      <section className="relative py-12 overflow-hidden">
        <AnimatedSky />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              ⭐ Depoimentos reais
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
              O que dizem sobre nós
            </h2>
            <p className="text-muted-foreground font-semibold max-w-lg mx-auto">
              Pais, professores e gestores que já transformaram o aprendizado com nossa plataforma
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {depoimentos.map((d, i) => (
              <motion.div
                key={d.nome}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 12px 40px -8px hsl(145 70% 40% / 0.15)" }}
                className="bg-card rounded-2xl p-6 border border-border/60 shadow-[var(--shadow-card)] transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: d.estrelas }).map((_, s) => (
                    <span key={s} className="text-secondary text-lg">★</span>
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-5 italic">
                  "{d.texto}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <span className="text-2xl">{d.avatar}</span>
                  <div>
                    <p className="font-bold text-sm text-foreground">{d.nome}</p>
                    <p className="text-xs text-muted-foreground font-semibold">{d.papel}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* BNCC Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-16 max-w-2xl mx-auto text-center bg-gradient-to-br from-primary/8 via-secondary/6 to-accent/8 rounded-2xl p-8 border border-primary/20"
          >
            <span className="text-4xl block mb-3">🏅</span>
            <h3 className="font-display text-xl text-foreground mb-2">
              100% Alinhado à BNCC
            </h3>
            <p className="text-sm text-muted-foreground font-semibold leading-relaxed">
              Todas as atividades seguem rigorosamente as habilidades da Base Nacional Comum Curricular,
              garantindo que cada exercício contribua para o desenvolvimento previsto pelo MEC
              para o Ensino Fundamental I.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
