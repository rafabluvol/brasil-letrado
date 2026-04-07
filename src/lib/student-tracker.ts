// ============================================================
// Student Tracker — Supabase + localStorage persistence
// ============================================================

import { supabase } from "@/integrations/supabase/client";
import { calculateLevelFromXp } from "@/lib/level-system";

export interface StudentPerformance {
  interpretacao: { acertos: number; total: number };
  vocabulario: { acertos: number; total: number };
  gramatica: { acertos: number; total: number };
  leitura: { tentativas: number };
}

export interface ErroFrequente {
  categoria: string;
  habilidade_bncc: string;
  count: number;
  ultimaVez: string;
}

export interface StudentData {
  aluno_id: string;
  ano: string;
  performance: StudentPerformance;
  erros_frequentes: ErroFrequente[];
  subtemas_recentes: string[];
  generos_recentes: string[];
  temas_recentes: string[];
  total_atividades: number;
  total_xp: number;
  ultima_atividade: string | null;
}

const STORAGE_KEY = "sabia_student_data";
const MAX_RECENTES = 10;

function generateId(): string {
  return "aluno_" + Math.random().toString(36).substring(2, 10);
}

export function getStudentData(): StudentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createDefaultStudent();
}

function createDefaultStudent(): StudentData {
  const data: StudentData = {
    aluno_id: generateId(),
    ano: "",
    performance: {
      interpretacao: { acertos: 0, total: 0 },
      vocabulario: { acertos: 0, total: 0 },
      gramatica: { acertos: 0, total: 0 },
      leitura: { tentativas: 0 },
    },
    erros_frequentes: [],
    subtemas_recentes: [],
    generos_recentes: [],
    temas_recentes: [],
    total_atividades: 0,
    total_xp: 0,
    ultima_atividade: null,
  };
  saveStudentData(data);
  return data;
}

