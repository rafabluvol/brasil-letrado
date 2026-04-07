// ─── Brasil Letrado composite images (tutor wearing accessories) ───
import sabiaBase from "@/assets/sabia-tutor.png";
import sabiaGlasses from "@/assets/sabia-glasses.png";
import sabiaWizard from "@/assets/sabia-wizard.png";
import sabiaGladiator from "@/assets/sabia-gladiator.png";
import sabiaCrown from "@/assets/sabia-crown.png";

// ─── Tucano variants ───
import tucanoBase from "@/assets/fauna-tucano.png";
import tucanoPotter from "@/assets/tucano-potter.png";
import tucanoGenio from "@/assets/tucano-genio.png";
import tucanoImperial from "@/assets/tucano-imperial.png";

// ─── Capivara variants ───
import capivaraBase from "@/assets/fauna-capivara.png";
import capivaraPirata from "@/assets/capivara-pirata.png";
import capivaraCientista from "@/assets/capivara-cientista.png";
import capivaraRainha from "@/assets/capivara-rainha.png";

// ─── Mico-Leão variants ───
import micoBase from "@/assets/fauna-mico-leao.png";
import micoAstronauta from "@/assets/mico-astronauta.png";
import micoSamurai from "@/assets/mico-samurai.png";
import micoLendario from "@/assets/mico-lendario.png";

// ─── Arara variants ───
import araraBase from "@/assets/fauna-arara.png";
import araraViking from "@/assets/arara-viking.png";
import araraFenix from "@/assets/arara-fenix.png";
import araraCosmica from "@/assets/arara-cosmica.png";

export type AnimalGroup = "sabia" | "tucano" | "capivara" | "mico" | "arara";

export interface LevelInfo {
  nivel: number;
  titulo: string;
  emoji: string;
  /** Full composite image (tutor with accessory already worn) */
  image: string;
  /** Which animal group this level belongs to */
  group: AnimalGroup;
  corBadge: string;
  descricao: string;
  /** Brazukas needed to unlock this level */
  brazukasNeeded: number;
}

export const GROUP_LABELS: Record<AnimalGroup, { label: string; emoji: string }> = {
  sabia: { label: "Brasil Letrado", emoji: "🐦" },
  tucano: { label: "Tucano", emoji: "🦜" },
  capivara: { label: "Capivara", emoji: "🦫" },
  mico: { label: "Mico-Leão", emoji: "🐒" },
  arara: { label: "Arara", emoji: "🦅" },
};

