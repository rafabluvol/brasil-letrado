// ============================================================
// Motor de Recomendação do Tutor IA
// ============================================================

import {
  StudentData,
  getAccuracyRate,
  getWeakestCategory,
  getOverallAccuracy,
  getStudentLevel,
} from "./student-tracker";
import {
  getSubtemaAleatorio,
  getVariacaoAleatoria,
  SubtemaBNCC,
} from "@/data/bncc-subtemas";
import { GENEROS_POR_ANO } from "@/data/bncc-content";
import {
  getHabilidadesPorMateria,
  getHabilidadeByCodigo,
  getLabelAlternativo,
  HabilidadeBNCC,
} from "@/data/bncc-habilidades";

export interface Recomendacao {
  tema: string;
  materia: string;
  subtema: string;
  subtema_display: string;
  genero_textual: string;
  motivo: string;
  habilidades_bncc: string[];
  habilidade_detalhes?: {
    codigo: string;
    label: string;
    nivel: string;
    exercicios_ideais: string[];
  };
}

export interface TutorInsight {
  tipo: "incentivo" | "dica" | "alerta" | "sugestao";
  texto: string;
}

// ============================================================
// DIFFICULTY → CONTENT TYPE MAPPING
// ============================================================

const DIFICULDADE_PARA_GENERO: Record<string, Record<string, string[]>> = {
  interpretacao: {
    "1": ["Parlendas", "Cantigas"],
    "2": ["Histórias curtas", "Cantigas"],
    "3": ["Fábulas", "Contos de fadas"],
    "4": ["Contos", "Fábulas"],
    "5": ["Crônicas", "Contos"],
  },
  vocabulario: {
    "1": ["Listas", "Bilhetes"],
    "2": ["Bilhetes", "Convites"],
    "3": ["Receitas", "Cartas"],
    "4": ["Notícias", "Diários"],
    "5": ["Reportagens", "Artigos de opinião"],
  },
  gramatica: {
    "1": ["Trava-línguas", "Parlendas"],
    "2": ["Parlendas", "Histórias curtas"],
    "3": ["Histórias em quadrinhos", "Cartas"],
    "4": ["Poemas", "Notícias"],
    "5": ["Poemas", "Reportagens"],
  },
};

// ============================================================
// TEMA MAPPING based on weakness
// ============================================================

function selectTemaForWeakness(
  weakCategory: string,
  errosFrequentes: { categoria: string; habilidade_bncc: string; count: number }[],
  temasRecentes: string[]
): string {
  // If errors cluster around specific BNCC codes, map to appropriate tema
  const errosDaCategoria = errosFrequentes.filter((e) => e.categoria === weakCategory);

  // Check if errors relate to specific themes via habilidade codes
  for (const erro of errosDaCategoria) {
    const code = erro.habilidade_bncc.toUpperCase();
    if (code.includes("GE")) return "geografia";
    if (code.includes("HI")) return "historia";
    if (code.includes("CI")) return "ciencias";
  }

  // Otherwise, pick a tema not recently used
  const allTemas = ["portugues", "geografia", "historia", "ciencias", "atualidades", "inteligencia-artificial"];
  const lessUsed = allTemas.filter((t) => !temasRecentes.slice(0, 3).includes(t));
  if (lessUsed.length > 0) return lessUsed[Math.floor(Math.random() * lessUsed.length)];
  return allTemas[Math.floor(Math.random() * allTemas.length)];
}

// ============================================================
// MAIN RECOMMENDATION ENGINE
// ============================================================

export function generateRecomendacao(data: StudentData): Recomendacao | null {
  const ano = data.ano || "3";

  // 1. Analyze performance
  const weakest = getWeakestCategory(data);
  const overallRate = getOverallAccuracy(data);

  // 2. Select tema based on weakness
  const tema = selectTemaForWeakness(weakest, data.erros_frequentes, data.temas_recentes);

  // 3. Select subtema avoiding recent ones
  const subtema = getSubtemaAleatorio(ano, tema, data.subtemas_recentes);
  if (!subtema) return null;

  const subtemaDisplay = getVariacaoAleatoria(subtema);

  // 4. Select genre based on weakness + year
  const generoPool =
    DIFICULDADE_PARA_GENERO[weakest]?.[ano] ||
    GENEROS_POR_ANO[ano] ||
    ["Fábulas"];

  // Avoid recent genres
  let genero = generoPool.find((g) => !data.generos_recentes.slice(0, 2).includes(g));
  if (!genero) genero = generoPool[Math.floor(Math.random() * generoPool.length)];

  // 5. Generate motive
  const MOTIVOS: Record<string, string> = {
    interpretacao: "reforçar interpretação e compreensão textual",
    vocabulario: "ampliar vocabulário e compreensão de contexto",
    gramatica: "praticar gramática contextualizada no texto",
  };

  const motivo = overallRate > 80
    ? `avançar nos estudos e explorar ${subtemaDisplay}`
    : `${MOTIVOS[weakest]} com o tema ${subtemaDisplay}`;

  // 6. Enrich with habilidade details
  const habilidades = getHabilidadesPorMateria(ano, tema);
  let habilidade_detalhes: Recomendacao["habilidade_detalhes"] = undefined;

  if (habilidades.length > 0) {
    // Find a habilidade matching the subtema's bncc codes
    const matchedHab = habilidades.find((h) =>
      subtema.habilidades_bncc.includes(h.codigo)
    ) || habilidades[Math.floor(Math.random() * habilidades.length)];

    habilidade_detalhes = {
      codigo: matchedHab.codigo,
      label: getLabelAlternativo(matchedHab),
      nivel: matchedHab.nivel,
      exercicios_ideais: matchedHab.exercicios_ideais,
    };
  }

  // Map tema to materia label
  const MATERIA_MAP: Record<string, string> = {
    portugues: "Português",
    historia: "História",
    geografia: "Geografia",
    ciencias: "Ciências",
    atualidades: "Atualidades",
    "inteligencia-artificial": "Inteligência Artificial",
  };

  return {
    tema,
    materia: MATERIA_MAP[tema] || tema,
    subtema: subtema.nome,
    subtema_display: subtemaDisplay,
    genero_textual: genero,
    motivo,
    habilidades_bncc: subtema.habilidades_bncc,
    habilidade_detalhes,
  };
}

