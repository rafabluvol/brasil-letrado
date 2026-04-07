import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, GraduationCap, School, TrendingUp, TrendingDown, Target,
  BookOpen, Award, Activity, Brain, BarChart3, Lightbulb, Trophy,
  ArrowLeft, ChevronDown, Sparkles, Zap, Eye, AlertTriangle,
  Medal, Star, Filter, Database, UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, Treemap,
} from "recharts";
import {
  generateMockData, generateInsights,
  HABILIDADES_BNCC, GENEROS, TEMAS_DATA, MESES,
  type Aluno, type Professor, type Escola, type Insight,
} from "@/data/dashboard-mock";

const TABS = [
  { id: "meu", label: "Meu Desempenho", icon: UserCircle },
  { id: "geral", label: "Visão Geral", icon: Eye },
  { id: "alunos", label: "Alunos", icon: Users },
  { id: "professores", label: "Professores", icon: GraduationCap },
  { id: "escolas", label: "Escolas", icon: School },
  { id: "rankings", label: "Rankings", icon: Trophy },
  { id: "habilidades", label: "Habilidades BNCC", icon: Brain },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

const COLORS = [
  "hsl(145, 70%, 42%)", "hsl(48, 95%, 50%)", "hsl(205, 90%, 48%)",
  "hsl(340, 75%, 55%)", "hsl(280, 65%, 55%)", "hsl(25, 90%, 55%)",
  "hsl(170, 70%, 42%)", "hsl(0, 75%, 55%)",
];

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

// ─── KPI Card ───────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, suffix = "", change, color, delay = 0 }: {
  icon: any; label: string; value: number | string; suffix?: string;
  change?: number; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px -8px hsl(var(--primary) / 0.15)" }}
      className="bg-card rounded-2xl border border-border p-5 transition-shadow cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
            change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-foreground">{value}{suffix}</p>
      <p className="text-xs text-muted-foreground font-semibold mt-0.5">{label}</p>
    </motion.div>
  );
}

// ─── Chart Container ────────────────────────────────────
function ChartCard({ title, subtitle, children, className = "", delay = 0 }: {
  title: string; subtitle?: string; children: React.ReactNode;
  className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ boxShadow: "0 8px 30px -6px hsl(var(--primary) / 0.12)" }}
      className={`bg-card rounded-2xl border border-border p-6 transition-shadow ${className}`}
    >
      <div className="mb-4">
        <h4 className="font-bold text-foreground text-sm">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs font-bold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-semibold flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-black">{typeof p.value === "number" ? p.value.toFixed?.(1) ?? p.value : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Ranking Row ────────────────────────────────────────