const LEVELS: LevelInfo[] = [
  // ─── Brasil Letrado (base + 4 accessories) ───
  {
    nivel: 1, titulo: "Explorador", emoji: "🧭",
    image: sabiaBase, group: "sabia",
    corBadge: "from-emerald-400 to-emerald-600",
    descricao: "Começando sua jornada de leitura!",
    brazukasNeeded: 0,
  },
  {
    nivel: 2, titulo: "Leitor Curioso", emoji: "🤓",
    image: sabiaGlasses, group: "sabia",
    corBadge: "from-blue-400 to-blue-600",
    descricao: "Sempre querendo aprender mais!",
    brazukasNeeded: 150,
  },
  {
    nivel: 3, titulo: "Mestre das Palavras", emoji: "🧙",
    image: sabiaWizard, group: "sabia",
    corBadge: "from-purple-400 to-purple-600",
    descricao: "Domina o poder das palavras!",
    brazukasNeeded: 250,
  },
  {
    nivel: 4, titulo: "Guardião das Histórias", emoji: "⚔️",
    image: sabiaGladiator, group: "sabia",
    corBadge: "from-red-400 to-red-600",
    descricao: "Guerreiro protetor das histórias!",
    brazukasNeeded: 350,
  },
  {
    nivel: 5, titulo: "Sábio Supremo", emoji: "👑",
    image: sabiaCrown, group: "sabia",
    corBadge: "from-amber-400 to-amber-600",
    descricao: "O mais sábio dos leitores!",
    brazukasNeeded: 450,
  },

  // ─── Tucano (4 phases) ───
  {
    nivel: 6, titulo: "Tucano Sábio", emoji: "🐦",
    image: tucanoBase, group: "tucano",
    corBadge: "from-orange-400 to-orange-600",
    descricao: "Transformou-se no colorido Tucano!",
    brazukasNeeded: 600,
  },
  {
    nivel: 7, titulo: "Tucano Potter", emoji: "⚡",
    image: tucanoPotter, group: "tucano",
    corBadge: "from-red-700 to-amber-600",
    descricao: "O Tucano bruxo mais famoso!",
    brazukasNeeded: 750,
  },
  {
    nivel: 8, titulo: "Tucano Gênio", emoji: "🧞",
    image: tucanoGenio, group: "tucano",
    corBadge: "from-blue-500 to-cyan-400",
    descricao: "O Tucano mágico da lâmpada!",
    brazukasNeeded: 900,
  },
  {
    nivel: 9, titulo: "Tucano Imperial", emoji: "🏰",
    image: tucanoImperial, group: "tucano",
    corBadge: "from-yellow-500 to-red-500",
    descricao: "O imperador dos Tucanos!",
    brazukasNeeded: 1100,
  },

  // ─── Capivara (4 phases) ───
  {
    nivel: 10, titulo: "Capivara Leitora", emoji: "📖",
    image: capivaraBase, group: "capivara",
    corBadge: "from-yellow-600 to-amber-700",
    descricao: "A mais tranquila e sábia da fauna!",
    brazukasNeeded: 1300,
  },
  {
    nivel: 11, titulo: "Capivara Pirata", emoji: "🏴‍☠️",
    image: capivaraPirata, group: "capivara",
    corBadge: "from-gray-600 to-gray-800",
    descricao: "Aventureira dos sete mares!",
    brazukasNeeded: 1500,
  },
  {
    nivel: 12, titulo: "Capivara Cientista", emoji: "🔬",
    image: capivaraCientista, group: "capivara",
    corBadge: "from-green-400 to-teal-600",
    descricao: "Gênio da ciência brasileira!",
    brazukasNeeded: 1700,
  },
  {
    nivel: 13, titulo: "Capivara Rainha", emoji: "👸",
    image: capivaraRainha, group: "capivara",
    corBadge: "from-purple-500 to-pink-500",
    descricao: "Majestade suprema da fauna!",
    brazukasNeeded: 2000,
  },

  // ─── Mico-Leão (4 phases) ───
  {
    nivel: 14, titulo: "Mico-Leão Dourado", emoji: "🌟",
    image: micoBase, group: "mico",
    corBadge: "from-yellow-400 to-orange-500",
    descricao: "Raro e precioso como seu conhecimento!",
    brazukasNeeded: 2300,
  },
  {
    nivel: 15, titulo: "Mico Astronauta", emoji: "🚀",
    image: micoAstronauta, group: "mico",
    corBadge: "from-slate-400 to-blue-500",
    descricao: "Explorando o universo do saber!",
    brazukasNeeded: 2600,
  },
  {
    nivel: 16, titulo: "Mico Samurai", emoji: "⛩️",
    image: micoSamurai, group: "mico",
    corBadge: "from-red-600 to-black",
    descricao: "Guerreiro honrado do conhecimento!",
    brazukasNeeded: 3000,
  },
  {
    nivel: 17, titulo: "Mico Lendário", emoji: "✨",
    image: micoLendario, group: "mico",
    corBadge: "from-yellow-300 to-amber-500",
    descricao: "Lenda viva da sabedoria!",
    brazukasNeeded: 3500,
  },

  // ─── Arara (4 phases) ───
  {
    nivel: 18, titulo: "Arara Colorida", emoji: "🌈",
    image: araraBase, group: "arara",
    corBadge: "from-sky-400 to-blue-600",
    descricao: "A mais majestosa da fauna!",
    brazukasNeeded: 4000,
  },
  {
    nivel: 19, titulo: "Arara Viking", emoji: "🪓",
    image: araraViking, group: "arara",
    corBadge: "from-gray-500 to-amber-600",
    descricao: "Guerreira nórdica dos céus!",
    brazukasNeeded: 4500,
  },
  {
    nivel: 20, titulo: "Arara Fênix", emoji: "🔥",
    image: araraFenix, group: "arara",
    corBadge: "from-orange-500 to-red-600",
    descricao: "Renascida das cinzas com poder total!",
    brazukasNeeded: 5000,
  },
  {
    nivel: 21, titulo: "Arara Cósmica", emoji: "🌌",
    image: araraCosmica, group: "arara",
    corBadge: "from-purple-600 to-indigo-800",
    descricao: "Dona do universo e das estrelas!",
    brazukasNeeded: 6000,
  },
];

export function getLevelInfo(nivel: number): LevelInfo {
  const clamped = Math.min(Math.max(nivel, 1), LEVELS.length);
  return LEVELS[clamped - 1];
}

export function getAllLevels(): LevelInfo[] {
  return LEVELS;
}

export function calculateLevelFromXp(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].brazukasNeeded) return LEVELS[i].nivel;
  }
  return 1;
}

export function getXpForNextLevel(nivel: number): number {
  const next = LEVELS.find(l => l.nivel === nivel + 1);
  return next ? next.brazukasNeeded : LEVELS[LEVELS.length - 1].brazukasNeeded;
}

