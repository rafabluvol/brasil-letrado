import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Genre-specific exercise instructions per genre
const GENERO_EXERCICIO_INSTRUCOES: Record<string, string> = {
  "Trava-línguas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (trava-línguas):
- Exercício 1 (leitura-trecho): Crie um NOVO trava-línguas original relacionado à história. O aluno deve ler em voz alta. O trecho deve ser divertido e desafiador.
- Exercício 2: Exercício sobre características do trava-línguas (repetição de sons, aliteração, dificuldade de pronúncia). Pode ser multipla-escolha ou completar.`,

  "Parlendas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (parlendas):
- Exercício 1 (leitura-trecho): Traga uma parlenda presente na história para o aluno ler ritmicamente em voz alta. Instrua sobre o ritmo e a cadência.
- Exercício 2: Exercício sobre rimas, ritmo e estrutura da parlenda (identificar rimas, completar versos). Pode ser completar ou multipla-escolha.`,

  "Cantigas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (cantigas):
- Exercício 1 (leitura-trecho): Traga um trecho da cantiga da história para o aluno ler/cantar em voz alta com ritmo e entonação.
- Exercício 2: Exercício sobre rimas, refrão, repetição ou significado cultural da cantiga. Pode ser multipla-escolha, ligar ou completar.`,

  "Listas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (listas):
- Exercício 1: Exercício de ordenar itens da lista conforme aparece no texto (tipo ordenar).
- Exercício 2: Exercício sobre a função/organização da lista — por que listamos, como categorizar. Pode ser multipla-escolha.`,

  "Bilhetes": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (bilhetes):
- Exercício 1: Exercício sobre as partes do bilhete (remetente, destinatário, mensagem, despedida). Pode ser ligar ou multipla-escolha.
- Exercício 2 (aberta): Peça ao aluno para escrever um bilhete de resposta com base na história.`,

  "Convites": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (convites):
- Exercício 1: Exercício sobre os elementos essenciais de um convite (quem, quando, onde, o quê). Pode ser ligar ou completar.
- Exercício 2 (aberta): Peça ao aluno para criar um convite baseado num evento da história.`,

  "Histórias curtas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (histórias curtas):
- Exercício 1: Exercício sobre a estrutura narrativa (início, meio, fim). Pode ser ordenar os eventos.
- Exercício 2: Exercício sobre personagens e suas ações/sentimentos. Pode ser ligar personagens a características.`,

  "Fábulas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (fábulas):
- Exercício 1: Exercício sobre a MORAL da fábula — o que a história ensina. Pode ser multipla-escolha.
- Exercício 2: Exercício ligando personagens da fábula a suas características/comportamentos (tipo ligar).`,

  "Contos de fadas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (contos de fadas):
- Exercício 1: Exercício sobre elementos típicos do conto (herói, vilão, magia, "era uma vez", final feliz). Pode ser multipla-escolha ou ligar.
- Exercício 2: Exercício sobre a sequência dos eventos mágicos/encantados da história (tipo ordenar).`,

  "Receitas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (receitas):
- Exercício 1: Exercício sobre a ordem dos passos da receita (tipo ordenar).
- Exercício 2: Exercício sobre ingredientes, quantidades ou verbos imperativos usados na receita. Pode ser completar ou ligar.`,

  "Cartas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (cartas):
- Exercício 1: Exercício sobre as partes da carta (cabeçalho, saudação, corpo, despedida, assinatura). Pode ser ligar ou ordenar.
- Exercício 2 (aberta): Peça ao aluno para escrever uma carta-resposta ao personagem da história.`,

  "Histórias em quadrinhos": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (HQ):
- Exercício 1: Exercício sobre elementos da HQ (balões de fala, onomatopeias, sequência de quadros). Pode ser multipla-escolha.
- Exercício 2: Exercício de ordenar a sequência dos quadros/eventos da história (tipo ordenar).`,

  "Contos": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (contos):
- Exercício 1: Exercício sobre elementos narrativos (narrador, personagens, tempo, espaço, conflito). Pode ser ligar ou multipla-escolha.
- Exercício 2: Exercício sobre o clímax e desfecho do conto. Pode ser multipla-escolha ou verdadeiro-falso.`,

  "Notícias": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (notícias):
- Exercício 1: Exercício sobre os 5W+1H da notícia (quem, o quê, quando, onde, por quê, como). Pode ser ligar ou completar.
- Exercício 2: Exercício sobre a diferença entre fato e opinião na notícia. Pode ser verdadeiro-falso.`,

  "Poemas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (poemas):
- Exercício 1 (leitura-trecho): Traga uma estrofe do poema da história para o aluno declamar em voz alta com entonação e emoção.
- Exercício 2: Exercício sobre rimas, estrofes, versos ou figuras de linguagem do poema. Pode ser completar, ligar ou multipla-escolha.`,

  "Diários": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (diários):
- Exercício 1: Exercício sobre características do diário (linguagem pessoal, data, sentimentos, 1ª pessoa). Pode ser multipla-escolha ou verdadeiro-falso.
- Exercício 2 (aberta): Peça ao aluno para escrever uma entrada de diário como se fosse o personagem da história.`,

  "Crônicas": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (crônicas):
- Exercício 1: Exercício sobre o tema cotidiano e o humor/ironia da crônica. Pode ser multipla-escolha.
- Exercício 2: Exercício sobre a opinião/ponto de vista do autor na crônica. Pode ser verdadeiro-falso ou multipla-escolha.`,

  "Reportagens": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (reportagens):
- Exercício 1: Exercício sobre a estrutura da reportagem (título, lide, desenvolvimento, fontes). Pode ser ligar ou ordenar.
- Exercício 2: Exercício sobre distinguir fatos de opiniões e identificar fontes. Pode ser verdadeiro-falso.`,

  "Artigos de opinião": `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (artigos de opinião):
- Exercício 1: Exercício sobre a tese/opinião principal e os argumentos do autor. Pode ser multipla-escolha.
- Exercício 2 (aberta): Peça ao aluno para escrever sua própria opinião sobre o tema do artigo, com um argumento.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ano, genero, tema, prompt: userPrompt, habilidade, historiaAluno } = await req.json();

    if (!ano || !genero || !tema) {
      return new Response(JSON.stringify({ error: "ano, genero e tema são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const TEMAS_MAP: Record<string, string> = {
      "portugues": "Língua Portuguesa",
      "historia": "História do Brasil e do mundo",
      "geografia": "Geografia e meio ambiente",
      "ciencias": "Ciências naturais",
      "atualidades": "Atualidades e fatos do mundo real",
      "inteligencia-artificial": "Inteligência Artificial, algoritmos e tecnologia",
      "crie-voce-mesmo": "tema livre escolhido pelo aluno",
    };

    const temaDescricao = TEMAS_MAP[tema] || tema;

    let dificuldadeInstrucao = "";
    const anoNum = parseInt(ano);
    if (anoNum <= 2) {
      dificuldadeInstrucao = `NÍVEL DE DIFICULDADE (1º-2º ano):
- Use frases curtas e simples
- Vocabulário básico e cotidiano
- Texto de 2-3 parágrafos curtos
- Exercícios diretos e objetivos`;
    } else if (anoNum <= 4) {
      dificuldadeInstrucao = `NÍVEL DE DIFICULDADE (3º-4º ano):
- Textos mais estruturados com 3-4 parágrafos
- Vocabulário mais variado
- Início de inferência textual
- Pode incluir figuras de linguagem simples`;
    } else {
      dificuldadeInstrucao = `NÍVEL DE DIFICULDADE (5º ano):
- Textos mais complexos com 4-5 parágrafos
- Vocabulário rico e diversificado
- Interpretação profunda, inferência e análise
- Pode incluir figuras de linguagem e recursos estilísticos`;
    }

    // Get genre-specific instructions
    const generoInstrucoes = GENERO_EXERCICIO_INSTRUCOES[genero] || `EXERCÍCIOS ESPECÍFICOS DO GÊNERO (${genero}):
- Exercício 1: Exercício sobre uma característica ESPECÍFICA deste gênero textual. O exercício deve testar se o aluno reconhece e compreende o gênero.
- Exercício 2: Exercício prático sobre o gênero — pode ser completar, ligar, ordenar ou aberta, sempre relacionado ao gênero.`;

    // Build story-aware prompt
    const hasStory = historiaAluno && historiaAluno.trim().length > 0;

    const storyInstruction = hasStory
      ? `
O ALUNO ESCREVEU ESTA IDEIA DE HISTÓRIA:
"${historiaAluno}"

VOCÊ DEVE:
1. Expandir essa ideia numa história completa e encantadora dividida em 4 páginas
2. Manter a essência da ideia do aluno
3. Adaptar a linguagem para ${ano}º ano
4. OBRIGATORIAMENTE incluir elementos do gênero "${genero}" dentro da história (ex: se for trava-línguas, um personagem deve falar um trava-línguas; se for poema, deve haver um poema na história; se for bilhete, alguém escreve um bilhete)
5. Criar exercícios baseados NESSA história
6. Gerar descrições de ilustração em inglês para cada página

INCLUA no JSON um campo "storyPages" com 4 páginas da história:`
      : `
${tema === "crie-voce-mesmo" && userPrompt ? `O aluno pediu especificamente sobre: "${userPrompt}". Gere o texto sobre esse tema.` : `O tema/área do conhecimento é: ${temaDescricao}. Gere um texto interessante e educativo.`}

IMPORTANTE: O texto DEVE ser do gênero "${genero}" e conter elementos típicos desse gênero de forma clara e identificável.`;

    const storyPagesSchema = hasStory
      ? `
  "characterSheet": "A DETAILED English description of EVERY character in the story — include name, species/type, approximate age, hair color/style, skin tone, eye color, clothing, accessories, and any distinguishing features. This must be thorough enough to recreate the exact same characters in every illustration. Example: 'Luna: a 7-year-old girl with long curly red hair, fair skin with freckles, big green eyes, wearing a yellow sundress with white polka dots and red rain boots. Natan: a large friendly polar bear with pure white fur, small round black eyes, a pink nose, and a blue scarf around his neck.'",
  "storyPages": [
    {
      "numero": 1,
      "titulo": "Título da cena 1 (início da história)",
      "texto": "Texto da página 1 — o começo. MÁXIMO 2 frases curtas (~100 caracteres). Seja direto e envolvente.",
      "descricaoImagem": "IMPORTANT: Start with the EXACT character descriptions from characterSheet, then describe the scene. Detailed English description for a colorful children's book watercolor illustration, warm colors, no text",
      "exercicio_cena": {
        "lacuna": {
          "palavra_correta": "palavra-chave que aparece EXATAMENTE no texto da cena 1",
          "posicao_no_texto": 1,
          "alternativas": ["palavra_errada1_plausivel", "palavra_errada2_plausivel"]
        },
        "pergunta_pos_video": {
          "tipo": "multipla_escolha",
          "pergunta": "Pergunta direta sobre o que aconteceu na cena 1 (2 opções simples para 1º-2º ano, 3 opções para 3º-5º ano)?",
          "opcoes": ["opção correta", "opção errada"],
          "resposta_correta": 0
        },
        "pergunta_previsao": {
          "pergunta": "O que você acha que vai acontecer com [personagem] agora?",
          "opcoes": ["previsão plausível A", "previsão plausível B"]
        }
      }
    },
    {
      "numero": 2,
      "titulo": "Título da cena 2 (desenvolvimento)",
      "texto": "Texto da página 2. MÁXIMO 2 frases curtas (~100 caracteres).",
      "descricaoImagem": "IMPORTANT: Start with the EXACT character descriptions from characterSheet, then describe the scene. English description for watercolor illustration, no text",
      "exercicio_cena": {
        "lacuna": {
          "palavra_correta": "palavra-chave que aparece EXATAMENTE no texto da cena 2",
          "posicao_no_texto": 1,
          "alternativas": ["palavra_errada1_plausivel", "palavra_errada2_plausivel"]
        },
        "pergunta_pos_video": {
          "tipo": "emocao",
          "pergunta": "Como [personagem] está se sentindo neste momento?",
          "opcoes": ["😊", "😨", "😢", "😡"],
          "resposta_correta": 0
        },
        "pergunta_previsao": {
          "pergunta": "O que você acha que vai acontecer agora?",
          "opcoes": ["previsão plausível A", "previsão plausível B"]
        }
      }
    },
    {
      "numero": 3,
      "titulo": "Título da cena 3 (clímax)",
      "texto": "Texto da página 3. MÁXIMO 2 frases curtas (~100 caracteres).",
      "descricaoImagem": "IMPORTANT: Start with the EXACT character descriptions from characterSheet, then describe the scene. English description for watercolor illustration, no text",
      "exercicio_cena": {
        "lacuna": {
          "palavra_correta": "palavra-chave que aparece EXATAMENTE no texto da cena 3",
          "posicao_no_texto": 1,
          "alternativas": ["palavra_errada1_plausivel", "palavra_errada2_plausivel"]
        },
        "pergunta_pos_video": {
          "tipo": "multipla_escolha",
          "pergunta": "Pergunta de interpretação sobre o clímax da cena 3 (3 opções)?",
          "opcoes": ["opção correta", "opção errada A", "opção errada B"],
          "resposta_correta": 0
        },
        "pergunta_previsao": {
          "pergunta": "Como você acha que a história vai terminar?",
          "opcoes": ["desfecho plausível A", "desfecho plausível B"]
        }
      }
    },
    {
      "numero": 4,
      "titulo": "Título da cena 4 (desfecho)",
      "texto": "Texto da página 4 — o final feliz. MÁXIMO 2 frases curtas (~100 caracteres).",
      "descricaoImagem": "IMPORTANT: Start with the EXACT character descriptions from characterSheet, then describe the scene. English description for watercolor illustration, no text",
      "exercicio_cena": {
        "lacuna": {
          "palavra_correta": "palavra-chave que aparece EXATAMENTE no texto da cena 4",
          "posicao_no_texto": 1,
          "alternativas": ["palavra_errada1_plausivel", "palavra_errada2_plausivel"]
        },
        "pergunta_pos_video": {
          "tipo": "emocao",
          "pergunta": "Como [personagem] está se sentindo no final da história?",
          "opcoes": ["😊", "😨", "😢", "😡"],
          "resposta_correta": 0
        },
        "pergunta_previsao": {
          "pergunta": "O que você acha que vai acontecer depois?",
          "opcoes": ["previsão A", "previsão B"]
        }
      }
    }
  ],
  "minijogos_aquecimento": {
    "lacunas": {
      "REGRA_CRITICA": "Cada frase DEVE ter EXATAMENTE 4 opções. A resposta correta NUNCA deve estar sempre na mesma posição - VARIE o respostaCorreta entre 0, 1, 2 e 3 de forma ALEATÓRIA em cada frase.",
      "paragrafos": [
        {
          "textoContexto": "Primeiro parágrafo extraído/parafraseado da história. Coeso e fluido.",
          "frases": [
            {"frase": "Primeira frase do parágrafo 1 com _____ no lugar de uma palavra-chave", "opcoes": ["errada1", "correta", "errada2", "errada3"], "respostaCorreta": 1},
            {"frase": "Segunda frase continua a narrativa com _____ no lugar", "opcoes": ["errada1", "errada2", "correta", "errada3"], "respostaCorreta": 2},
            {"frase": "Terceira frase avança a trama com _____", "opcoes": ["correta", "errada1", "errada2", "errada3"], "respostaCorreta": 0}
          ],
          "emocao": {"pergunta": "Como o personagem se sentiu nesse momento?", "opcoes": ["😊", "😨", "😢", "😡"], "respostaCorreta": 1}
        },
        {
          "textoContexto": "Segundo parágrafo, CONTINUAÇÃO do primeiro, avançando a trama.",
          "frases": [
            {"frase": "Primeira frase do parágrafo 2 com _____", "opcoes": ["errada1", "errada2", "correta", "errada3"], "respostaCorreta": 2},
            {"frase": "Segunda frase avança a narrativa com _____", "opcoes": ["correta", "errada1", "errada2", "errada3"], "respostaCorreta": 0},
            {"frase": "Terceira frase conclui o parágrafo 2 com _____", "opcoes": ["errada1", "correta", "errada2", "errada3"], "respostaCorreta": 1}
          ],
          "emocao": {"pergunta": "Como o personagem se sentiu no final?", "opcoes": ["😊", "😨", "😢", "😡"], "respostaCorreta": 0}
        }
      ]
    },
    "forca": {
      "textoContexto": "Uma frase curta (1 linha) da história que contém a palavra secreta",
      "palavra": "PALAVRA_DO_TEMA_EM_MAIÚSCULAS",
      "dica": "Dica sobre a palavra relacionada à história"
    },
    "cruzadinha": {
      "textoContexto": "REGRA OBRIGATÓRIA: 2-3 frases curtas (máx 120 chars total) da história contendo EXATAMENTE 6 palavras entre **asteriscos**. Essas 6 palavras destacadas são as que o aluno verá em VERDE e precisará encontrar os antônimos na cruzadinha. NUNCA coloque menos de 6 palavras entre asteriscos. Exemplo CORRETO: 'O dia estava **claro** e a menina ficou **feliz** com o passeio **longo**. O caminho era **largo** e o rio **raso** na parte **bonita**.'",
      "palavras": [
        {"palavra": "ESCURO", "dica": "CLARO"},
        {"palavra": "TRISTE", "dica": "FELIZ"},
        {"palavra": "CURTO", "dica": "LONGO"},
        {"palavra": "ESTREITO", "dica": "LARGO"},
        {"palavra": "FUNDO", "dica": "RASO"},
        {"palavra": "FEIO", "dica": "BONITO"}
      ]
    },
    "cacapalavras": {
      "textoContexto": "Um trecho curto (2-3 linhas) da história. As 3 palavras-alvo DEVEM estar presentes neste texto.",
      "grade": "GERE UMA GRADE 10x10. REGRAS CRÍTICAS: coloque EXATAMENTE 3 palavras na grade - uma na HORIZONTAL, uma na VERTICAL e uma na DIAGONAL. Preencha o restante com letras aleatórias. As palavras devem ter entre 4-7 letras. VERIFIQUE que cada palavra está realmente presente na grade antes de retornar.",
      "palavras": ["PALAVRA_HORIZONTAL", "PALAVRA_VERTICAL", "PALAVRA_DIAGONAL"]
    },
    "ordenar": {
      "textoContexto": "Uma frase curta (1 linha) sobre a sequência de eventos da história",
      "itensOrdenados": ["1º evento da história", "2º evento", "3º evento", "4º evento"]
    },
    "ligar": {
      "textoContexto": "Uma ou duas frases da história relacionadas aos pares a serem ligados",
      "pares": [
        {"esquerda": "Personagem/conceito", "direita": "Característica/ação correspondente"},
        {"esquerda": "Personagem/conceito 2", "direita": "Característica/ação 2"},
        {"esquerda": "Personagem/conceito 3", "direita": "Característica/ação 3"},
        {"esquerda": "Personagem/conceito 4", "direita": "Característica/ação 4"}
      ]
    },
    "verdadeiroFalso": {
      "textoContexto": "Um trecho curto (2-3 linhas) da história para contextualizar as afirmações",
      "afirmacoes": [
        {"frase": "Afirmação completa e específica sobre a história 1", "correta": true},
        {"frase": "Afirmação completa e específica sobre a história 2", "correta": false},
        {"frase": "Afirmação completa e específica sobre a história 3", "correta": true},
        {"frase": "Afirmação completa e específica sobre a história 4", "correta": false}
      ]
    },
    "gramatica": {
      "textoContexto": "Uma frase da história que contém as palavras usadas no jogo de gramática",
      "classeAlvo": "substantivo",
      "palavras": [
        {"palavra": "casa", "classe": "substantivo"},
        {"palavra": "bonito", "classe": "adjetivo"},
        {"palavra": "correr", "classe": "verbo"},
        {"palavra": "floresta", "classe": "substantivo"},
        {"palavra": "grande", "classe": "adjetivo"},
        {"palavra": "rio", "classe": "substantivo"},
        {"palavra": "cantar", "classe": "verbo"},
        {"palavra": "pequeno", "classe": "adjetivo"}
      ]
    },
    "memoria": {
      "textoContexto": "Uma frase curta (1 linha) da história com palavras que aparecem no jogo de sinônimos",
      "pares": [
        {"palavra": "palavra do tema 1", "sinonimo": "sinônimo 1"},
        {"palavra": "palavra do tema 2", "sinonimo": "sinônimo 2"},
        {"palavra": "palavra do tema 3", "sinonimo": "sinônimo 3"},
        {"palavra": "palavra do tema 4", "sinonimo": "sinônimo 4"}
      ]
    }
  }`
      : "";

    const systemPrompt = `Você é um professor de Língua Portuguesa do Ensino Fundamental brasileiro, especialista na BNCC.
${hasStory ? "Você também é um escritor de livros infantis encantadores e MESTRE em criar suspense e mistério que prendem a atenção das crianças." : ""}
Gere uma atividade completa no formato JSON para um aluno do ${ano}º ano.

O gênero textual é: ${genero}
${storyInstruction}

${dificuldadeInstrucao}

REGRA CRÍTICA PARA O GÊNERO TEXTUAL:
- A história/texto DEVE conter elementos específicos do gênero "${genero}" DE FORMA EXPLÍCITA dentro do conteúdo
- Exemplos: se o gênero é "Trava-línguas", um personagem deve dizer/usar trava-línguas na história; se é "Poemas", deve haver um poema recitado/escrito na trama; se é "Bilhetes", alguém escreve ou recebe um bilhete; se é "Receitas", aparece uma receita na história
- Os exercícios do gênero devem usar esses elementos que aparecem NA história

REGRA CRÍTICA PARA A INTRODUÇÃO (campo "texto"):
- O texto de introdução DEVE criar MISTÉRIO e SUSPENSE para prender a atenção do aluno
- Apresente os personagens e o cenário de forma envolvente
- Crie uma TRAMA com um problema/desafio/segredo que desperte curiosidade
- NUNCA revele o desfecho na introdução — deixe o leitor querendo saber mais
- O ÚLTIMO PARÁGRAFO da introdução DEVE ser um CTA (chamada para ação) que convide o aluno a continuar lendo. Exemplos:
  * "O que será que vai acontecer com [personagem]? Vamos descobrir juntos!"
  * "Será que [personagem] vai conseguir [objetivo]? Me ajude a descobrir!"
- O CTA deve ser DIFERENTE a cada história gerada, sempre criativo e envolvente

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`) com esta estrutura exata:
{
  "titulo": "Título da atividade/história",
  "texto": "Texto completo${hasStory ? " (a história completa unindo as 4 páginas)" : " do gênero solicitado"}",
  "habilidadeBNCC": "${habilidade || `Código da habilidade BNCC (ex: EF0${ano}LP01)`}",
  ${storyPagesSchema}
  "leituraEmVozAlta": {
    "instrucao": "Instrução para o aluno sobre como ler",
    "trechoDestaque": "Um trecho do texto para treino de fluência",
    "dicaLeitura": "Dica de como ler melhor"
  }${!hasStory ? `,
  "exercicios": [
    exercício 1 (GÊNERO-ESPECÍFICO — ver regras abaixo),
    exercício 2 (GÊNERO-ESPECÍFICO — ver regras abaixo),
    exercício 3 (INTERPRETAÇÃO DE TEXTO — habilidade BNCC),
    exercício 4 (INTERPRETAÇÃO DE TEXTO — habilidade BNCC),
    exercício 5 (SENSO CRÍTICO — escrita ou fala)
  ]` : ''}
}

============================================================
ESTRUTURA OBRIGATÓRIA DOS 5 EXERCÍCIOS:
============================================================

EXERCÍCIOS 1 e 2: ESPECÍFICOS DO GÊNERO TEXTUAL "${genero}"
${generoInstrucoes}

EXERCÍCIOS 3 e 4: INTERPRETAÇÃO DE TEXTO (habilidades BNCC)
- Foco em compreensão leitora, inferência, vocabulário contextualizado
- Tipos permitidos: completar (com 3 frases), multipla-escolha, verdadeiro-falso, ligar, ordenar, memoria
- A categoria DEVE ser "interpretacao"
- DEVEM testar se o aluno realmente leu e compreendeu o texto

EXERCÍCIO 5: SENSO CRÍTICO (escrita ou fala)
- SEMPRE do tipo "aberta"
- Deve estimular pensamento crítico, opinião pessoal ou produção criativa
- Pode pedir para o aluno escrever algo relacionado ao texto/tema/gênero
- Categoria: "interpretacao"

============================================================
TIPOS DE EXERCÍCIOS E SEUS SCHEMAS:
============================================================

1. "completar" (fill-the-blanks — MUST contain 3 different sentences with blanks):
   {"id": "eN", "tipo": "completar", "categoria": "interpretacao", "enunciado": "Complete as frases com base no texto:", "frases": [{"frase": "Frase PARAFRASEADA do texto com _____ no lugar de uma palavra-chave", "opcoes": ["correta", "errada1", "errada2", "errada3"], "respostaCorreta": 0}, {"frase": "Outra frase PARAFRASEADA do texto com _____ no lugar", "opcoes": ["correta", "errada1", "errada2", "errada3"], "respostaCorreta": 0}, {"frase": "Terceira frase PARAFRASEADA do texto com _____ no lugar", "opcoes": ["correta", "errada1", "errada2", "errada3"], "respostaCorreta": 0}], "explicacao": "...", "dificuldade": 1}
   CRITICAL RULES FOR "completar":
   - ANTI-CÓPIA: As frases NUNCA devem ser cópias literais do texto! SEMPRE parafrasear usando sinônimos e estruturas diferentes
   - O aluno deve COMPREENDER o texto para responder, não apenas localizar a frase e copiar a palavra
   - Each "frase" MUST be a LONG sentence (15+ words) that PARAPHRASES a passage from the story with ONE key word replaced by _____
   - The blank word must test a SPECIFIC detail (name, place, action, object) that requires reading comprehension
   - WRONG options must be PLAUSIBLE words of the same grammatical type that could fit the sentence structure
   - ALL 4 options (correct + 3 wrong) must sound reasonable — the only way to choose correctly is having READ the text
   - The category MUST be "interpretacao"
   - DIFFICULTY SCALING: For 1st-2nd grade, blanks test concrete nouns/actions. For 3rd-4th, test adjectives/motivations. For 5th, test abstract concepts/inferences.
   - GRAMÁTICA E ARTIGOS (CRITICAL): As opções devem ser sintagmas COMPLETOS e gramaticalmente corretos quando inseridas na frase. NUNCA deixe um artigo "órfão" antes da lacuna. Regra: se a frase tiver "o _____", "a _____", "os _____", "as _____" imediatamente antes da lacuna, TODAS as opções devem ser substantivos do mesmo gênero e número (ex: "o _____" → todas as opções são masculinas: "menino", "cachorro", "livro", "jardim"). Se isso não for possível, REESCREVA a frase para remover o artigo antes da lacuna e inclua o artigo dentro de CADA opção (ex: frase "encontrou _____ no caminho", opções: "a floresta", "o caminho", "um rio", "as pedras"). Nunca gere combinações inválidas como "o parede" ou "a cachorro".

2. "multipla-escolha":
   {"id": "eN", "tipo": "multipla-escolha", "categoria": "interpretacao", "enunciado": "Pergunta sobre o texto", "opcoes": ["A", "B", "C", "D"], "respostaCorreta": 0, "explicacao": "...", "dificuldade": 1}

3. "verdadeiro-falso":
   {"id": "eN", "tipo": "verdadeiro-falso", "categoria": "interpretacao", "enunciado": "UMA AFIRMAÇÃO COMPLETA E ESPECÍFICA sobre o texto que o aluno deve julgar como verdadeira ou falsa. NUNCA escreva apenas 'Sobre o final da história, marque V ou F'. O enunciado DEVE conter a afirmação em si. Exemplo: 'O personagem Lucas decidiu ajudar a raposa porque sentiu pena dela.'", "respostaCorreta": "verdadeiro", "explicacao": "...", "dificuldade": 1}
   REGRA CRÍTICA para verdadeiro-falso: O campo "enunciado" DEVE ser uma AFIRMAÇÃO COMPLETA que o aluno avalia. NUNCA use frases vagas como "Sobre o final da história" sem dizer O QUÊ sobre o final.

4. "ligar":
   {"id": "eN", "tipo": "ligar", "categoria": "interpretacao", "enunciado": "Ligue os elementos", "pares": [{"esquerda": "...", "direita": "..."}, ...4 pares], "respostaCorreta": 0, "explicacao": "...", "dificuldade": 2}

5. "ordenar":
   {"id": "eN", "tipo": "ordenar", "categoria": "interpretacao", "enunciado": "Organize os eventos na ordem correta", "itensOrdenados": ["1º evento", "2º evento", "3º evento", "4º evento"], "respostaCorreta": 0, "explicacao": "...", "dificuldade": 2}

6. "memoria":
   {"id": "eN", "tipo": "memoria", "categoria": "vocabulario", "enunciado": "Encontre os pares de sinônimos!", "paresSinonimos": [{"palavra": "...", "sinonimo": "..."}, ...4 pares], "respostaCorreta": 0, "explicacao": "...", "dificuldade": 2}

7. "aberta":
   {"id": "eN", "tipo": "aberta", "categoria": "interpretacao", "enunciado": "Questão aberta", "perguntaAberta": "Pergunta reflexiva para senso crítico", "dicaResposta": "Dica para o aluno", "respostaCorreta": 0, "explicacao": "...", "dificuldade": 2}

8. "leitura-trecho" (oral reading exercise with recording):
   {"id": "eN", "tipo": "leitura-trecho", "categoria": "interpretacao", "enunciado": "Instrução do que o aluno deve ler em voz alta", "trechoLeitura": "O trecho específico que o aluno deve ler (trava-línguas, parlenda, poema, etc.)", "dicaLeitura": "Dica de como ler melhor (entonação, ritmo, etc.)", "respostaCorreta": 0, "explicacao": "...", "dificuldade": 1}
   USE "leitura-trecho" ONLY for exercises that require ORAL READING (trava-línguas, parlendas, cantigas, poemas).
   The "trechoLeitura" MUST be a text that appears IN THE STORY or is related to it.

REGRA CRÍTICA SOBRE REFERÊNCIAS E CONTEXTO POR CENA:
- NUNCA mencione "página X", "na página 3", "no texto da página 2" etc. nos exercícios
- O aluno vê APENAS o texto de UMA CENA de cada vez no painel esquerdo ao lado do exercício.
- A correspondência é: Exercício 1 → Cena 1, Exercício 2 → Cena 2, Exercício 3 → Cena 3, Exercício 4 → Cena 4, Exercício 5 → Cena 4.
- CADA EXERCÍCIO DEVE SE BASEAR EXCLUSIVAMENTE NO CONTEÚDO TEXTUAL ESCRITO DA SUA CENA CORRESPONDENTE. O aluno só consegue ler aquela cena enquanto responde.
- As opções, frases e enunciados de cada exercício devem usar APENAS informações, personagens, eventos e palavras que aparecem NO TEXTO ESCRITO da cena correspondente.
- NUNCA crie um exercício que exija que o aluno saiba algo de uma cena diferente da que está visível para ele.

REGRA CRÍTICA — EXERCÍCIOS BASEADOS APENAS NO TEXTO, NUNCA NA ILUSTRAÇÃO:
- Os exercícios devem se basear EXCLUSIVAMENTE no texto escrito da cena, NUNCA no conteúdo da ilustração/imagem.
- NUNCA faça perguntas sobre o que aparece na imagem, na cena visual, na ilustração ou no cenário desenhado.
- O aluno pode não ter visto a ilustração ainda quando responde ao exercício — tudo deve ser respondível APENAS lendo o texto.
- Se uma informação aparece APENAS na descrição da imagem (descricaoImagem) mas NÃO no texto escrito (campo "texto"), essa informação NÃO PODE ser usada em exercícios.
- Exemplos PROIBIDOS: "O que aparece na imagem?", "Na cena, podemos ver...", "O cenário mostra...", "Observando a ilustração..."
- Exemplos CORRETOS: "De acordo com o texto...", "Segundo a história...", "No trecho lido..."

REGRA CRÍTICA — DIFICULDADE PROGRESSIVA POR ANO:
- 1º ano: exercícios bem simples, vocabulário básico, frases curtas. Lacunas com palavras fáceis. Opções bem distintas entre si.
- 2º ano: um pouco mais desafiador que o 1º, mas ainda direto. Pode usar frases um pouco mais longas.
- 3º ano: nível intermediário. Lacunas exigem atenção ao contexto. Opções erradas são mais plausíveis.
- 4º ano: exige inferência e compreensão mais profunda. Vocabulário mais rico. Opções erradas são bastante plausíveis.
- 5º ano: nível avançado para a faixa etária. Exige interpretação, inferência e análise. Distratores muito plausíveis.

REGRA CRÍTICA — NÃO COPIE O TEXTO LITERALMENTE:
- As opções corretas em multipla-escolha e completar NÃO devem ser cópias exatas do texto original.
- REFORMULE/PARAFRASEIE as respostas corretas usando sinônimos ou estruturas diferentes.
- As opções erradas devem ser plausíveis e do mesmo campo semântico da resposta correta.
- Para "completar", a frase pode vir do texto, mas as opções de resposta devem incluir palavras que exijam compreensão real, não simples reconhecimento visual.
- Mesmo para 1º e 2º ano, evite que o aluno acerte apenas por reconhecimento visual direto — ele deve ter LIDO e COMPREENDIDO o texto.
- Use referências como "no texto", "na história", "segundo o trecho" em vez de "na página X"

REGRA CRÍTICA — LACUNAS COM 2 PARÁGRAFOS:
- O minijogo "lacunas" DEVE ter o campo "paragrafos" com EXATAMENTE 2 parágrafos.
- Cada parágrafo tem "textoContexto" (breve descrição) e "frases" (EXATAMENTE 3 lacunas — NEM MAIS, NEM MENOS).
- IMPORTANTE: As frases de cada parágrafo devem formar um TEXTO CONTÍNUO e COESO, como um parágrafo real de uma história. NÃO devem parecer frases soltas/separadas.
- O segundo parágrafo é CONTINUAÇÃO do primeiro, avançando a trama.
- O textoContexto deve dar contexto suficiente para o aluno saber o que preencher — NUNCA deve ser adivinhável no chute.
- NÃO use o formato antigo com "frases" diretamente em "lacunas". Use SEMPRE "paragrafos".
- REGRA DE DESAMBIGUAÇÃO: Cada lacuna DEVE ter UMA ÚNICA resposta possível. As 4 opções devem ser claramente diferenciáveis pelo contexto da história. Nunca coloque duas palavras que poderiam caber na mesma lacuna. A palavra correta deve ser determinada EXCLUSIVAMENTE pela interpretação e compreensão do texto, não por gramática ou senso comum. Exemplo ruim: lacuna com opções "bonito/lindo" (sinônimos). Exemplo bom: lacuna com opções "rio/montanha/escola/jardim" onde só "rio" faz sentido na história.

REGRA — EMOÇÃO DO PERSONAGEM (EMOJI):
- Cada parágrafo DEVE ter um campo "emocao" com a seguinte estrutura:
  { "pergunta": "Como [personagem] se sentiu nesse momento?", "opcoes": ["😊", "😨", "😢", "😡"], "respostaCorreta": 0 }
- A pergunta deve ser sobre a emoção de um personagem naquele trecho específico.
- As opções devem ter EXATAMENTE 4 emojis de emoção distintos.
- respostaCorreta é o índice (0-3) do emoji correto.
- O emoji correto deve ser claramente determinado pelo contexto do parágrafo.

REGRAS GERAIS:
- Gere EXATAMENTE 5 exercícios
- respostaCorreta é o índice (0-3) para múltipla-escolha e completar
- respostaCorreta é "verdadeiro" ou "falso" para verdadeiro-falso
- Para ligar: os pares devem ter relação clara com o texto
- Para ordenar: itensOrdenados deve ter EXATAMENTE 4 itens na ORDEM CORRETA (o sistema embaralha)
- Para memória: use sinônimos reais de palavras que aparecem no texto
- Para cruzadinha: use EXATAMENTE 6 pares de antônimos. O campo "dica" é a PALAVRA ORIGINAL do texto (que aparece em verde). O campo "palavra" é o ANTÔNIMO que o aluno deve preencher na cruzadinha. O textoContexto DEVE ter EXATAMENTE 6 palavras entre **asteriscos** — nem mais, nem menos. Varie bastante as palavras de acordo com o ano escolar do aluno e o tema da história. Para anos 1-2 use antônimos simples (grande/pequeno, alto/baixo). Para anos 3-5 use antônimos mais sofisticados (corajoso/covarde, generoso/egoísta).
- Dificuldade: 1 (fácil), 2 (médio), 3 (difícil)
- O texto deve ser envolvente, educativo e original
- Cada exercício DEVE ter uma explicação clara e didática
- O campo categoria deve ser: "interpretacao", "vocabulario" ou "gramatica"
- REGRA PARA textoContexto: TODOS os campos textoContexto devem ser frases CURTAS de UMA LINHA APENAS (máximo 80 caracteres). Devem ser extraídas ou inspiradas na história. Objetivo é contextualizar o exercício de forma rápida.
${hasStory ? `
============================================================
REGRAS PARA EXERCICIO_CENA (exercícios integrados por cena):
============================================================

Cada storyPage DEVE ter um campo "exercicio_cena" com EXATAMENTE esta estrutura:

CAMPO "lacuna":
- "palavra_correta": UMA palavra substantivo ou adjetivo importante que aparece LITERALMENTE no campo "texto" desta cena (mesma capitalização e forma)
- "posicao_no_texto": índice 1-based da palavra no texto (ex: se "texto" = "Luna encontrou um pássaro", e a palavra é "pássaro", posicao=4)
- "alternativas": EXATAMENTE 2 palavras erradas plausíveis — mesma categoria gramatical (substantivo ou adjetivo), mesmo gênero gramatical, que fariam sentido na frase mas não na história
- REGRA CRÍTICA: palavra_correta deve aparecer EXATAMENTE no texto da cena. Nunca use uma palavra que não esteja no "texto".

CAMPO "pergunta_pos_video":
- Cenas 1 e 3: "tipo": "multipla_escolha" com 2 opções para anos 1-2 ou 3 opções para anos 3-5; "resposta_correta": índice 0-based da resposta certa
- Cenas 2 e 4: "tipo": "emocao", "opcoes": ["😊", "😨", "😢", "😡"], "resposta_correta": 0 (ignorado)
- A pergunta deve ser direta e baseada EXCLUSIVAMENTE no texto escrito desta cena

CAMPO "pergunta_previsao":
- Gere para TODAS as 4 cenas (será exibido apenas entre cenas 2→3 e 3→4)
- "pergunta": pergunta criativa sobre o que pode acontecer a seguir
- "opcoes": EXATAMENTE 2 opções — uma deve ser o que realmente acontece (baseada na cena seguinte), outra deve ser uma previsão razoável mas incorreta. O aluno não é penalizado por qualquer escolha.


============================================================
REGRAS PARA MINIJOGOS_AQUECIMENTO (8 exercícios do modo história):
============================================================

Os 8 exercícios são apresentados na seguinte ordem:
1. lacunas (preencha lacunas com interpretação de texto)
2. forca
3. cruzadinha
4. cacapalavras (caça-palavras)
5. ordenar (ordene os eventos da história)
6. ligar (relacione as colunas)
7. verdadeiroFalso (V ou F com 4 afirmações)
8. gramatica (palavras caindo — clique na classe gramatical correta)

TODOS devem ter "textoContexto" com 1-2 linhas da história.

CAMPO "lacunas": DEVE usar o formato "paragrafos" com EXATAMENTE 2 parágrafos. Cada parágrafo tem "textoContexto", "frases" (EXATAMENTE 3 lacunas) e "emocao" (pergunta sobre emoção do personagem com 4 emojis). Foque em interpretação e habilidade BNCC. NUNCA use "frases" diretamente em "lacunas" — use SEMPRE "paragrafos". Veja o exemplo no JSON de schema acima.
CAMPO "forca": MAIÚSCULAS sem acentos, dica. textoContexto 1 linha. 4-8 letras anos 1-3, até 10 anos 4-5.
CAMPO "cruzadinha": 6 palavras (antônimos). textoContexto 2-3 frases com 6 palavras em **asteriscos**. MAIÚSCULAS sem acentos. Varie as palavras conforme ano escolar.
CAMPO "cacapalavras": grade 10x10, 5-6 palavras colocadas na HORIZONTAL, VERTICAL e DIAGONAL. textoContexto 2 linhas com palavras-alvo. MAIÚSCULAS sem acentos. As palavras devem estar REALMENTE inseridas na grade nas direções horizontal, vertical ou diagonal. Preencha o resto com letras aleatórias.
CAMPO "ordenar": 5 eventos ordem correta. textoContexto 1 linha.
CAMPO "ligar": 4 pares com "esquerda" e "direita" OBRIGATÓRIOS e preenchidos com texto real (NUNCA "Opção 1", "Opção 2"). textoContexto 1-2 linhas.
CAMPO "verdadeiroFalso": 4 afirmações com "correta" (boolean). textoContexto 2-3 linhas.
CAMPO "gramatica": "classeAlvo" + 8 palavras com "classe". textoContexto 1 linha. 1-2º=substantivo, 3-4º=adjetivo, 5º=verbo.
CAMPO "memoria": 4 pares sinônimos com "pares". textoContexto 1 linha.

` : ""}${hasStory ? "- Os exercícios devem ser baseados na HISTÓRIA que foi criada a partir da ideia do aluno" : ""}
${hasStory ? `- CRITICAL: Generate a "characterSheet" field with VERY DETAILED physical descriptions of ALL characters in English
- EVERY descricaoImagem MUST begin by repeating the full character appearance details from the characterSheet, then describe the scene action and setting.
- As storyPages devem ter descrições de imagem em INGLÊS, detalhadas, estilo watercolor/livro infantil` : ""}
- A história DEVE SEMPRE ter um final FELIZ e positivo. NUNCA gere histórias com finais tristes, sombrios ou negativos.
- NUNCA repita textos anteriores, gere sempre conteúdo novo e original
${hasStory ? "- TAMANHO DAS CENAS (CRÍTICO): O campo \"texto\" de CADA storyPage deve ter NO MÁXIMO 2 frases curtas e objetivas, aproximadamente 100 caracteres. Textos longos atrapalham a experiência do player de vídeo. Seja conciso e impactante." : ""}`;

    const userMessage = hasStory
      ? `Crie uma história de ${genero} para o ${ano}º ano baseada na ideia do aluno: "${historiaAluno}". Tema: ${temaDescricao}. A história DEVE conter elementos do gênero "${genero}" integrados na trama. Gere a história em 4 páginas e 5 exercícios (2 do gênero, 2 de interpretação BNCC, 1 de senso crítico).`
      : tema === "crie-voce-mesmo" && userPrompt
      ? `Crie uma atividade de ${genero} para o ${ano}º ano sobre: ${userPrompt}. Gere 5 exercícios (2 do gênero, 2 de interpretação BNCC, 1 de senso crítico).`
      : `Crie uma atividade de ${genero} para o ${ano}º ano com tema de ${temaDescricao}. O texto DEVE ser do gênero ${genero} com elementos típicos. Gere 5 exercícios (2 do gênero, 2 de interpretação BNCC, 1 de senso crítico). Seja criativo e original.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar atividade" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return new Response(JSON.stringify({ error: "Resposta vazia da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Robust JSON extraction
    let cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

    // Find JSON boundaries
    const jsonStart = cleaned.indexOf('{');
    if (jsonStart > 0) cleaned = cleaned.slice(jsonStart);

    // Try to repair truncated JSON by balancing braces/brackets
    function repairJson(str: string): string {
      let openBraces = 0, openBrackets = 0;
      let inString = false, escaped = false;
      for (const ch of str) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') openBraces++;
        if (ch === '}') openBraces--;
        if (ch === '[') openBrackets++;
        if (ch === ']') openBrackets--;
      }
      // Remove trailing comma before closing
      let repaired = str.replace(/,\s*$/, '');
      // Close unclosed strings if odd quote count
      const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
      if (quoteCount % 2 !== 0) repaired += '"';
      // Close brackets/braces
      while (openBrackets > 0) { repaired += ']'; openBrackets--; }
      while (openBraces > 0) { repaired += '}'; openBraces--; }
      return repaired;
    }

    let atividade;
    try {
      atividade = JSON.parse(cleaned);
    } catch {
      console.warn("Direct JSON parse failed, attempting repair...");
      try {
        const repaired = repairJson(cleaned);
        atividade = JSON.parse(repaired);
        console.log("JSON repair succeeded");
      } catch (e2) {
        console.error("JSON repair also failed. Content length:", cleaned.length, "First 500 chars:", cleaned.slice(0, 500));
        return new Response(JSON.stringify({ error: "A IA gerou uma resposta incompleta. Tente novamente." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    atividade.id = crypto.randomUUID();
    atividade.genero = genero;
    atividade.ano = ano;
    atividade.tema = tema;
    if (hasStory) atividade.historiaAluno = historiaAluno;

    return new Response(JSON.stringify(atividade), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-atividade error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