export function saveStudentData(data: StudentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export interface ActivityResult {
  ano: string;
  genero: string;
  tema: string;
  subtema?: string;
  habilidade_bncc: string;
  titulo?: string;
  exercicios: {
    categoria: string;
    acertou: boolean;
    habilidade_bncc?: string;
  }[];
  xp: number;
  leitura_realizada: boolean;
}

export async function trackActivityResult(result: ActivityResult): Promise<StudentData> {
  const data = getStudentData();

  // Update ano
  data.ano = result.ano;

  // Update performance by category
  for (const ex of result.exercicios) {
    const cat = ex.categoria as keyof Omit<StudentPerformance, "leitura">;
    if (data.performance[cat]) {
      data.performance[cat].total += 1;
      if (ex.acertou) data.performance[cat].acertos += 1;
    }

    // Track errors
    if (!ex.acertou) {
      const hab = ex.habilidade_bncc || result.habilidade_bncc;
      const existing = data.erros_frequentes.find(
        (e) => e.categoria === ex.categoria && e.habilidade_bncc === hab
      );
      if (existing) {
        existing.count += 1;
        existing.ultimaVez = new Date().toISOString();
      } else {
        data.erros_frequentes.push({
          categoria: ex.categoria,
          habilidade_bncc: hab,
          count: 1,
          ultimaVez: new Date().toISOString(),
        });
      }
    }
  }

  // Track reading attempts
  if (result.leitura_realizada) {
    data.performance.leitura.tentativas += 1;
  }

  // Update recentes (FIFO)
  if (result.subtema) {
    data.subtemas_recentes = [result.subtema, ...data.subtemas_recentes].slice(0, MAX_RECENTES);
  }
  data.generos_recentes = [result.genero, ...data.generos_recentes].slice(0, MAX_RECENTES);
  data.temas_recentes = [result.tema, ...data.temas_recentes].slice(0, MAX_RECENTES);

  // Counters
  data.total_atividades += 1;
  data.total_xp += result.xp;
  data.ultima_atividade = new Date().toISOString();

  // Sort errors by frequency
  data.erros_frequentes.sort((a, b) => b.count - a.count);
  data.erros_frequentes = data.erros_frequentes.slice(0, 20);

  saveStudentData(data);

  // ─── Persist to Supabase (if logged in) ───
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const acertos = result.exercicios.filter(e => e.acertou).length;
      const totalEx = result.exercicios.length;

      // 1. Save activity_results
      await supabase.from("activity_results").insert({
        user_id: user.id,
        ano: result.ano,
        genero: result.genero,
        tema: result.tema,
        subtema: result.subtema || null,
        habilidade_bncc: result.habilidade_bncc || null,
        titulo: result.titulo || result.subtema || null,
        acertos,
        total_exercicios: totalEx,
        pontos: result.xp,
        leitura_realizada: result.leitura_realizada,
        exercicio_results: result.exercicios as any,
      });

      // 2. Update profiles (XP + atividades)
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, total_atividades, nivel")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const newXp = (profile.total_xp || 0) + result.xp;
        const newAtividades = (profile.total_atividades || 0) + 1;
        const newNivel = calculateLevel(newXp);

        await supabase
          .from("profiles")
          .update({
            total_xp: newXp,
            total_atividades: newAtividades,
            nivel: newNivel,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }

      // 3. Update student_performance
      const { data: perf } = await supabase
        .from("student_performance")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (perf) {
        const updates: Record<string, any> = {
          updated_at: new Date().toISOString(),
          leitura_tentativas: (perf.leitura_tentativas || 0) + (result.leitura_realizada ? 1 : 0),
          erros_frequentes: data.erros_frequentes as any,
          subtemas_recentes: data.subtemas_recentes as any,
          generos_recentes: data.generos_recentes as any,
          temas_recentes: data.temas_recentes as any,
        };

        // Increment category-specific counters
        for (const ex of result.exercicios) {
          const cat = ex.categoria;
          if (cat === "interpretacao" || cat === "vocabulario" || cat === "gramatica") {
            updates[`${cat}_total`] = (perf[`${cat}_total` as keyof typeof perf] as number || 0) + 1;
            if (ex.acertou) {
              updates[`${cat}_acertos`] = (perf[`${cat}_acertos` as keyof typeof perf] as number || 0) + 1;
            }
          }
        }

        await supabase
          .from("student_performance")
          .update(updates)
          .eq("user_id", user.id);
      }
    }
  } catch (err) {
    console.error("Erro ao salvar no banco:", err);
    // localStorage fallback already saved above
  }

  return data;
}

// ============================================================
// Level calculation (matches Header.tsx logic)
// ============================================================

function calculateLevel(xp: number): number {
  return calculateLevelFromXp(xp);
}

// ============================================================
// Performance Analysis Helpers
// ============================================================

export function getAccuracyRate(perf: { acertos: number; total: number }): number {
  if (perf.total === 0) return 0;
  return Math.round((perf.acertos / perf.total) * 100);
}

export function getOverallAccuracy(data: StudentData): number {
  const total =
    data.performance.interpretacao.total +
    data.performance.vocabulario.total +
    data.performance.gramatica.total;
  const acertos =
    data.performance.interpretacao.acertos +
    data.performance.vocabulario.acertos +
    data.performance.gramatica.acertos;
  if (total === 0) return 0;
  return Math.round((acertos / total) * 100);
}

export function getWeakestCategory(data: StudentData): string {
  const categories = [
    { name: "interpretacao", rate: getAccuracyRate(data.performance.interpretacao) },
    { name: "vocabulario", rate: getAccuracyRate(data.performance.vocabulario) },
    { name: "gramatica", rate: getAccuracyRate(data.performance.gramatica) },
  ].filter((c) => {
    const perf = data.performance[c.name as keyof Omit<StudentPerformance, "leitura">];
    return perf.total > 0;
  });

  if (categories.length === 0) return "interpretacao";
  categories.sort((a, b) => a.rate - b.rate);
  return categories[0].name;
}

export function getStudentLevel(data: StudentData): number {
  if (data.total_xp < 100) return 1;
  if (data.total_xp < 300) return 2;
  if (data.total_xp < 600) return 3;
  if (data.total_xp < 1000) return 4;
  if (data.total_xp < 1500) return 5;
  return Math.min(10, 5 + Math.floor((data.total_xp - 1500) / 500));
}
