export const ANOS_ESCOLARES = [
  { value: "1", label: "1º Ano" },
  { value: "2", label: "2º Ano" },
  { value: "3", label: "3º Ano" },
  { value: "4", label: "4º Ano" },
  { value: "5", label: "5º Ano" },
];

export const GENEROS_POR_ANO: Record<string, string[]> = {
  "1": ["Parlendas", "Cantigas", "Trava-línguas", "Listas", "Bilhetes"],
  "2": ["Parlendas", "Cantigas", "Histórias curtas", "Bilhetes", "Convites"],
  "3": ["Fábulas", "Contos de fadas", "Receitas", "Cartas", "Histórias em quadrinhos"],
  "4": ["Fábulas", "Contos", "Notícias", "Poemas", "Diários"],
  "5": ["Crônicas", "Contos", "Notícias", "Reportagens", "Poemas", "Artigos de opinião"],
};

export const TEMAS = [
  { value: "portugues", label: "Português", icon: "📖" },
  { value: "historia", label: "História", icon: "🏛️" },
  { value: "geografia", label: "Geografia", icon: "🌍" },
  { value: "ciencias", label: "Ciências", icon: "🔬" },
  { value: "atualidades", label: "Atualidades", icon: "📰" },
  { value: "inteligencia-artificial", label: "Inteligência Artificial", icon: "🤖" },
  { value: "crie-voce-mesmo", label: "Crie Você!", icon: "✨" },
];

export interface LeituraEmVozAlta {
  instrucao: string;
  trechoDestaque: string;
  dicaLeitura: string;
}

export interface ExercicioCena {
  lacuna: {
    palavra_correta: string;
    posicao_no_texto: number;
    alternativas: [string, string];
  };
  pergunta_pos_video: {
    tipo: 'multipla_escolha' | 'emocao';
    pergunta: string;
    opcoes: string[];
    resposta_correta: number;
  };
  pergunta_previsao: {
    pergunta: string;
    opcoes: [string, string];
  };
}

export interface StoryPage {
  numero: number;
  titulo: string;
  texto: string;
  descricaoImagem: string;
  imagemUrl?: string;
  exercicio_cena?: ExercicioCena;
}

export interface Exercicio {
  id: string;
  tipo: "multipla-escolha" | "verdadeiro-falso" | "completar" | "ordenar" | "ligar" | "memoria" | "aberta" | "leitura-trecho";
  categoria: "interpretacao" | "vocabulario" | "gramatica";
  enunciado: string;
  opcoes?: string[];
  respostaCorreta: string | number;
  explicacao: string;
  dificuldade: 1 | 2 | 3;
  pares?: { esquerda: string; direita: string }[];
  paresSinonimos?: { palavra: string; sinonimo: string }[];
  itensOrdenados?: string[];
  perguntaAberta?: string;
  dicaResposta?: string;
  trechoLeitura?: string;
  dicaLeitura?: string;
  frases?: { frase: string; opcoes: string[]; respostaCorreta: number }[];
}

export interface Atividade {
  id: string;
  titulo: string;
  texto: string;
  genero: string;
  ano: string;
  tema: string;
  exercicios: Exercicio[];
  habilidadeBNCC: string;
  leituraEmVozAlta?: LeituraEmVozAlta;
  storyPages?: StoryPage[];
  historiaAluno?: string;
  // Legacy fields for backward compatibility
  interpretacao?: Exercicio[];
  gramatica?: Exercicio[];
}

// Helper to normalize activities (handle both old and new format)
export function getExercicios(atividade: Atividade): Exercicio[] {
  if (atividade.exercicios && atividade.exercicios.length > 0) {
    return atividade.exercicios;
  }
  // Legacy fallback
  return [...(atividade.interpretacao || []), ...(atividade.gramatica || [])];
}

export const ATIVIDADE_EXEMPLO: Atividade = {
  id: "1",
  titulo: "A Formiguinha e a Neve",
  texto: `Era uma vez uma formiguinha que trabalhava muito durante o verão. Ela carregava folhas, sementes e grãos para guardar em sua casa.

Enquanto isso, a cigarra cantava e dançava sem parar. "Por que você trabalha tanto?", perguntou a cigarra. "O inverno vai chegar", respondeu a formiguinha.

Quando o frio chegou, a formiguinha tinha comida de sobra. A cigarra, com fome e frio, pediu ajuda. A formiguinha dividiu sua comida e disse: "No próximo verão, vamos trabalhar juntas!"`,
  genero: "Fábulas",
  ano: "3",
  tema: "portugues",
  habilidadeBNCC: "EF03LP01",
  leituraEmVozAlta: {
    instrucao: "Leia o texto em voz alta com atenção à entonação dos diálogos!",
    trechoDestaque: '"Por que você trabalha tanto?", perguntou a cigarra. "O inverno vai chegar", respondeu a formiguinha.',
    dicaLeitura: "Tente mudar a voz para cada personagem: a cigarra é mais alegre e despreocupada, a formiguinha é séria e responsável.",
  },
  exercicios: [
    {
      id: "e1",
      tipo: "multipla-escolha",
      categoria: "interpretacao",
      enunciado: "O que a formiguinha fazia durante o verão?",
      opcoes: [
        "Cantava e dançava",
        "Carregava folhas, sementes e grãos",
        "Dormia o dia todo",
        "Brincava com a cigarra",
      ],
      respostaCorreta: 1,
      explicacao: "O texto diz que a formiguinha 'carregava folhas, sementes e grãos para guardar em sua casa'.",
      dificuldade: 1,
    },
    {
      id: "e2",
      tipo: "verdadeiro-falso",
      categoria: "interpretacao",
      enunciado: "A formiguinha se recusou a ajudar a cigarra no inverno.",
      respostaCorreta: "falso",
      explicacao: "Na verdade, a formiguinha dividiu sua comida com a cigarra. Ela foi generosa!",
      dificuldade: 1,
    },
    {
      id: "e3",
      tipo: "multipla-escolha",
      categoria: "interpretacao",
      enunciado: "Qual é a lição principal dessa fábula?",
      opcoes: [
        "Devemos cantar mais",
        "É importante se preparar para o futuro",
        "O inverno é a melhor estação",
        "Formigas são mais fortes que cigarras",
      ],
      respostaCorreta: 1,
      explicacao: "A fábula ensina que devemos nos preparar para o futuro, assim como a formiguinha fez ao trabalhar no verão.",
      dificuldade: 3,
    },
    {
      id: "e4",
      tipo: "completar",
      categoria: "vocabulario",
      enunciado: 'Complete: A formiguinha _____ sua comida com a cigarra.',
      opcoes: ["escondeu", "dividiu", "jogou", "comeu"],
      respostaCorreta: 1,
      explicacao: "O texto diz que a formiguinha 'dividiu sua comida'. Dividir significa compartilhar com alguém.",
      dificuldade: 2,
    },
    {
      id: "e5",
      tipo: "multipla-escolha",
      categoria: "gramatica",
      enunciado: 'No trecho "a formiguinha que trabalhava muito", a palavra "muito" indica:',
      opcoes: ["Tempo", "Lugar", "Intensidade", "Modo"],
      respostaCorreta: 2,
      explicacao: '"Muito" é um advérbio de intensidade — mostra que ela trabalhava bastante, não pouco.',
      dificuldade: 2,
    },
  ],
  // Legacy
  interpretacao: [],
  gramatica: [],
};