// ============================================================
// Trophy / Conquistas system
// ============================================================

export interface Trophy {
  id: string;
  title: string;
  icon: string;
  description: string;
  inventorInfo: string;
  brazukasRequired: number;
}

export const TROPHIES: Trophy[] = [
  {
    id: "santos-dumont", title: "Troféu Santos Dumont", icon: "🛩️",
    description: "Pai da aviação!",
    inventorInfo: "Alberto Santos Dumont (1873–1932) foi um inventor brasileiro considerado o pai da aviação. Ele realizou o primeiro voo público com o 14-Bis em Paris, em 1906.",
    brazukasRequired: 350,
  },
  {
    id: "oswaldo-cruz", title: "Troféu Oswaldo Cruz", icon: "🏅",
    description: "Herói da saúde pública!",
    inventorInfo: "Oswaldo Cruz (1872–1917) foi médico e sanitarista brasileiro que erradicou a febre amarela no Rio de Janeiro.",
    brazukasRequired: 700,
  },
  {
    id: "nikola-tesla", title: "Troféu Nikola Tesla", icon: "🔔",
    description: "Gênio da eletricidade!",
    inventorInfo: "Nikola Tesla (1856–1943) desenvolveu o sistema de corrente alternada (AC) que alimenta o mundo moderno.",
    brazukasRequired: 1100,
  },
  {
    id: "marie-curie", title: "Troféu Marie Curie", icon: "⭐",
    description: "Pioneira da radioatividade!",
    inventorInfo: "Marie Curie (1867–1934) foi a primeira pessoa a ganhar dois Prêmios Nobel. Descobriu o polônio e o rádio.",
    brazukasRequired: 1500,
  },
  {
    id: "vital-brazil", title: "Troféu Vital Brazil", icon: "🏆",
    description: "Mestre dos soros!",
    inventorInfo: "Vital Brazil (1865–1950) criou o soro antiofídico, salvando milhares de vidas de picadas de cobras.",
    brazukasRequired: 2000,
  },
  {
    id: "alexander-graham-bell", title: "Troféu Graham Bell", icon: "🔱",
    description: "Inventor do telefone!",
    inventorInfo: "Alexander Graham Bell (1847–1922) é creditado com a invenção do primeiro telefone prático.",
    brazukasRequired: 2600,
  },
  {
    id: "cesar-lattes", title: "Troféu César Lattes", icon: "👑",
    description: "Gênio da física nuclear!",
    inventorInfo: "César Lattes (1924–2005) co-descobriu o méson pi (píon), partícula fundamental na física nuclear.",
    brazukasRequired: 3000,
  },
  {
    id: "isaac-newton", title: "Troféu Isaac Newton", icon: "🌟",
    description: "Pai da física moderna!",
    inventorInfo: "Isaac Newton (1643–1727) formulou as leis da gravidade e do movimento, revolucionando a ciência.",
    brazukasRequired: 3500,
  },
  {
    id: "ada-lovelace", title: "Troféu Ada Lovelace", icon: "💎",
    description: "Primeira programadora!",
    inventorInfo: "Ada Lovelace (1815–1852) é considerada a primeira programadora da história.",
    brazukasRequired: 4000,
  },
  {
    id: "nise-da-silveira", title: "Troféu Nise da Silveira", icon: "🏵️",
    description: "Revolucionária da psiquiatria!",
    inventorInfo: "Nise da Silveira (1905–1999) revolucionou o tratamento da saúde mental com arte-terapia.",
    brazukasRequired: 4500,
  },
  {
    id: "leonardo-da-vinci", title: "Troféu Da Vinci", icon: "🏛️",
    description: "Gênio universal!",
    inventorInfo: "Leonardo da Vinci (1452–1519) foi pintor, inventor, engenheiro e cientista. Um dos maiores gênios da história.",
    brazukasRequired: 5000,
  },
  {
    id: "albert-einstein", title: "Troféu Einstein", icon: "✨",
    description: "Mestre do espaço-tempo!",
    inventorInfo: "Albert Einstein (1879–1955) formulou a teoria da relatividade e revolucionou a física moderna.",
    brazukasRequired: 6000,
  },
];

export function getUnlockedTrophies(brazukas: number): Trophy[] {
  return TROPHIES.filter(t => brazukas >= t.brazukasRequired);
}

export function getNextTrophy(brazukas: number): Trophy | null {
  return TROPHIES.find(t => brazukas < t.brazukasRequired) || null;
}

export function checkNewTrophies(oldXp: number, newXp: number): Trophy[] {
  return TROPHIES.filter(t => oldXp < t.brazukasRequired && newXp >= t.brazukasRequired);
}
