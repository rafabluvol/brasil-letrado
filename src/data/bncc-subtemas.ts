// ============================================================
// BASE COMPLETA DE SUBTEMAS BNCC — Ensino Fundamental I
// Organizada por Ano → Tema → Subtemas
// ============================================================

export interface SubtemaBNCC {
  nome: string;
  variacoes: string[];
  tags: string[];
  nivel: "iniciante" | "intermediario" | "avancado";
  habilidades_bncc: string[];
}

export interface TemaBNCC {
  tema: string;
  subtemas: SubtemaBNCC[];
}

export interface AnoBNCC {
  ano: string;
  temas: TemaBNCC[];
}

export const BNCC_SUBTEMAS: AnoBNCC[] = [
  // ===================== 1º ANO =====================
  {
    ano: "1",
    temas: [
      {
        tema: "portugues",
        subtemas: [
          { nome: "Alfabeto e letras", variacoes: ["Conhecendo as letras", "O mundo das letras", "Brincando com o alfabeto"], tags: ["alfabetização", "letras"], nivel: "iniciante", habilidades_bncc: ["EF01LP01", "EF01LP02"] },
          { nome: "Vogais e consoantes", variacoes: ["As vogais do nosso dia", "Vogais e consoantes juntas", "Separando sons"], tags: ["fonética", "alfabetização"], nivel: "iniciante", habilidades_bncc: ["EF01LP05", "EF01LP06"] },
          { nome: "Sílabas simples", variacoes: ["Juntando letras", "Formando sílabas", "O som das sílabas"], tags: ["sílabas", "leitura"], nivel: "iniciante", habilidades_bncc: ["EF01LP05", "EF01LP07"] },
          { nome: "Nome próprio", variacoes: ["Meu nome é especial", "Escrevendo meu nome", "O nome dos meus amigos"], tags: ["identidade", "escrita"], nivel: "iniciante", habilidades_bncc: ["EF01LP02", "EF01LP04"] },
          { nome: "Rimas e sons", variacoes: ["Palavras que rimam", "Brincando de rimar", "Sons parecidos"], tags: ["fonética", "ludicidade"], nivel: "iniciante", habilidades_bncc: ["EF01LP09", "EF01LP10"] },
          { nome: "Parlendas e cantigas", variacoes: ["Cantando e aprendendo", "Parlendas divertidas", "Cantigas populares"], tags: ["oralidade", "tradição"], nivel: "iniciante", habilidades_bncc: ["EF01LP01", "EF01LP19"] },
        ],
      },
      {
        tema: "geografia",
        subtemas: [
          { nome: "Minha casa", variacoes: ["Onde eu moro", "Os cômodos da casa", "A casa de cada um"], tags: ["moradia", "espaço"], nivel: "iniciante", habilidades_bncc: ["EF01GE01"] },
          { nome: "Minha escola", variacoes: ["Conhecendo a escola", "Os espaços da escola", "A escola por dentro"], tags: ["escola", "espaço"], nivel: "iniciante", habilidades_bncc: ["EF01GE01", "EF01GE02"] },
          { nome: "Meu bairro", variacoes: ["O bairro onde moro", "Passeando pelo bairro", "Lugares do meu bairro"], tags: ["comunidade", "localização"], nivel: "iniciante", habilidades_bncc: ["EF01GE02", "EF01GE03"] },
          { nome: "Dia e noite", variacoes: ["Quando o sol aparece", "O dia e a noite", "Manhã, tarde e noite"], tags: ["tempo", "natureza"], nivel: "iniciante", habilidades_bncc: ["EF01GE05"] },
          { nome: "O tempo e o clima", variacoes: ["Sol, chuva e vento", "Como está o tempo hoje", "Dias de sol e chuva"], tags: ["clima", "natureza"], nivel: "iniciante", habilidades_bncc: ["EF01GE04"] },
        ],
      },
      {
        tema: "historia",
        subtemas: [
          { nome: "Minha história", variacoes: ["De onde eu vim", "A história da minha vida", "Quem sou eu"], tags: ["identidade", "família"], nivel: "iniciante", habilidades_bncc: ["EF01HI01", "EF01HI02"] },
          { nome: "Minha família", variacoes: ["As pessoas da minha família", "Minha família é especial", "Famílias diferentes"], tags: ["família", "diversidade"], nivel: "iniciante", habilidades_bncc: ["EF01HI02", "EF01HI03"] },
          { nome: "Brinquedos e brincadeiras", variacoes: ["Brinquedos de ontem e hoje", "Como se brincava antigamente", "Brincadeiras do tempo da vovó"], tags: ["cultura", "tradição"], nivel: "iniciante", habilidades_bncc: ["EF01HI05", "EF01HI06"] },
          { nome: "Festas e tradições", variacoes: ["Festas que a gente celebra", "Tradições da minha família", "Comemorações especiais"], tags: ["cultura", "tradição"], nivel: "iniciante", habilidades_bncc: ["EF01HI06"] },
        ],
      },
      {
        tema: "ciencias",
        subtemas: [
          { nome: "Partes do corpo", variacoes: ["Conhecendo nosso corpo", "Cabeça, tronco e membros", "Para que servem as partes do corpo"], tags: ["corpo", "saúde"], nivel: "iniciante", habilidades_bncc: ["EF01CI02", "EF01CI03"] },
          { nome: "Os cinco sentidos", variacoes: ["Vendo, ouvindo e sentindo", "Nossos sentidos", "Explorando os sentidos"], tags: ["sentidos", "corpo"], nivel: "iniciante", habilidades_bncc: ["EF01CI02"] },
          { nome: "Animais domésticos", variacoes: ["Nossos amigos animais", "Bichinhos de estimação", "Cuidando dos animais"], tags: ["animais", "natureza"], nivel: "iniciante", habilidades_bncc: ["EF01CI04"] },
          { nome: "Plantas ao redor", variacoes: ["As plantas da escola", "Cuidando das plantas", "Como as plantas vivem"], tags: ["plantas", "natureza"], nivel: "iniciante", habilidades_bncc: ["EF01CI04", "EF01CI05"] },
          { nome: "Luz e sombra", variacoes: ["Brincando com sombras", "De onde vem a luz", "Sol e sombra"], tags: ["luz", "fenômenos"], nivel: "iniciante", habilidades_bncc: ["EF01CI05"] },
        ],
      },
      {
        tema: "atualidades",
        subtemas: [
          { nome: "Cuidados com a natureza", variacoes: ["Protegendo o planeta", "O que podemos fazer pela Terra", "Natureza e cuidado"], tags: ["meio-ambiente", "cidadania"], nivel: "iniciante", habilidades_bncc: ["EF01GE04"] },
          { nome: "Animais em perigo", variacoes: ["Animais que precisam de ajuda", "Bichos em extinção", "Salvando os animais"], tags: ["animais", "meio-ambiente"], nivel: "iniciante", habilidades_bncc: ["EF01CI04"] },
          { nome: "Reciclagem", variacoes: ["Lixo no lugar certo", "Reciclando e cuidando", "Separar para reciclar"], tags: ["reciclagem", "sustentabilidade"], nivel: "iniciante", habilidades_bncc: ["EF01GE04"] },
        ],
      },
      {
        tema: "inteligencia-artificial",
        subtemas: [
          { nome: "O que é um robô?", variacoes: ["Robôs ao nosso redor", "Máquinas inteligentes", "Amigos robôs"], tags: ["robótica", "introdução"], nivel: "iniciante", habilidades_bncc: ["EF01HI04"] },
          { nome: "Computadores e telas", variacoes: ["O mundo das telas", "Como funciona o computador", "Tecnologia no dia a dia"], tags: ["tecnologia", "computadores"], nivel: "iniciante", habilidades_bncc: ["EF01HI04"] },
          { nome: "Jogos e tecnologia", variacoes: ["Brincando com tecnologia", "Jogos digitais", "Aprendendo com jogos"], tags: ["jogos", "diversão"], nivel: "iniciante", habilidades_bncc: ["EF01HI04"] },
        ],
      },
    ],
  },

  // ===================== 2º ANO =====================
  {
    ano: "2",
    temas: [
      {
        tema: "portugues",
        subtemas: [
          { nome: "Formação de palavras", variacoes: ["Como as palavras nascem", "Juntando sílabas", "Construindo palavras"], tags: ["sílabas", "escrita"], nivel: "iniciante", habilidades_bncc: ["EF02LP03", "EF02LP04"] },
          { nome: "Sinais de pontuação", variacoes: ["O ponto e a vírgula", "Para que servem os sinais", "Pontuando direitinho"], tags: ["pontuação", "escrita"], nivel: "iniciante", habilidades_bncc: ["EF02LP09"] },
          { nome: "Ordem alfabética", variacoes: ["Organizando por ordem", "O dicionário e o ABC", "Seguindo o alfabeto"], tags: ["alfabeto", "organização"], nivel: "iniciante", habilidades_bncc: ["EF02LP06"] },
          { nome: "Substantivos simples", variacoes: ["Nomes das coisas", "O que é substantivo", "Tudo tem um nome"], tags: ["gramática", "substantivos"], nivel: "iniciante", habilidades_bncc: ["EF02LP07"] },
          { nome: "Leitura de histórias curtas", variacoes: ["Lendo histórias divertidas", "Pequenas histórias", "Leitura prazerosa"], tags: ["leitura", "narrativa"], nivel: "iniciante", habilidades_bncc: ["EF02LP26", "EF02LP28"] },
        ],
      },
      {
        tema: "geografia",
        subtemas: [
          { nome: "Paisagens naturais e modificadas", variacoes: ["O que a natureza criou", "Mudanças na paisagem", "Antes e depois da paisagem"], tags: ["paisagem", "transformação"], nivel: "iniciante", habilidades_bncc: ["EF02GE04"] },
          { nome: "Meios de transporte", variacoes: ["Como as pessoas se locomovem", "Transportes do dia a dia", "De ônibus, carro ou bicicleta"], tags: ["transporte", "mobilidade"], nivel: "iniciante", habilidades_bncc: ["EF02GE03"] },
          { nome: "Água no dia a dia", variacoes: ["A importância da água", "Água para todos", "Economizando água"], tags: ["água", "sustentabilidade"], nivel: "iniciante", habilidades_bncc: ["EF02GE04"] },
          { nome: "Zona rural e urbana", variacoes: ["Cidade e campo", "Diferenças entre campo e cidade", "Vida no campo e na cidade"], tags: ["espaço", "sociedade"], nivel: "intermediario", habilidades_bncc: ["EF02GE02", "EF02GE03"] },
        ],
      },
      {
        tema: "historia",
        subtemas: [
          { nome: "A comunidade", variacoes: ["Minha comunidade", "Pessoas do meu bairro", "Vivendo juntos"], tags: ["comunidade", "sociedade"], nivel: "iniciante", habilidades_bncc: ["EF02HI01", "EF02HI03"] },
          { nome: "Profissões", variacoes: ["O que as pessoas fazem", "Profissões do dia a dia", "Quando eu crescer"], tags: ["trabalho", "sociedade"], nivel: "iniciante", habilidades_bncc: ["EF02HI02"] },
          { nome: "Linha do tempo pessoal", variacoes: ["Minha vida em ordem", "O que já aconteceu comigo", "Do bebê até agora"], tags: ["tempo", "identidade"], nivel: "iniciante", habilidades_bncc: ["EF02HI06"] },
          { nome: "Festas populares", variacoes: ["Festas do Brasil", "Comemorações populares", "Festas de cada região"], tags: ["cultura", "tradição"], nivel: "intermediario", habilidades_bncc: ["EF02HI04", "EF02HI05"] },
        ],
      },
      {
        tema: "ciencias",
        subtemas: [
          { nome: "Seres vivos e não vivos", variacoes: ["O que tem vida e o que não tem", "Vivo ou não vivo", "Diferenças na natureza"], tags: ["classificação", "natureza"], nivel: "iniciante", habilidades_bncc: ["EF02CI04"] },
          { nome: "Ciclo de vida das plantas", variacoes: ["Da semente à flor", "Como as plantas crescem", "A vida de uma planta"], tags: ["plantas", "ciclo"], nivel: "iniciante", habilidades_bncc: ["EF02CI05"] },
          { nome: "Alimentação saudável", variacoes: ["Comer bem faz bem", "O prato colorido", "Alimentos que nos fazem crescer"], tags: ["alimentação", "saúde"], nivel: "iniciante", habilidades_bncc: ["EF02CI03"] },
          { nome: "Estados da água", variacoes: ["Água líquida, sólida e gasosa", "As mudanças da água", "Gelo, água e vapor"], tags: ["água", "estados-físicos"], nivel: "intermediario", habilidades_bncc: ["EF02CI01", "EF02CI02"] },
        ],
      },
      {
        tema: "atualidades",
        subtemas: [
          { nome: "Poluição", variacoes: ["O ar e a poluição", "Poluição no nosso mundo", "Como combater a poluição"], tags: ["meio-ambiente", "saúde"], nivel: "iniciante", habilidades_bncc: ["EF02GE04"] },
          { nome: "Tecnologia e crianças", variacoes: ["O mundo digital", "Usando a tecnologia com cuidado", "Telas e brincadeiras"], tags: ["tecnologia", "cidadania-digital"], nivel: "iniciante", habilidades_bncc: ["EF02HI02"] },
          { nome: "Economia de energia", variacoes: ["Apagando a luz", "Energia e consumo", "Economizando energia em casa"], tags: ["energia", "sustentabilidade"], nivel: "iniciante", habilidades_bncc: ["EF02GE04"] },
        ],
      },
      {
        tema: "inteligencia-artificial",
        subtemas: [
          { nome: "Assistentes virtuais", variacoes: ["Alexa, Siri e amigos digitais", "Falando com máquinas", "Assistentes que ajudam"], tags: ["assistentes", "voz"], nivel: "iniciante", habilidades_bncc: ["EF02HI03"] },
          { nome: "Como os computadores aprendem", variacoes: ["Máquinas que aprendem", "Ensinando o computador", "Inteligência das máquinas"], tags: ["machine-learning", "aprendizado"], nivel: "iniciante", habilidades_bncc: ["EF02HI04"] },
          { nome: "Segurança na internet", variacoes: ["Navegando com segurança", "Cuidados online", "Proteção digital"], tags: ["segurança", "internet"], nivel: "iniciante", habilidades_bncc: ["EF02GE04"] },
        ],
      },
    ],
  },

  // ===================== 3º ANO =====================
  {
    ano: "3",
    temas: [
      {
        tema: "portugues",
        subtemas: [
          { nome: "Adjetivos", variacoes: ["Palavras que descrevem", "Qualidades das coisas", "Como descrever o mundo"], tags: ["gramática", "adjetivos"], nivel: "intermediario", habilidades_bncc: ["EF03LP07", "EF03LP08"] },
          { nome: "Verbos no presente e passado", variacoes: ["O que está acontecendo e o que já foi", "Ações no tempo", "Presente e passado dos verbos"], tags: ["gramática", "verbos"], nivel: "intermediario", habilidades_bncc: ["EF03LP08"] },
          { nome: "Parágrafos e organização", variacoes: ["Escrevendo em parágrafos", "Organizando as ideias", "Cada ideia em seu lugar"], tags: ["escrita", "organização"], nivel: "intermediario", habilidades_bncc: ["EF03LP21", "EF03LP22"] },
          { nome: "Inferência textual", variacoes: ["Lendo nas entrelinhas", "O que o texto quer dizer", "Descobrindo sentidos ocultos"], tags: ["interpretação", "inferência"], nivel: "intermediario", habilidades_bncc: ["EF03LP01", "EF35LP04"] },
          { nome: "Elementos da narrativa", variacoes: ["Personagens e cenários", "Início, meio e fim", "Como uma história é feita"], tags: ["narrativa", "estrutura"], nivel: "intermediario", habilidades_bncc: ["EF35LP29"] },
        ],
      },
      {
        tema: "geografia",
        subtemas: [
          { nome: "Tipos de solo", variacoes: ["Conhecendo os solos", "O solo no nosso dia a dia", "Para que serve o solo"], tags: ["natureza", "ambiente"], nivel: "intermediario", habilidades_bncc: ["EF03GE05"] },
          { nome: "Relevo brasileiro", variacoes: ["Montanhas, planícies e planaltos", "As formas da Terra", "O relevo do Brasil"], tags: ["relevo", "geografia-física"], nivel: "intermediario", habilidades_bncc: ["EF03GE04"] },
          { nome: "Rios e bacias hidrográficas", variacoes: ["Os rios do Brasil", "De onde vem a água dos rios", "Rios que banham nosso país"], tags: ["hidrografia", "água"], nivel: "intermediario", habilidades_bncc: ["EF03GE05"] },
          { nome: "Mapas e localização", variacoes: ["Aprendendo a ler mapas", "Onde fica no mapa", "Rosa dos ventos e direções"], tags: ["cartografia", "localização"], nivel: "intermediario", habilidades_bncc: ["EF03GE06", "EF03GE07"] },
          { nome: "Regiões do Brasil", variacoes: ["As cinco regiões brasileiras", "Conhecendo cada região", "Norte, Sul, Leste e Oeste"], tags: ["regiões", "Brasil"], nivel: "intermediario", habilidades_bncc: ["EF03GE02"] },
        ],
      },
      {
        tema: "historia",
        subtemas: [
          { nome: "Povos indígenas", variacoes: ["Os primeiros habitantes", "A cultura dos povos indígenas", "Indígenas do Brasil"], tags: ["indígenas", "cultura"], nivel: "intermediario", habilidades_bncc: ["EF03HI01", "EF03HI03"] },
          { nome: "Povos africanos", variacoes: ["A herança africana no Brasil", "Cultura afro-brasileira", "A contribuição dos povos africanos"], tags: ["afro-brasileira", "diversidade"], nivel: "intermediario", habilidades_bncc: ["EF03HI01", "EF03HI03"] },
          { nome: "Formação do município", variacoes: ["Como surgiu nossa cidade", "A história do nosso município", "Cidade e sua origem"], tags: ["município", "história-local"], nivel: "intermediario", habilidades_bncc: ["EF03HI04", "EF03HI05"] },
          { nome: "Patrimônio cultural", variacoes: ["O que é patrimônio cultural", "Tesouros da nossa cultura", "Preservando a história"], tags: ["patrimônio", "cultura"], nivel: "intermediario", habilidades_bncc: ["EF03HI06"] },
        ],
      },
      {
        tema: "ciencias",
        subtemas: [
          { nome: "Cadeia alimentar", variacoes: ["Quem come quem", "A teia da vida", "Predadores e presas"], tags: ["ecologia", "animais"], nivel: "intermediario", habilidades_bncc: ["EF03CI04", "EF03CI05"] },
          { nome: "Habitat dos animais", variacoes: ["Onde os animais vivem", "Cada bicho no seu lugar", "A casa dos animais"], tags: ["habitat", "ecologia"], nivel: "intermediario", habilidades_bncc: ["EF03CI04"] },
          { nome: "Propriedades dos materiais", variacoes: ["Duro, mole, leve e pesado", "De que são feitas as coisas", "Materiais ao nosso redor"], tags: ["materiais", "propriedades"], nivel: "intermediario", habilidades_bncc: ["EF03CI01", "EF03CI02"] },
          { nome: "Sons e vibrações", variacoes: ["De onde vem o som", "O mundo dos sons", "Sons graves e agudos"], tags: ["som", "física"], nivel: "intermediario", habilidades_bncc: ["EF03CI03"] },
          { nome: "Terra e seus movimentos", variacoes: ["A Terra gira", "Rotação e translação", "Por que existem os dias e as noites"], tags: ["astronomia", "Terra"], nivel: "intermediario", habilidades_bncc: ["EF03CI08"] },
        ],
      },
      {
        tema: "atualidades",
        subtemas: [
          { nome: "Aquecimento global", variacoes: ["O planeta está esquentando", "Mudanças no clima", "O que é aquecimento global"], tags: ["clima", "meio-ambiente"], nivel: "intermediario", habilidades_bncc: ["EF03GE05"] },
          { nome: "Desmatamento", variacoes: ["Florestas em perigo", "Por que as árvores são cortadas", "Protegendo as florestas"], tags: ["florestas", "sustentabilidade"], nivel: "intermediario", habilidades_bncc: ["EF03GE05"] },
          { nome: "Direitos humanos", variacoes: ["Todos merecem respeito", "Direitos de cada pessoa", "Igualdade e justiça"], tags: ["direitos", "cidadania"], nivel: "intermediario", habilidades_bncc: ["EF03HI06"] },
        ],
      },
      {
        tema: "inteligencia-artificial",
        subtemas: [
          { nome: "História da Inteligência Artificial", variacoes: ["Como surgiu a IA", "Os primeiros robôs pensantes", "A evolução das máquinas"], tags: ["história", "IA"], nivel: "intermediario", habilidades_bncc: ["EF03HI01", "EF03HI03"] },
          { nome: "O que são algoritmos", variacoes: ["Passo a passo das máquinas", "Receitas para computadores", "Algoritmos do dia a dia"], tags: ["algoritmos", "lógica"], nivel: "intermediario", habilidades_bncc: ["EF03HI04"] },
          { nome: "IA na vida real", variacoes: ["IA no celular", "Tecnologia ao nosso redor", "Máquinas que nos ajudam"], tags: ["aplicações", "cotidiano"], nivel: "intermediario", habilidades_bncc: ["EF03HI01"] },
        ],
      },
    ],
  },

  // ===================== 4º ANO =====================
  {
    ano: "4",
    temas: [
      {
        tema: "portugues",
        subtemas: [
          { nome: "Figuras de linguagem", variacoes: ["Comparação e metáfora", "Quando as palavras brincam", "Linguagem figurada"], tags: ["figuras-de-linguagem", "estilística"], nivel: "intermediario", habilidades_bncc: ["EF04LP01", "EF35LP05"] },
          { nome: "Concordância verbal", variacoes: ["Sujeito e verbo combinados", "Fazendo o verbo concordar", "Quando o verbo muda"], tags: ["gramática", "concordância"], nivel: "intermediario", habilidades_bncc: ["EF04LP06", "EF04LP07"] },
          { nome: "Pronomes", variacoes: ["Palavras que substituem", "Eu, tu, ele e os pronomes", "Usando pronomes no texto"], tags: ["gramática", "pronomes"], nivel: "intermediario", habilidades_bncc: ["EF04LP06"] },
          { nome: "Gêneros textuais diversos", variacoes: ["Carta, notícia e poema", "Tipos de texto", "Para cada situação, um gênero"], tags: ["gêneros", "leitura"], nivel: "intermediario", habilidades_bncc: ["EF04LP13", "EF04LP14"] },
          { nome: "Coerência e coesão", variacoes: ["Textos que fazem sentido", "Conectando ideias", "Palavras de ligação"], tags: ["escrita", "coesão"], nivel: "avancado", habilidades_bncc: ["EF04LP11", "EF04LP12"] },
        ],
      },
      {
        tema: "geografia",
        subtemas: [
          { nome: "Biomas brasileiros", variacoes: ["Os biomas do Brasil", "Cerrado, Amazônia e mais", "Conhecendo nossos biomas"], tags: ["biomas", "biodiversidade"], nivel: "intermediario", habilidades_bncc: ["EF04GE04", "EF04GE05"] },
          { nome: "Migração e população", variacoes: ["Por que as pessoas se mudam", "Migrações no Brasil", "De um lugar para outro"], tags: ["migração", "população"], nivel: "intermediario", habilidades_bncc: ["EF04GE02", "EF04GE03"] },
          { nome: "Atividades econômicas", variacoes: ["O trabalho nas regiões", "Agricultura, indústria e comércio", "Como as regiões produzem"], tags: ["economia", "trabalho"], nivel: "intermediario", habilidades_bncc: ["EF04GE07", "EF04GE08"] },
          { nome: "Impactos ambientais", variacoes: ["Quando o ser humano muda a natureza", "Problemas ambientais", "Cuidando do planeta"], tags: ["meio-ambiente", "impactos"], nivel: "avancado", habilidades_bncc: ["EF04GE09", "EF04GE11"] },
        ],
      },
      {
        tema: "historia",
        subtemas: [
          { nome: "Grandes navegações", variacoes: ["As viagens pelo mar", "Navegadores e descobertas", "Cruzando os oceanos"], tags: ["navegações", "exploração"], nivel: "intermediario", habilidades_bncc: ["EF04HI01", "EF04HI02"] },
          { nome: "Chegada dos portugueses", variacoes: ["1500: a chegada ao Brasil", "Os portugueses no novo mundo", "O encontro de culturas"], tags: ["colonização", "Brasil"], nivel: "intermediario", habilidades_bncc: ["EF04HI04", "EF04HI05"] },
          { nome: "Escravidão no Brasil", variacoes: ["A história da escravidão", "Resistência e luta pela liberdade", "Zumbi e a luta dos escravizados"], tags: ["escravidão", "resistência"], nivel: "avancado", habilidades_bncc: ["EF04HI06", "EF04HI07"] },
          { nome: "Independência do Brasil", variacoes: ["O Brasil se torna independente", "O grito do Ipiranga", "Da colônia à nação"], tags: ["independência", "política"], nivel: "avancado", habilidades_bncc: ["EF04HI07", "EF04HI08"] },
        ],
      },
      {
        tema: "ciencias",
        subtemas: [
          { nome: "Sistema solar", variacoes: ["Os planetas do sistema solar", "O sol e seus vizinhos", "Viajando pelo espaço"], tags: ["astronomia", "planetas"], nivel: "intermediario", habilidades_bncc: ["EF04CI09", "EF04CI10"] },
          { nome: "Fases da lua", variacoes: ["As fases da lua", "Por que a lua muda", "Nova, crescente, cheia e minguante"], tags: ["lua", "astronomia"], nivel: "intermediario", habilidades_bncc: ["EF04CI10"] },
          { nome: "Transformações químicas", variacoes: ["Mudanças nos materiais", "Quando a matéria se transforma", "Mistura e transformação"], tags: ["química", "materiais"], nivel: "intermediario", habilidades_bncc: ["EF04CI01", "EF04CI02"] },
          { nome: "Ciclo da água", variacoes: ["A viagem da água", "Evaporação, condensação e precipitação", "A água em movimento"], tags: ["água", "ciclos"], nivel: "intermediario", habilidades_bncc: ["EF04CI03"] },
          { nome: "Preservação ambiental", variacoes: ["Protegendo ecossistemas", "Por que preservar a natureza", "Ações para um mundo melhor"], tags: ["ecologia", "preservação"], nivel: "avancado", habilidades_bncc: ["EF04CI06", "EF04CI07"] },
        ],
      },
      {
        tema: "atualidades",
        subtemas: [
          { nome: "Fontes de energia", variacoes: ["Energia solar e eólica", "De onde vem a energia", "Energias limpas e renováveis"], tags: ["energia", "sustentabilidade"], nivel: "intermediario", habilidades_bncc: ["EF04CI07"] },
          { nome: "Fake news", variacoes: ["Notícias falsas na internet", "Como identificar fake news", "Verdade ou mentira?"], tags: ["mídia", "pensamento-crítico"], nivel: "intermediario", habilidades_bncc: ["EF04LP15"] },
          { nome: "Olimpíadas e esportes", variacoes: ["O espírito olímpico", "Esportes e competições", "Histórias de atletas brasileiros"], tags: ["esportes", "cultura"], nivel: "intermediario", habilidades_bncc: ["EF04HI08"] },
        ],
      },
      {
        tema: "inteligencia-artificial",
        subtemas: [
          { nome: "Prompts e comandos para IA", variacoes: ["Conversando com a IA", "Como pedir para a máquina", "A arte dos prompts"], tags: ["prompts", "comunicação"], nivel: "intermediario", habilidades_bncc: ["EF04HI08"] },
          { nome: "IA e criatividade", variacoes: ["Desenhando com IA", "Música feita por máquinas", "Arte e tecnologia juntas"], tags: ["criatividade", "arte"], nivel: "avancado", habilidades_bncc: ["EF04HI06"] },
          { nome: "Ética e Inteligência Artificial", variacoes: ["IA pode errar?", "Máquinas justas", "Responsabilidade com tecnologia"], tags: ["ética", "responsabilidade"], nivel: "intermediario", habilidades_bncc: ["EF04HI06", "EF04HI07"] },
        ],
      },
    ],
  },

  // ===================== 5º ANO =====================
  {
    ano: "5",
    temas: [
      {
        tema: "portugues",
        subtemas: [
          { nome: "Análise de crônicas", variacoes: ["A arte da crônica", "Crônicas do cotidiano", "Lendo e entendendo crônicas"], tags: ["crônicas", "interpretação"], nivel: "avancado", habilidades_bncc: ["EF05LP01", "EF35LP03"] },
          { nome: "Argumentação", variacoes: ["Defendendo ideias", "Como argumentar bem", "Opinião e argumento"], tags: ["argumentação", "escrita"], nivel: "avancado", habilidades_bncc: ["EF05LP15", "EF35LP15"] },
          { nome: "Orações e períodos", variacoes: ["Frases simples e compostas", "Ligando orações", "Períodos e conectivos"], tags: ["sintaxe", "gramática"], nivel: "avancado", habilidades_bncc: ["EF05LP06", "EF05LP07"] },
          { nome: "Recursos de coesão textual", variacoes: ["Conectivos e referências", "Amarrando o texto", "Palavras que ligam ideias"], tags: ["coesão", "escrita"], nivel: "avancado", habilidades_bncc: ["EF05LP12", "EF05LP13"] },
          { nome: "Interpretação crítica", variacoes: ["Lendo com olhar crítico", "O que o autor quis dizer", "Além das palavras"], tags: ["interpretação", "pensamento-crítico"], nivel: "avancado", habilidades_bncc: ["EF05LP01", "EF35LP04"] },
        ],
      },
      {
        tema: "geografia",
        subtemas: [
          { nome: "Continentes e oceanos", variacoes: ["Os continentes do mundo", "Conhecendo os oceanos", "A Terra e seus continentes"], tags: ["mundo", "cartografia"], nivel: "avancado", habilidades_bncc: ["EF05GE01", "EF05GE02"] },
          { nome: "Urbanização", variacoes: ["O crescimento das cidades", "Da vila à metrópole", "Problemas urbanos"], tags: ["urbanização", "sociedade"], nivel: "avancado", habilidades_bncc: ["EF05GE03", "EF05GE04"] },
          { nome: "Globalização", variacoes: ["O mundo conectado", "Globalização e seus efeitos", "Tudo está ligado"], tags: ["globalização", "economia"], nivel: "avancado", habilidades_bncc: ["EF05GE06"] },
          { nome: "Recursos naturais", variacoes: ["Riquezas da natureza", "Exploração de recursos", "Recursos renováveis e não renováveis"], tags: ["recursos", "sustentabilidade"], nivel: "avancado", habilidades_bncc: ["EF05GE07", "EF05GE09"] },
          { nome: "Questões ambientais globais", variacoes: ["Problemas ambientais no mundo", "O futuro do planeta", "Soluções para o meio ambiente"], tags: ["ambiente", "global"], nivel: "avancado", habilidades_bncc: ["EF05GE10", "EF05GE12"] },
        ],
      },
      {
        tema: "historia",
        subtemas: [
          { nome: "República brasileira", variacoes: ["O Brasil virou república", "Da monarquia à república", "Proclamação da República"], tags: ["república", "política"], nivel: "avancado", habilidades_bncc: ["EF05HI01", "EF05HI02"] },
          { nome: "Era Vargas", variacoes: ["Getúlio Vargas e sua era", "O Brasil de Vargas", "Mudanças na era Vargas"], tags: ["política", "história-contemporânea"], nivel: "avancado", habilidades_bncc: ["EF05HI03"] },
          { nome: "Direitos civis no Brasil", variacoes: ["A luta por direitos", "Movimentos sociais brasileiros", "Conquistas da cidadania"], tags: ["direitos", "movimentos-sociais"], nivel: "avancado", habilidades_bncc: ["EF05HI04", "EF05HI06"] },
          { nome: "Imigração no Brasil", variacoes: ["Povos que vieram ao Brasil", "A história da imigração", "Italianos, japoneses e outros"], tags: ["imigração", "diversidade"], nivel: "avancado", habilidades_bncc: ["EF05HI03", "EF05HI04"] },
          { nome: "Abolição da escravatura", variacoes: ["O fim da escravidão", "A luta pela liberdade", "Lei Áurea e suas consequências"], tags: ["abolição", "história"], nivel: "avancado", habilidades_bncc: ["EF05HI06"] },
        ],
      },
      {
        tema: "ciencias",
        subtemas: [
          { nome: "Sistemas do corpo humano", variacoes: ["Como nosso corpo funciona", "Digestão, respiração e circulação", "Os sistemas que nos mantêm vivos"], tags: ["corpo-humano", "sistemas"], nivel: "avancado", habilidades_bncc: ["EF05CI06", "EF05CI07"] },
          { nome: "Nutrição e saúde", variacoes: ["Comer bem para viver bem", "Nutrientes e seus papéis", "Alimentação e qualidade de vida"], tags: ["nutrição", "saúde"], nivel: "intermediario", habilidades_bncc: ["EF05CI08", "EF05CI09"] },
          { nome: "Ecossistemas", variacoes: ["A teia da vida nos ecossistemas", "Interações na natureza", "Equilíbrio ecológico"], tags: ["ecologia", "ecossistemas"], nivel: "avancado", habilidades_bncc: ["EF05CI04"] },
          { nome: "Ciclos biogeoquímicos", variacoes: ["O ciclo do carbono", "Ciclos da natureza", "Como a matéria circula"], tags: ["ciclos", "natureza"], nivel: "avancado", habilidades_bncc: ["EF05CI04", "EF05CI05"] },
          { nome: "Tecnologia e saúde", variacoes: ["Medicina e tecnologia", "Inventos que salvam vidas", "Ciência a serviço da saúde"], tags: ["tecnologia", "saúde"], nivel: "avancado", habilidades_bncc: ["EF05CI09"] },
        ],
      },
      {
        tema: "atualidades",
        subtemas: [
          { nome: "Inteligência artificial", variacoes: ["O que é IA", "Máquinas que aprendem", "Robôs e inteligência artificial"], tags: ["tecnologia", "futuro"], nivel: "avancado", habilidades_bncc: ["EF05CI09"] },
          { nome: "Mudanças climáticas", variacoes: ["O clima está mudando", "Consequências do aquecimento global", "O que podemos fazer pelo clima"], tags: ["clima", "sustentabilidade"], nivel: "avancado", habilidades_bncc: ["EF05GE10"] },
          { nome: "Direitos digitais", variacoes: ["Segurança na internet", "Privacidade online", "Ser cidadão digital"], tags: ["tecnologia", "cidadania-digital"], nivel: "avancado", habilidades_bncc: ["EF05HI04"] },
          { nome: "Sustentabilidade", variacoes: ["Desenvolvimento sustentável", "Consumo consciente", "Construindo um futuro melhor"], tags: ["sustentabilidade", "meio-ambiente"], nivel: "avancado", habilidades_bncc: ["EF05GE12"] },
        ],
      },
      {
        tema: "inteligencia-artificial",
        subtemas: [
          { nome: "Redes neurais e cérebro humano", variacoes: ["Máquinas que imitam o cérebro", "Como a IA pensa", "Neurônios artificiais"], tags: ["redes-neurais", "cérebro"], nivel: "avancado", habilidades_bncc: ["EF05HI04"] },
          { nome: "O futuro com IA", variacoes: ["Como será o amanhã", "Profissões do futuro", "Tecnologia e sociedade"], tags: ["futuro", "sociedade"], nivel: "avancado", habilidades_bncc: ["EF05HI04", "EF05HI06"] },
          { nome: "Grandes inventores da tecnologia", variacoes: ["Quem criou a internet", "Pioneiros da computação", "Heróis da tecnologia"], tags: ["inventores", "história"], nivel: "avancado", habilidades_bncc: ["EF05HI06"] },
          { nome: "Programação e lógica", variacoes: ["Pensando como programador", "Códigos e comandos", "Lógica de programação"], tags: ["programação", "lógica"], nivel: "avancado", habilidades_bncc: ["EF05HI04"] },
        ],
      },
    ],
  },
];