function RankRow({ pos, name, value, max, label2, delay = 0 }: {
  pos: number; name: string; value: number; max: number; label2?: string; delay?: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01, backgroundColor: "hsl(var(--muted) / 0.5)" }}
      className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-default"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
        pos <= 3 ? "text-white" : "bg-muted text-muted-foreground"
      }`} style={pos <= 3 ? { background: MEDAL_COLORS[pos - 1] } : {}}>
        {pos <= 3 ? <Medal size={14} /> : pos}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{name}</p>
        {label2 && <p className="text-[10px] text-muted-foreground">{label2}</p>}
      </div>
      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${COLORS[0]}, ${COLORS[2]})` }}
        />
      </div>
      <span className="text-sm font-black text-foreground w-12 text-right">{value}%</span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("meu");
  const [loaded, setLoaded] = useState(false);
  const [selectedAno, setSelectedAno] = useState("");
  const [selectedEscola, setSelectedEscola] = useState("");

  // ─── Real user data from Supabase ───
  const [myPerformance, setMyPerformance] = useState<any>(null);
  const [myActivities, setMyActivities] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loadingMyData, setLoadingMyData] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingMyData(true);
    Promise.all([
      supabase.from("student_performance").select("*").eq("user_id", user.id).single(),
      supabase.from("activity_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("total_xp, total_atividades, nivel, nome, ano_escolar").eq("user_id", user.id).single(),
    ]).then(([perfRes, actRes, profileRes]) => {
      if (perfRes.data) setMyPerformance(perfRes.data);
      if (actRes.data) setMyActivities(actRes.data);
      if (profileRes.data) setMyProfile(profileRes.data);
      setLoadingMyData(false);
    });
  }, [user]);

  const { alunos, professores, escolas } = useMemo(() => {
    if (!loaded) return { alunos: [] as Aluno[], professores: [] as Professor[], escolas: [] as Escola[] };
    return generateMockData();
  }, [loaded]);

  const insights = useMemo(() => {
    if (!alunos.length) return [];
    return generateInsights(alunos, professores, escolas);
  }, [alunos, professores, escolas]);

  // Filtered data
  const filteredAlunos = useMemo(() => {
    let f = alunos;
    if (selectedAno) f = f.filter(a => a.ano === Number(selectedAno));
    if (selectedEscola) f = f.filter(a => a.escola === selectedEscola);
    return f;
  }, [alunos, selectedAno, selectedEscola]);

  // Aggregations
  const mediaAcertos = filteredAlunos.length ? Math.round(filteredAlunos.reduce((s, a) => s + a.acertos, 0) / filteredAlunos.length) : 0;
  const mediaEngajamento = filteredAlunos.length ? Math.round(filteredAlunos.reduce((s, a) => s + a.engajamento, 0) / filteredAlunos.length) : 0;
  const totalAtividades = filteredAlunos.reduce((s, a) => s + a.atividades, 0);
  const habDominadas = Object.keys(HABILIDADES_BNCC).filter(k => {
    const avg = filteredAlunos.length ? filteredAlunos.reduce((s, a) => s + (a.habilidades[k] || 0), 0) / filteredAlunos.length : 0;
    return avg >= 70;
  }).length;
  const habCriticas = Object.keys(HABILIDADES_BNCC).length - habDominadas;
  const mediaEvolucao = filteredAlunos.length ? +(filteredAlunos.reduce((s, a) => s + a.evolucao, 0) / filteredAlunos.length).toFixed(1) : 0;

  // Chart data helpers
  const habChartData = Object.entries(HABILIDADES_BNCC).map(([k, v]) => ({
    habilidade: v,
    media: filteredAlunos.length ? Math.round(filteredAlunos.reduce((s, a) => s + (a.habilidades[k] || 0), 0) / filteredAlunos.length) : 0,
  })).sort((a, b) => a.media - b.media);

  const generoChartData = GENEROS.map(g => ({
    genero: g,
    media: filteredAlunos.length ? Math.round(filteredAlunos.reduce((s, a) => s + (a.generos[g] || 0), 0) / filteredAlunos.length) : 0,
  }));

  const temaChartData = TEMAS_DATA.map(t => ({
    tema: t,
    media: filteredAlunos.length ? Math.round(filteredAlunos.reduce((s, a) => s + (a.temas[t] || 0), 0) / filteredAlunos.length) : 0,
  }));

  const evolucaoMensal = MESES.map((mes, i) => ({
    mes,
    acertos: filteredAlunos.length ? Math.round(filteredAlunos.reduce((s, a) => s + a.historicoMensal[i].acertos, 0) / filteredAlunos.length) : 0,
    atividades: filteredAlunos.length ? Math.round(filteredAlunos.reduce((s, a) => s + a.historicoMensal[i].atividades, 0) / filteredAlunos.length) : 0,
  }));

  const engajamentoVsDesempenho = filteredAlunos.map(a => ({
    nome: a.nome, engajamento: a.engajamento, acertos: a.acertos,
  }));

  const escolaCompData = escolas.map(e => ({
    escola: e.nome.replace("E.M. ", ""),
    media: e.mediaAcertos,
    evolucao: e.evolucao,
    engajamento: e.engajamento,
  }));

  const profCompData = professores.map(p => ({
    professor: p.nome.replace("Profª ", "").replace("Prof. ", ""),
    media: p.mediaAcertos,
    evolucao: p.evolucao,
    alunos: p.totalAlunos,
    risco: p.alunosEmRisco,
  }));

  const distribuicaoDesempenho = [
    { faixa: "0-30%", quantidade: filteredAlunos.filter(a => a.acertos <= 30).length },
    { faixa: "31-50%", quantidade: filteredAlunos.filter(a => a.acertos > 30 && a.acertos <= 50).length },
    { faixa: "51-70%", quantidade: filteredAlunos.filter(a => a.acertos > 50 && a.acertos <= 70).length },
    { faixa: "71-85%", quantidade: filteredAlunos.filter(a => a.acertos > 70 && a.acertos <= 85).length },
    { faixa: "86-100%", quantidade: filteredAlunos.filter(a => a.acertos > 85).length },
  ];

  const sortedAlunos = [...filteredAlunos].sort((a, b) => b.acertos - a.acertos);
  const sortedProfs = [...professores].sort((a, b) => b.mediaAcertos - a.mediaAcertos);
  const sortedEscolas = [...escolas].sort((a, b) => b.mediaAcertos - a.mediaAcertos);

  // Heatmap data
  const heatmapData = GENEROS.slice(0, 6).map(g => {
    const entry: any = { genero: g };
    [1, 2, 3, 4, 5].forEach(ano => {
      const alunosAno = filteredAlunos.filter(a => a.ano === ano);
      entry[`${ano}º`] = alunosAno.length ? Math.round(alunosAno.reduce((s, a) => s + (a.generos[g] || 0), 0) / alunosAno.length) : 0;
    });
    return entry;
  });

  if (!loaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto px-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[hsl(145,70%,42%)] via-[hsl(48,95%,50%)] to-[hsl(205,90%,48%)] flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={36} className="text-white" />
          </div>
          <h2 className="font-display text-3xl text-foreground mb-3">Dashboard Analítico</h2>
          <p className="text-muted-foreground font-semibold mb-8">
            Painel profissional com dados simulados de desempenho, rankings, habilidades BNCC e insights estratégicos.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLoaded(true)}
            className="btn-hero inline-flex items-center gap-2 px-8"
          >
            <Database size={20} />
            Carregar cenário completo
          </motion.button>
          <p className="text-xs text-muted-foreground mt-3">Simulação com dezenas de alunos, turmas, professores e escolas</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="container py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft size={20} />
              </button>
              <h2 className="font-display text-xl text-foreground">Dashboard Analítico</h2>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <select value={selectedAno} onChange={e => setSelectedAno(e.target.value)}
                className="text-xs bg-muted rounded-lg px-2 py-1.5 border-0 font-semibold text-foreground">
                <option value="">Todos os anos</option>
                {[1,2,3,4,5].map(a => <option key={a} value={a}>{a}º Ano</option>)}
              </select>
              <select value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}
                className="text-xs bg-muted rounded-lg px-2 py-1.5 border-0 font-semibold text-foreground">
                <option value="">Todas as escolas</option>
                {escolas.map(e => <option key={e.id} value={e.nome}>{e.nome.replace("E.M. ","")}</option>)}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                }`}>
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <AnimatePresence mode="wait">
          {/* ═══ MEU DESEMPENHO ═══ */}
          {activeTab === "meu" && (
            <motion.div key="meu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!user ? (
                <div className="text-center py-16">
                  <UserCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-display text-xl text-foreground mb-2">Faça login para ver seu desempenho</h3>
                  <p className="text-muted-foreground text-sm mb-4">Seus dados de atividades e progresso aparecerão aqui.</p>
                  <button onClick={() => navigate("/auth")} className="btn-hero px-6">Entrar</button>
                </div>
              ) : loadingMyData ? (
                <div className="text-center py-16">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando seus dados...</p>
                </div>
              ) : (
                <>
                  {/* User greeting */}
                  <div className="mb-6">
                    <h3 className="font-display text-2xl text-foreground">
                      Olá, {myProfile?.nome || profile?.nome || user.email?.split("@")[0]} 👋
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">Aqui está seu progresso pessoal</p>
                  </div>

                  {/* KPIs pessoais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <KpiCard icon={Star} label="XP Total" value={myProfile?.total_xp ?? profile?.total_xp ?? 0} color="bg-[hsl(48,95%,50%)]" delay={0} />
                    <KpiCard icon={BookOpen} label="Atividades Feitas" value={myActivities.length} color="bg-[hsl(205,90%,48%)]" delay={0.05} />
                    <KpiCard icon={Award} label={`Nível ${myProfile?.nivel ?? profile?.nivel ?? 1}`} value={`${myProfile?.total_xp ?? profile?.total_xp ?? 0}/${(myProfile?.nivel ?? profile?.nivel ?? 1) * 200} XP`} color="bg-[hsl(145,70%,42%)]" delay={0.1} />
                    <KpiCard icon={Target} label="Leituras Realizadas" value={myPerformance?.leitura_tentativas ?? 0} color="bg-[hsl(280,65%,55%)]" delay={0.15} />
                  </div>

                  {/* Performance por categoria */}
                  {myPerformance && (
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <ChartCard title="Desempenho por Categoria" subtitle="Seus acertos em cada área" delay={0.2}>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={[
                            {
                              categoria: "Interpretação",
                              acertos: myPerformance.interpretacao_acertos || 0,
                              total: myPerformance.interpretacao_total || 0,
                              taxa: myPerformance.interpretacao_total ? Math.round((myPerformance.interpretacao_acertos / myPerformance.interpretacao_total) * 100) : 0,
                            },
                            {
                              categoria: "Vocabulário",
                              acertos: myPerformance.vocabulario_acertos || 0,
                              total: myPerformance.vocabulario_total || 0,
                              taxa: myPerformance.vocabulario_total ? Math.round((myPerformance.vocabulario_acertos / myPerformance.vocabulario_total) * 100) : 0,
                            },
                            {
                              categoria: "Gramática",
                              acertos: myPerformance.gramatica_acertos || 0,
                              total: myPerformance.gramatica_total || 0,
                              taxa: myPerformance.gramatica_total ? Math.round((myPerformance.gramatica_acertos / myPerformance.gramatica_total) * 100) : 0,
                            },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="taxa" name="Taxa de Acerto %" radius={[8, 8, 0, 0]}>
                              {[0, 1, 2].map(i => (
                                <Cell key={i} fill={COLORS[i]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>

                      <ChartCard title="Radar de Competências" subtitle="Visão geral das suas habilidades" delay={0.25}>
                        <ResponsiveContainer width="100%" height={260}>
                          <RadarChart data={[
                            { hab: "Interpretação", valor: myPerformance.interpretacao_total ? Math.round((myPerformance.interpretacao_acertos / myPerformance.interpretacao_total) * 100) : 0 },
                            { hab: "Vocabulário", valor: myPerformance.vocabulario_total ? Math.round((myPerformance.vocabulario_acertos / myPerformance.vocabulario_total) * 100) : 0 },
                            { hab: "Gramática", valor: myPerformance.gramatica_total ? Math.round((myPerformance.gramatica_acertos / myPerformance.gramatica_total) * 100) : 0 },
                            { hab: "Leitura", valor: Math.min((myPerformance.leitura_tentativas || 0) * 10, 100) },
                          ]}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="hab" tick={{ fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="Seu Desempenho" dataKey="valor" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    </div>
                  )}

                  {/* Detalhes numéricos */}
                  {myPerformance && (
                    <ChartCard title="Detalhes por Categoria" subtitle="Acertos e total de exercícios" delay={0.3} className="mb-4">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "Interpretação", acertos: myPerformance.interpretacao_acertos || 0, total: myPerformance.interpretacao_total || 0, color: COLORS[0] },
                          { label: "Vocabulário", acertos: myPerformance.vocabulario_acertos || 0, total: myPerformance.vocabulario_total || 0, color: COLORS[1] },
                          { label: "Gramática", acertos: myPerformance.gramatica_acertos || 0, total: myPerformance.gramatica_total || 0, color: COLORS[2] },
                        ].map((cat, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                            className="text-center p-4 rounded-xl bg-muted/50">
                            <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-black text-lg"
                              style={{ background: cat.color }}>
                              {cat.total > 0 ? Math.round((cat.acertos / cat.total) * 100) : 0}%
                            </div>
                            <p className="text-sm font-bold text-foreground">{cat.label}</p>
                            <p className="text-xs text-muted-foreground">{cat.acertos}/{cat.total} acertos</p>
                          </motion.div>
                        ))}
                      </div>
                    </ChartCard>
                  )}

                  {/* Últimas atividades */}
                  <ChartCard title="Últimas Atividades" subtitle={`${myActivities.length} atividades registradas`} delay={0.35}>
                    {myActivities.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen size={32} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">Você ainda não completou nenhuma atividade.</p>
                        <button onClick={() => navigate("/")} className="btn-hero px-6 mt-4 text-sm">Começar Atividade</button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {myActivities.map((act, i) => {
                          const taxa = act.total_exercicios ? Math.round(((act.acertos || 0) / act.total_exercicios) * 100) : 0;
                          return (
                            <motion.div key={act.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black ${
                                taxa >= 70 ? "bg-[hsl(145,70%,42%)]" : taxa >= 40 ? "bg-[hsl(48,95%,50%)]" : "bg-[hsl(340,75%,55%)]"
                              }`}>
                                {taxa}%
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{act.titulo || act.subtema || act.tema}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {act.genero} · {act.ano} · {act.acertos}/{act.total_exercicios} acertos · {act.pontos} XP
                                </p>
                              </div>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {act.created_at ? new Date(act.created_at).toLocaleDateString("pt-BR") : ""}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </ChartCard>

                  {/* ═══ ANÁLISE PERSONALIZADA ═══ */}
                  {myPerformance && (() => {
                    const cats = [
                      { key: "interpretacao", label: "Interpretação de Texto", acertos: myPerformance.interpretacao_acertos || 0, total: myPerformance.interpretacao_total || 0 },
                      { key: "vocabulario", label: "Vocabulário", acertos: myPerformance.vocabulario_acertos || 0, total: myPerformance.vocabulario_total || 0 },
                      { key: "gramatica", label: "Gramática", acertos: myPerformance.gramatica_acertos || 0, total: myPerformance.gramatica_total || 0 },
                    ].map(c => ({ ...c, taxa: c.total > 0 ? Math.round((c.acertos / c.total) * 100) : -1 }));

                    const ativas = cats.filter(c => c.taxa >= 0);
                    const fortes = ativas.filter(c => c.taxa >= 70).sort((a, b) => b.taxa - a.taxa);
                    const medios = ativas.filter(c => c.taxa >= 40 && c.taxa < 70);
                    const fracos = ativas.filter(c => c.taxa < 40);
                    const totalGeral = ativas.length ? Math.round(ativas.reduce((s, c) => s + c.taxa, 0) / ativas.length) : 0;

                    return (
                      <>
                        {/* Pontos Fortes */}
                        <ChartCard title="💪 Seus Pontos Fortes" subtitle="Áreas em que você está se destacando" delay={0.4} className="mb-4">
                          {fortes.length > 0 ? (
                            <div className="space-y-3">
                              {fortes.map((c, i) => (
                                <motion.div key={c.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                                  className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                                  <div className="w-12 h-12 rounded-full bg-[hsl(145,70%,42%)] flex items-center justify-center text-white font-black text-sm">{c.taxa}%</div>
                                  <div>
                                    <p className="font-bold text-foreground">{c.label}</p>
                                    <p className="text-xs text-muted-foreground">{c.acertos} de {c.total} exercícios corretos — Excelente desempenho!</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              {ativas.length === 0 ? "Complete atividades para descobrir seus pontos fortes!" : "Continue praticando para consolidar seus pontos fortes. Você está no caminho certo!"}
                            </p>
                          )}
                        </ChartCard>

                        {/* O que Melhorar */}
                        <ChartCard title="🎯 Pontos a Desenvolver" subtitle="Áreas que precisam de mais atenção" delay={0.45} className="mb-4">
                          {(fracos.length > 0 || medios.length > 0) ? (
                            <div className="space-y-3">
                              {fracos.map((c, i) => (
                                <motion.div key={c.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
                                  className="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-200/50">
                                  <div className="w-12 h-12 rounded-full bg-[hsl(340,75%,55%)] flex items-center justify-center text-white font-black text-sm">{c.taxa}%</div>
                                  <div>
                                    <p className="font-bold text-foreground">{c.label} <span className="text-xs font-semibold text-red-500 ml-1">Prioridade</span></p>
                                    <p className="text-xs text-muted-foreground">
                                      {c.key === "interpretacao" && "Pratique leitura ativa: releia trechos, identifique a ideia central e as intenções do autor."}
                                      {c.key === "vocabulario" && "Amplie seu repertório lendo textos variados. Anote palavras novas e revise-as periodicamente."}
                                      {c.key === "gramatica" && "Foque em regras de concordância e pontuação. Pratique exercícios de reescrita e análise de frases."}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                              {medios.map((c, i) => (
                                <motion.div key={c.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                                  className="flex items-center gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200/50">
                                  <div className="w-12 h-12 rounded-full bg-[hsl(48,95%,50%)] flex items-center justify-center text-white font-black text-sm">{c.taxa}%</div>
                                  <div>
                                    <p className="font-bold text-foreground">{c.label} <span className="text-xs font-semibold text-amber-600 ml-1">Em progresso</span></p>
                                    <p className="text-xs text-muted-foreground">
                                      {c.key === "interpretacao" && "Você está progredindo! Tente identificar informações implícitas e compare diferentes pontos de vista nos textos."}
                                      {c.key === "vocabulario" && "Bom progresso! Agora trabalhe palavras por campo semântico e use-as em frases próprias para fixar."}
                                      {c.key === "gramatica" && "Bom avanço! Pratique análise sintática e atenção à coesão textual para subir de nível."}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              {ativas.length === 0 ? "Complete atividades para receber orientações personalizadas!" : "Parabéns! Todas as suas áreas estão com desempenho excelente. Continue assim! 🎉"}
                            </p>
                          )}
                        </ChartCard>

                        {/* Recomendações */}
                        <ChartCard title="📋 Recomendações Personalizadas" subtitle="O que fazer a seguir para evoluir" delay={0.5} className="mb-4">
                          <div className="space-y-2">
                            {ativas.length === 0 ? (
                              <div className="text-center py-6">
                                <Sparkles size={28} className="mx-auto text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Faça sua primeira atividade para receber recomendações personalizadas!</p>
                              </div>
                            ) : (
                              <>
                                {myActivities.length < 5 && (
                                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-200/50">
                                    <Zap size={18} className="text-[hsl(205,90%,48%)] mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground"><span className="font-bold">Pratique mais:</span> com {myActivities.length} atividades, você ainda está no início. Quanto mais praticar, mais precisa será a análise do seu desempenho.</p>
                                  </div>
                                )}
                                {fracos.length > 0 && (
                                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/50 border border-red-200/50">
                                    <AlertTriangle size={18} className="text-[hsl(340,75%,55%)] mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground"><span className="font-bold">Foco em {fracos[0].label}:</span> esta é sua área com maior dificuldade. Dedique 2-3 atividades focadas neste tema antes de avançar.</p>
                                  </div>
                                )}
                                {(myPerformance.leitura_tentativas || 0) < 3 && (
                                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-200/50">
                                    <BookOpen size={18} className="text-[hsl(280,65%,55%)] mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground"><span className="font-bold">Leia mais:</span> a leitura é a base de todas as competências linguísticas. Use o gravador de leitura para praticar fluência e compreensão.</p>
                                  </div>
                                )}
                                {totalGeral >= 70 && (
                                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                                    <Trophy size={18} className="text-[hsl(145,70%,42%)] mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground"><span className="font-bold">Excelente desempenho!</span> Tente atividades de anos mais avançados para continuar se desafiando e crescendo.</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </ChartCard>

                        {/* Base Científica Personalizada */}
                        <ChartCard title="📚 Embasamento Científico Personalizado" subtitle={`Análise baseada no seu perfil — ${myActivities.length} atividades realizadas`} delay={0.55} className="mb-4">
                          <div className="space-y-4">
                            {/* Contextualização personalizada */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                              className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                              <p className="text-xs text-foreground leading-relaxed">
                                <span className="font-black text-primary">📊 Seu Perfil de Aprendizagem:</span>{" "}
                                {myProfile?.nome || profile?.nome || "Aluno"}, com base nas suas {myActivities.length} atividades completadas, 
                                {fortes.length > 0
                                  ? ` você demonstra força em ${fortes.map(c => c.label).join(" e ")} (${fortes.map(c => c.taxa + "%").join(" e ")} de acerto).`
                                  : " você está construindo sua base de conhecimento."
                                }
                                {fracos.length > 0
                                  ? ` Sua principal área para desenvolvimento é ${fracos[0].label} (${fracos[0].taxa}% de acerto), que merece atenção especial.`
                                  : medios.length > 0
                                    ? ` ${medios[0].label} (${medios[0].taxa}%) está em progresso e pode ser consolidada com mais prática.`
                                    : ""
                                }
                                {" "}Seu nível atual é {myProfile?.nivel ?? profile?.nivel ?? 1} com {myProfile?.total_xp ?? profile?.total_xp ?? 0} XP — próximo nível em {((myProfile?.nivel ?? profile?.nivel ?? 1) * 200) - (myProfile?.total_xp ?? profile?.total_xp ?? 0)} XP.
                              </p>
                            </motion.div>

                            {/* Referências condicionais baseadas nas necessidades do aluno */}
                            {(fracos.some(c => c.key === "interpretacao") || medios.some(c => c.key === "interpretacao")) && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                                className="p-4 rounded-xl bg-muted/30 border border-border">
                                <p className="text-xs text-foreground leading-relaxed">
                                  <span className="font-black text-primary">🎯 Para sua Interpretação ({ativas.find(c => c.key === "interpretacao")?.taxa ?? 0}%):</span> Segundo <span className="font-bold">Solé (1998)</span>, a leitura é um processo interativo. No seu caso, pratique reler trechos-chave, identificar a ideia central e fazer inferências antes de responder. Estratégias metacognitivas como "o que o autor quis dizer?" ajudam a subir rapidamente.
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-2 italic">SOLÉ, Isabel. <em>Estratégias de Leitura</em>. Porto Alegre: Artmed, 1998.</p>
                              </motion.div>
                            )}

                            {(fracos.some(c => c.key === "vocabulario") || medios.some(c => c.key === "vocabulario")) && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                                className="p-4 rounded-xl bg-muted/30 border border-border">
                                <p className="text-xs text-foreground leading-relaxed">
                                  <span className="font-black text-primary">📖 Para seu Vocabulário ({ativas.find(c => c.key === "vocabulario")?.taxa ?? 0}%):</span> <span className="font-bold">Kleiman (2013)</span> mostra que vocabulário se aprende melhor no contexto. Como você praticou gêneros como {(myPerformance?.generos_recentes as string[] || []).slice(0, 2).join(" e ") || "textos variados"}, tente anotar palavras novas e criar frases com elas para fixação.
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-2 italic">KLEIMAN, Angela. <em>Oficina de Leitura: Teoria e Prática</em>. 15ª ed. Campinas: Pontes, 2013.</p>
                              </motion.div>
                            )}

                            {(fracos.some(c => c.key === "gramatica") || medios.some(c => c.key === "gramatica")) && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                                className="p-4 rounded-xl bg-muted/30 border border-border">
                                <p className="text-xs text-foreground leading-relaxed">
                                  <span className="font-black text-primary">✍️ Para sua Gramática ({ativas.find(c => c.key === "gramatica")?.taxa ?? 0}%):</span> <span className="font-bold">Travaglia (2009)</span> defende gramática contextualizada. Com {myPerformance?.gramatica_total || 0} exercícios de gramática feitos, foque em entender regras dentro dos textos que lê, não de forma isolada. Reescreva trechos com suas palavras para praticar.
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-2 italic">TRAVAGLIA, Luiz Carlos. <em>Gramática e Interação</em>. 14ª ed. São Paulo: Cortez, 2009.</p>
                              </motion.div>
                            )}

                            {fortes.length > 0 && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                                className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200/30">
                                <p className="text-xs text-foreground leading-relaxed">
                                  <span className="font-black text-[hsl(145,70%,42%)]">🏆 Zona de Excelência:</span> <span className="font-bold">Vygotsky (1984)</span> mostra que o aprendizado ideal ocorre na Zona de Desenvolvimento Proximal. Com {fortes.map(c => c.label).join(" e ")} acima de 70%, você pode avançar para desafios do {parseInt(myProfile?.ano_escolar || profile?.ano_escolar || "3") + 1}º ano nessas áreas.
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-2 italic">VYGOTSKY, L.S. <em>A Formação Social da Mente</em>. São Paulo: Martins Fontes, 1984.</p>
                              </motion.div>
                            )}

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
                              className="p-4 rounded-xl bg-muted/30 border border-border">
                              <p className="text-xs text-foreground leading-relaxed">
                                <span className="font-black text-primary">🎮 Sobre seu Engajamento:</span> <span className="font-bold">Deterding et al. (2011)</span> e <span className="font-bold">Perrenoud (1999)</span> mostram que XP, níveis e feedback contínuo aumentam a motivação. Você está no nível {myProfile?.nivel ?? profile?.nivel ?? 1} — {(myProfile?.nivel ?? profile?.nivel ?? 1) < 2 ? "complete mais atividades para subir de nível e desbloquear seu potencial!" : "seu progresso constante é a chave para a excelência!"}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-2 italic">DETERDING, S. et al. "From Game Design Elements to Gamefulness." MindTrek, 2011. | PERRENOUD, P. <em>Avaliação</em>. Artmed, 1999.</p>
                            </motion.div>
                          </div>
                        </ChartCard>
                      </>
                    );
                  })()}
                </>
              )}
            </motion.div>
          )}

          {/* ═══ VISÃO GERAL ═══ */}
          {activeTab === "geral" && (
            <motion.div key="geral" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <KpiCard icon={Users} label="Total de Alunos" value={filteredAlunos.length} color="bg-[hsl(205,90%,48%)]" change={12} delay={0} />
                <KpiCard icon={GraduationCap} label="Professores" value={professores.length} color="bg-[hsl(145,70%,42%)]" delay={0.05} />
                <KpiCard icon={School} label="Escolas" value={escolas.length} color="bg-[hsl(280,65%,55%)]" delay={0.1} />
                <KpiCard icon={Target} label="Média de Acertos" value={mediaAcertos} suffix="%" change={mediaEvolucao} color="bg-[hsl(145,70%,42%)]" delay={0.15} />
                <KpiCard icon={Activity} label="Engajamento" value={mediaEngajamento} suffix="%" change={5.2} color="bg-[hsl(48,95%,50%)]" delay={0.2} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <KpiCard icon={BookOpen} label="Atividades Concluídas" value={totalAtividades} change={8} color="bg-[hsl(205,90%,48%)]" delay={0.25} />
                <KpiCard icon={Brain} label="Habilidades Dominadas" value={habDominadas} color="bg-[hsl(145,70%,42%)]" delay={0.3} />
                <KpiCard icon={AlertTriangle} label="Habilidades Críticas" value={habCriticas} color="bg-[hsl(340,75%,55%)]" delay={0.35} />
                <KpiCard icon={Zap} label="Taxa de Evolução" value={mediaEvolucao} suffix="%" change={mediaEvolucao} color="bg-[hsl(25,90%,55%)]" delay={0.4} />
              </div>

              {/* Charts Row 1 */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Evolução Mensal" subtitle="Acertos médios e atividades ao longo do ano" delay={0.3}>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={evolucaoMensal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="right" dataKey="atividades" fill={COLORS[2]} name="Atividades" radius={[4, 4, 0, 0]} opacity={0.7} />
                      <Line yAxisId="left" type="monotone" dataKey="acertos" stroke={COLORS[0]} name="Acertos %" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Desempenho por Habilidade BNCC" subtitle="Média de acertos por habilidade" delay={0.35}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={habChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="habilidade" type="category" width={120} tick={{ fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="media" name="Média %" radius={[0, 6, 6, 0]}>
                        {habChartData.map((_, i) => (
                          <Cell key={i} fill={habChartData[i].media < 50 ? "hsl(340,75%,55%)" : habChartData[i].media < 70 ? "hsl(48,95%,50%)" : "hsl(145,70%,42%)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Charts Row 2 */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <ChartCard title="Distribuição de Desempenho" delay={0.4}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={distribuicaoDesempenho} dataKey="quantidade" nameKey="faixa" cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {distribuicaoDesempenho.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Desempenho por Gênero Textual" delay={0.45}>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={generoChartData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="genero" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar name="Média" dataKey="media" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Engajamento vs Desempenho" delay={0.5}>
                  <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="engajamento" name="Engajamento" tick={{ fontSize: 10 }} unit="%" />
                      <YAxis dataKey="acertos" name="Acertos" tick={{ fontSize: 10 }} unit="%" />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={engajamentoVsDesempenho.slice(0, 50)} fill={COLORS[2]} fillOpacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Comparativo Escolas */}
              <ChartCard title="Comparativo entre Escolas" subtitle="Média de acertos, evolução e engajamento" delay={0.55} className="mb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={escolaCompData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="escola" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="media" name="Média Acertos %" fill={COLORS[0]} radius={[6, 6, 0, 0]} opacity={0.85} />
                    <Bar dataKey="engajamento" name="Engajamento %" fill={COLORS[2]} radius={[6, 6, 0, 0]} opacity={0.6} />
                    <Line type="monotone" dataKey="evolucao" name="Evolução %" stroke={COLORS[3]} strokeWidth={3} dot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Top Insights */}
              <ChartCard title="Insights Automáticos" subtitle="Análise inteligente dos dados" delay={0.6}>
                <div className="grid md:grid-cols-2 gap-3">
                  {insights.slice(0, 4).map((ins, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-xl border-l-4 ${
                        ins.tipo === "alerta" ? "bg-red-50/50 border-red-400" :
                        ins.tipo === "destaque" ? "bg-emerald-50/50 border-emerald-400" :
                        ins.tipo === "tendencia" ? "bg-blue-50/50 border-blue-400" :
                        "bg-amber-50/50 border-amber-400"
                      }`}>
                      <span className="text-lg mr-2">{ins.icone}</span>
                      <span className="text-xs font-semibold text-foreground leading-relaxed">{ins.texto}</span>
                    </motion.div>
                  ))}
                </div>
              </ChartCard>
            </motion.div>
          )}

          {/* ═══ ALUNOS ═══ */}
          {activeTab === "alunos" && (
            <motion.div key="alunos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Evolução dos Alunos" subtitle="Média de acertos mensais">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={evolucaoMensal}>
                      <defs>
                        <linearGradient id="gradAcertos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="acertos" stroke={COLORS[0]} fill="url(#gradAcertos)" strokeWidth={3} name="Acertos %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Competências dos Alunos" subtitle="Radar de habilidades médias">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={habChartData.slice(0, 8)}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="habilidade" tick={{ fontSize: 8 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar name="Média" dataKey="media" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Desempenho por Tema" subtitle="Acertos médios por área do conhecimento">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={temaChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="tema" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="media" name="Média %" radius={[8, 8, 0, 0]}>
                        {temaChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Engajamento vs Desempenho" subtitle="Correlação entre uso e performance">
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="engajamento" name="Engajamento" unit="%" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="acertos" name="Acertos" unit="%" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={engajamentoVsDesempenho} fill={COLORS[0]} fillOpacity={0.5} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Top / Bottom alunos */}
              <div className="grid md:grid-cols-2 gap-4">
                <ChartCard title="🌟 Top 10 Alunos">
                  {sortedAlunos.slice(0, 10).map((a, i) => (
                    <RankRow key={a.id} pos={i + 1} name={a.nome} value={a.acertos} max={100}
                      label2={`${a.turma} · ${a.escola.replace("E.M. ","")}`} delay={i * 0.03} />
                  ))}
                </ChartCard>
                <ChartCard title="⚠️ Alunos que Precisam de Atenção">
                  {sortedAlunos.slice(-10).reverse().map((a, i) => (
                    <RankRow key={a.id} pos={sortedAlunos.length - 9 + i} name={a.nome} value={a.acertos} max={100}
                      label2={`${a.turma} · ${a.professor}`} delay={i * 0.03} />
                  ))}
                </ChartCard>
              </div>
            </motion.div>
          )}

          {/* ═══ PROFESSORES ═══ */}
          {activeTab === "professores" && (
            <motion.div key="profs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Média por Professor" subtitle="Acertos médios e alunos em risco">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={profCompData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="professor" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="media" name="Média Acertos %" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="risco" name="Alunos em Risco" fill={COLORS[3]} radius={[6, 6, 0, 0]} opacity={0.7} />
                      <Line type="monotone" dataKey="evolucao" name="Evolução %" stroke={COLORS[2]} strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Evolução por Professor" subtitle="Crescimento no período">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={profCompData.sort((a, b) => b.evolucao - a.evolucao)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="professor" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="evolucao" name="Evolução %" radius={[8, 8, 0, 0]}>
                        {profCompData.map((d, i) => (
                          <Cell key={i} fill={d.evolucao >= 0 ? COLORS[0] : COLORS[3]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard title="Ranking de Professores">
                {sortedProfs.map((p, i) => (
                  <RankRow key={p.id} pos={i + 1} name={p.nome} value={p.mediaAcertos} max={100}
                    label2={`${p.escola.replace("E.M. ","")} · ${p.totalAlunos} alunos · ${p.turmas.length} turmas`} delay={i * 0.04} />
                ))}
              </ChartCard>
            </motion.div>
          )}

          {/* ═══ ESCOLAS ═══ */}
          {activeTab === "escolas" && (
            <motion.div key="escolas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Comparativo entre Escolas" subtitle="Média de acertos e engajamento">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={escolaCompData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="escola" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="media" name="Média %" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="engajamento" name="Engajamento %" fill={COLORS[2]} radius={[6, 6, 0, 0]} opacity={0.6} />
                      <Line type="monotone" dataKey="evolucao" name="Evolução %" stroke={COLORS[1]} strokeWidth={3} dot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Distribuição de Desempenho por Escola">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={escolas.map(e => ({ name: e.nome.replace("E.M. ", ""), value: e.mediaAcertos }))}
                        dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                        {escolas.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard title="Ranking de Escolas">
                {sortedEscolas.map((e, i) => (
                  <RankRow key={e.id} pos={i + 1} name={e.nome} value={e.mediaAcertos} max={100}
                    label2={`${e.totalAlunos} alunos · ${e.totalProfessores} professores · Engaj. ${e.engajamento}%`} delay={i * 0.05} />
                ))}
              </ChartCard>
            </motion.div>
          )}

          {/* ═══ RANKINGS ═══ */}
          {activeTab === "rankings" && (
            <motion.div key="rankings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4">
                <ChartCard title="🏆 Ranking de Alunos" subtitle="Top 15 por acertos">
                  {sortedAlunos.slice(0, 15).map((a, i) => (
                    <RankRow key={a.id} pos={i + 1} name={a.nome} value={a.acertos} max={100}
                      label2={`${a.turma} · ${a.xp} XP`} delay={i * 0.03} />
                  ))}
                </ChartCard>
                <ChartCard title="🎓 Ranking de Professores">
                  {sortedProfs.map((p, i) => (
                    <RankRow key={p.id} pos={i + 1} name={p.nome} value={p.mediaAcertos} max={100}
                      label2={`Evolução: ${p.evolucao >= 0 ? "+" : ""}${p.evolucao}%`} delay={i * 0.04} />
                  ))}
                </ChartCard>
                <ChartCard title="🏫 Ranking de Escolas">
                  {sortedEscolas.map((e, i) => (
                    <RankRow key={e.id} pos={i + 1} name={e.nome} value={e.mediaAcertos} max={100}
                      label2={`${e.totalAlunos} alunos · Crescimento: ${e.evolucao >= 0 ? "+" : ""}${e.evolucao}%`} delay={i * 0.05} />
                  ))}
                </ChartCard>
                <ChartCard title="📊 Ranking por Turma">
                  {(() => {
                    const turmaMap: Record<string, { total: number; count: number; escola: string }> = {};
                    filteredAlunos.forEach(a => {
                      if (!turmaMap[a.turma]) turmaMap[a.turma] = { total: 0, count: 0, escola: a.escola };
                      turmaMap[a.turma].total += a.acertos;
                      turmaMap[a.turma].count++;
                    });
                    return Object.entries(turmaMap)
                      .map(([t, v]) => ({ turma: t, media: Math.round(v.total / v.count), escola: v.escola }))
                      .sort((a, b) => b.media - a.media)
                      .slice(0, 15)
                      .map((t, i) => (
                        <RankRow key={t.turma} pos={i + 1} name={t.turma} value={t.media} max={100}
                          label2={t.escola.replace("E.M. ", "")} delay={i * 0.03} />
                      ));
                  })()}
                </ChartCard>
              </div>
            </motion.div>
          )}

          {/* ═══ HABILIDADES BNCC ═══ */}
          {activeTab === "habilidades" && (
            <motion.div key="hab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Desempenho por Habilidade" subtitle="Média de acertos por habilidade BNCC">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={habChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="habilidade" type="category" width={130} tick={{ fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="media" name="Média %" radius={[0, 8, 8, 0]}>
                        {habChartData.map((d, i) => (
                          <Cell key={i} fill={d.media < 50 ? "hsl(340,75%,55%)" : d.media < 70 ? "hsl(48,95%,50%)" : "hsl(145,70%,42%)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Radar de Competências" subtitle="Visão geral das habilidades">
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={habChartData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="habilidade" tick={{ fontSize: 8 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar name="Média" dataKey="media" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Heatmap - Gênero x Ano */}
              <ChartCard title="Mapa de Calor: Gênero Textual × Ano Escolar" subtitle="Média de acertos por combinação">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left p-2 font-bold text-foreground">Gênero</th>
                        {[1,2,3,4,5].map(a => <th key={a} className="p-2 font-bold text-foreground text-center">{a}º Ano</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 font-semibold text-foreground">{row.genero}</td>
                          {[1,2,3,4,5].map(a => {
                            const val = row[`${a}º`] || 0;
                            const bg = val < 40 ? "bg-red-100 text-red-700" : val < 60 ? "bg-amber-100 text-amber-700" : val < 80 ? "bg-emerald-100 text-emerald-700" : "bg-emerald-200 text-emerald-800";
                            return (
                              <td key={a} className={`p-2 text-center font-bold rounded-lg ${bg}`}>
                                {val > 0 ? `${val}%` : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </motion.div>
          )}

          {/* ═══ INSIGHTS ═══ */}
          {activeTab === "insights" && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4">
                {insights.map((ins, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -6px hsl(var(--primary)/0.15)" }}
                    className={`bg-card rounded-2xl border p-6 transition-shadow cursor-default border-l-4 ${
                      ins.tipo === "alerta" ? "border-l-red-400" :
                      ins.tipo === "destaque" ? "border-l-emerald-400" :
                      ins.tipo === "tendencia" ? "border-l-blue-400" :
                      "border-l-amber-400"
                    }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{ins.icone}</span>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          ins.tipo === "alerta" ? "bg-red-100 text-red-600" :
                          ins.tipo === "destaque" ? "bg-emerald-100 text-emerald-600" :
                          ins.tipo === "tendencia" ? "bg-blue-100 text-blue-600" :
                          "bg-amber-100 text-amber-600"
                        }`}>{ins.tipo}</span>
                        <p className="text-sm font-semibold text-foreground mt-2 leading-relaxed">{ins.texto}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
