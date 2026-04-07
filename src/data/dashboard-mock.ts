// Mock data for the professional dashboard

export interface Aluno {
  id: string;
  nome: string;
  turma: string;
  escola: string;
  professor: string;
  ano: number;
  xp: number;
  acertos: number;
  erros: number;
  atividades: number;
  engajamento: number; // 0-100
  evolucao: number; // % change
  habilidades: Record<string, number>;
  generos: Record<string, number>;
  temas: Record<string, number>;
  historicoMensal: { mes: string; acertos: number; erros: number; atividades: number }[];
}

export interface Professor {
  id: string;
  nome: string;
  escola: string;
  turmas: string[];
  mediaAcertos: number;
  evolucao: number;
  totalAlunos: number;
  alunosEmRisco: number;
  engajamento: number;
}

export interface Escola {
  id: string;
  nome: string;
  cidade: string;
  totalAlunos: number;
  totalProfessores: number;
  mediaAcertos: number;
  evolucao: number;
  engajamento: number;
  ranking: number;
}

export interface Insight {
  tipo: "alerta" | "destaque" | "tendencia" | "sugestao";
  texto: string;
  icone: string;
}

const NOMES_ALUNOS = [
  "Ana Clara", "Pedro Henrique", "Maria Eduarda", "João Vitor", "Larissa Souza",
  "Gabriel Martins", "Isabela Costa", "Lucas Oliveira", "Valentina Silva", "Arthur Lima",
  "Sophia Rodrigues", "Enzo Santos", "Laura Ferreira", "Miguel Pereira", "Helena Carvalho",
  "Bernardo Almeida", "Alice Nascimento", "Davi Barbosa", "Júlia Gomes", "Rafael Araújo",
  "Manuela Ribeiro", "Gustavo Mendes", "Cecília Cardoso", "Samuel Correia", "Lara Monteiro",
  "Heitor Duarte", "Melissa Moura", "Lorenzo Dias", "Beatriz Nunes", "Benjamin Pinto",
  "Marina Teixeira", "Théo Castro", "Isadora Vieira", "Nicolas Rocha", "Clara Lopes",
  "Felipe Cavalcanti", "Elisa Cunha", "Leonardo Freitas", "Aurora Machado", "Matheus Ramos",
];

const NOMES_PROFESSORES = [
  "Profª Maria Santos", "Prof. Carlos Oliveira", "Profª Ana Beatriz", "Prof. Ricardo Lima",
  "Profª Fernanda Costa", "Prof. Jorge Mendes", "Profª Patrícia Rocha", "Prof. André Silva",
];

const ESCOLAS = [
  "E.M. Monteiro Lobato", "E.M. Cecília Meireles", "E.M. Machado de Assis",
  "E.M. Clarice Lispector", "E.M. Carlos Drummond", "E.M. Manuel Bandeira",
];

const TURMAS = ["A", "B", "C", "D"];
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const HABILIDADES_BNCC: Record<string, string> = {
  "EF01LP01": "Localizar informações",
  "EF02LP03": "Inferência textual",
  "EF03LP05": "Vocabulário contextual",
  "EF04LP02": "Pontuação e sentido",
  "EF05LP04": "Coesão e coerência",
  "EF03LP08": "Gêneros textuais",
  "EF04LP06": "Ortografia",
  "EF05LP09": "Produção textual",
  "EF02LP07": "Sequência narrativa",
  "EF03LP10": "Interpretação de enunciados",
};