// ============================================================
// TUTOR INSIGHTS — Smart messages based on performance
// ============================================================

export function generateTutorInsights(data: StudentData): TutorInsight[] {
  const insights: TutorInsight[] = [];
  const overall = getOverallAccuracy(data);
  const level = getStudentLevel(data);
  const interpRate = getAccuracyRate(data.performance.interpretacao);
  const gramRate = getAccuracyRate(data.performance.gramatica);
  const vocabRate = getAccuracyRate(data.performance.vocabulario);

  // Welcome message for new students
  if (data.total_atividades === 0) {
    insights.push({
      tipo: "incentivo",
      texto: "Oi! Eu sou o Brasil Letrado, seu tutor! 🌟 Vamos começar uma atividade? Estou aqui para te ajudar!",
    });
    return insights;
  }

  // Performance-based messages
  if (overall >= 85) {
    insights.push({
      tipo: "incentivo",
      texto: `Incrível! Você está acertando ${overall}% das questões! 🏆 Você é um campeão da leitura!`,
    });
  } else if (overall >= 60) {
    insights.push({
      tipo: "incentivo",
      texto: `Você está indo muito bem, com ${overall}% de acertos! 💪 Continue assim que vai melhorar ainda mais!`,
    });
  } else if (data.total_atividades >= 3) {
    insights.push({
      tipo: "dica",
      texto: `Você está com ${overall}% de acertos. Vamos treinar mais? Uma dica: releia o texto com calma antes de responder! 📖`,
    });
  }

  // Category-specific insights
  if (data.performance.interpretacao.total >= 3 && interpRate < 60) {
    insights.push({
      tipo: "sugestao",
      texto: "Percebi que interpretação de texto está difícil. Que tal ler o texto duas vezes antes de responder? Vou te ajudar! 😊",
    });
  }

  if (data.performance.gramatica.total >= 2 && gramRate < 50) {
    insights.push({
      tipo: "sugestao",
      texto: "A gramática pode ser divertida! Vamos tentar exercícios com textos que você gosta? ✍️",
    });
  }

  if (data.performance.vocabulario.total >= 2 && vocabRate < 50) {
    insights.push({
      tipo: "dica",
      texto: "Dica para vocabulário: quando encontrar uma palavra nova, tente adivinhar o significado pelo contexto da frase! 📚",
    });
  }

  // Reading encouragement
  if (data.performance.leitura.tentativas === 0 && data.total_atividades >= 2) {
    insights.push({
      tipo: "sugestao",
      texto: "Você ainda não experimentou a leitura em voz alta! Que tal tentar? Ajuda muito na compreensão! 📢",
    });
  } else if (data.performance.leitura.tentativas >= 3) {
    insights.push({
      tipo: "incentivo",
      texto: `Você já leu em voz alta ${data.performance.leitura.tentativas} vezes! Isso faz muita diferença na fluência! 🎯`,
    });
  }

  // Level progress
  insights.push({
    tipo: "incentivo",
    texto: `Você está no Nível ${level} com ${data.total_xp} XP! ${level < 3 ? "Continue para subir de nível!" : "Você está mandando bem!"} ⭐`,
  });

  // Streak / activity count
  if (data.total_atividades >= 10) {
    insights.push({
      tipo: "incentivo",
      texto: `Parabéns! Você já completou ${data.total_atividades} atividades! 🎉`,
    });
  }

  return insights.slice(0, 4); // Max 4 insights
}

// ============================================================
// TUTOR SUGGESTIONS — Quick action buttons
// ============================================================

export interface TutorSuggestion {
  emoji: string;
  label: string;
  tema: string;
  genero?: string;
}

export function generateTutorSuggestions(data: StudentData): TutorSuggestion[] {
  const suggestions: TutorSuggestion[] = [];
  const weakest = getWeakestCategory(data);
  const ano = data.ano || "3";

  const recomendacao = generateRecomendacao(data);

  if (recomendacao) {
    suggestions.push({
      emoji: "🎯",
      label: `Treinar ${weakest === "interpretacao" ? "interpretação" : weakest === "gramatica" ? "gramática" : "vocabulário"}`,
      tema: recomendacao.tema,
      genero: recomendacao.genero_textual,
    });
  }

  // Add variety suggestion
  const temasNaoUsados = ["geografia", "historia", "ciencias", "atualidades", "inteligencia-artificial"]
    .filter((t) => !data.temas_recentes.slice(0, 3).includes(t));

  if (temasNaoUsados.length > 0) {
    const temaNovo = temasNaoUsados[Math.floor(Math.random() * temasNaoUsados.length)];
    const TEMA_LABELS: Record<string, string> = {
      geografia: "Geografia",
      historia: "História",
      ciencias: "Ciências",
      atualidades: "Atualidades",
      "inteligencia-artificial": "Inteligência Artificial",
    };
    suggestions.push({
      emoji: "🌍",
      label: `Explorar ${TEMA_LABELS[temaNovo]}`,
      tema: temaNovo,
    });
  }

  return suggestions.slice(0, 3);
}