// ============================================================
// Helpers para buscar subtemas
// ============================================================

export function getSubtemasPorAnoETema(ano: string, tema: string): SubtemaBNCC[] {
  const anoData = BNCC_SUBTEMAS.find((a) => a.ano === ano);
  if (!anoData) return [];
  const temaData = anoData.temas.find((t) => t.tema === tema);
  return temaData?.subtemas || [];
}

export function getSubtemaAleatorio(
  ano: string,
  tema: string,
  excluir: string[] = []
): SubtemaBNCC | null {
  const subtemas = getSubtemasPorAnoETema(ano, tema);
  const disponiveis = subtemas.filter((s) => !excluir.includes(s.nome));
  if (disponiveis.length === 0) {
    // If all excluded, reset and pick any
    if (subtemas.length === 0) return null;
    return subtemas[Math.floor(Math.random() * subtemas.length)];
  }
  return disponiveis[Math.floor(Math.random() * disponiveis.length)];
}

export function getVariacaoAleatoria(subtema: SubtemaBNCC): string {
  const all = [subtema.nome, ...subtema.variacoes];
  return all[Math.floor(Math.random() * all.length)];
}

export function getAllTemas(): string[] {
  return ["portugues", "geografia", "historia", "ciencias", "atualidades", "inteligencia-artificial"];
}