const GENEROS = ["Fábulas", "Contos", "Notícias", "Poemas", "Crônicas", "Receitas", "Cartas", "HQ"];
const TEMAS_DATA = ["Português", "História", "Geografia", "Ciências", "Atualidades", "Estudos Sociais"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateAluno(i: number, escola: string, professor: string, turma: string, ano: number): Aluno {
  const acertos = rand(40, 95);
  const habilidades: Record<string, number> = {};
  Object.keys(HABILIDADES_BNCC).forEach(k => { habilidades[k] = rand(25, 98); });
  const generos: Record<string, number> = {};
  GENEROS.forEach(g => { generos[g] = rand(30, 95); });
  const temas: Record<string, number> = {};
  TEMAS_DATA.forEach(t => { temas[t] = rand(35, 95); });

  return {
    id: `aluno-${i}`,
    nome: NOMES_ALUNOS[i % NOMES_ALUNOS.length],
    turma: `${ano}º ${turma}`,
    escola,
    professor,
    ano,
    xp: rand(100, 2500),
    acertos,
    erros: 100 - acertos,
    atividades: rand(8, 60),
    engajamento: rand(30, 100),
    evolucao: randFloat(-10, 25),
    habilidades,
    generos,
    temas,
    historicoMensal: MESES.map(mes => ({
      mes,
      acertos: rand(35, 95),
      erros: rand(5, 65),
      atividades: rand(2, 15),
    })),
  };
}

export function generateMockData() {
  const alunos: Aluno[] = [];
  const professores: Professor[] = [];
  const escolas: Escola[] = [];
  let alunoIdx = 0;

  ESCOLAS.forEach((escolaNome, eIdx) => {
    const profRange = NOMES_PROFESSORES.slice(eIdx % 4, (eIdx % 4) + 2);
    let escolaTotalAlunos = 0;
    let escolaMediaAcertos = 0;

    profRange.forEach((profNome) => {
      const turmas: string[] = [];
      let profAcertos = 0;
      let profAlunos = 0;
      let profRisco = 0;

      TURMAS.slice(0, rand(2, 3)).forEach((turmaLetra) => {
        const ano = rand(1, 5);
        const turmaLabel = `${ano}º ${turmaLetra}`;
        turmas.push(turmaLabel);
        const numAlunos = rand(6, 10);
        for (let j = 0; j < numAlunos; j++) {
          const aluno = generateAluno(alunoIdx++, escolaNome, profNome, turmaLetra, ano);
          alunos.push(aluno);
          profAcertos += aluno.acertos;
          profAlunos++;
          if (aluno.acertos < 50) profRisco++;
        }
      });

      escolaTotalAlunos += profAlunos;
      const media = profAlunos > 0 ? Math.round(profAcertos / profAlunos) : 0;
      escolaMediaAcertos += media;

      professores.push({
        id: `prof-${professores.length}`,
        nome: profNome,
        escola: escolaNome,
        turmas,
        mediaAcertos: media,
        evolucao: randFloat(-5, 20),
        totalAlunos: profAlunos,
        alunosEmRisco: profRisco,
        engajamento: rand(50, 100),
      });
    });

    escolas.push({
      id: `escola-${eIdx}`,
      nome: escolaNome,
      cidade: "São Paulo",
      totalAlunos: escolaTotalAlunos,
      totalProfessores: profRange.length,
      mediaAcertos: Math.round(escolaMediaAcertos / profRange.length),
      evolucao: randFloat(-3, 18),
      engajamento: rand(55, 98),
      ranking: eIdx + 1,
    });
  });

  // Sort escola ranking by media
  escolas.sort((a, b) => b.mediaAcertos - a.mediaAcertos);
  escolas.forEach((e, i) => { e.ranking = i + 1; });

  return { alunos, professores, escolas };
}

export function generateInsights(alunos: Aluno[], professores: Professor[], escolas: Escola[]): Insight[] {
  const worstHab = Object.entries(
    alunos.reduce((acc, a) => {
      Object.entries(a.habilidades).forEach(([k, v]) => {
        if (!acc[k]) acc[k] = { total: 0, count: 0 };
        acc[k].total += v;
        acc[k].count++;
      });
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([k, v]) => ({ hab: k, media: Math.round(v.total / v.count) }))
    .sort((a, b) => a.media - b.media);

  const bestEscola = escolas[0];
  const worstGenero = Object.entries(
    alunos.reduce((acc, a) => {
      Object.entries(a.generos).forEach(([k, v]) => {
        if (!acc[k]) acc[k] = { total: 0, count: 0 };
        acc[k].total += v;
        acc[k].count++;
      });
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([k, v]) => ({ genero: k, media: Math.round(v.total / v.count) }))
    .sort((a, b) => a.media - b.media)[0];

  const bestProf = [...professores].sort((a, b) => b.evolucao - a.evolucao)[0];
  const alunosRisco = alunos.filter(a => a.acertos < 50).length;

  return [
    { tipo: "alerta", texto: `A habilidade "${HABILIDADES_BNCC[worstHab[0]?.hab] || 'Inferência'}" apresenta maior dificuldade geral com média de ${worstHab[0]?.media}%.`, icone: "⚠️" },
    { tipo: "destaque", texto: `${bestEscola.nome} lidera o ranking com ${bestEscola.mediaAcertos}% de acertos e crescimento de ${bestEscola.evolucao}%.`, icone: "🏆" },
    { tipo: "tendencia", texto: `O gênero "${worstGenero?.genero}" apresenta a menor média de acertos (${worstGenero?.media}%) e precisa de reforço.`, icone: "📊" },
    { tipo: "sugestao", texto: `${bestProf?.nome} apresenta a maior evolução média (+${bestProf?.evolucao}%). Suas práticas podem ser referência.`, icone: "💡" },
    { tipo: "alerta", texto: `${alunosRisco} alunos estão com desempenho abaixo de 50% e precisam de intervenção pedagógica.`, icone: "🔴" },
    { tipo: "destaque", texto: `Alunos com engajamento acima de 80% apresentam taxa de acerto 23% maior em média.`, icone: "🚀" },
    { tipo: "tendencia", texto: `O 4º ano apresenta crescimento consistente nas últimas 8 semanas em interpretação textual.`, icone: "📈" },
    { tipo: "sugestao", texto: `Recomenda-se intensificar atividades de produção textual no 3º ano para fortalecer coesão e coerência.`, icone: "✏️" },
  ];
}

export { HABILIDADES_BNCC, GENEROS, TEMAS_DATA, MESES, ESCOLAS as ESCOLAS_NOMES };
