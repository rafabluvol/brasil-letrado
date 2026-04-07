import { motion } from "framer-motion";
import { ShieldCheck, BookOpen, FileText, CheckCircle2, ExternalLink, GraduationCap, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import BNCCBrowser from "@/components/BNCCBrowser";

const PRINCIPIOS = [
  {
    icon: BookOpen,
    title: "Gêneros Textuais Reais",
    desc: "Todas as atividades utilizam gêneros textuais previstos pela BNCC para cada ano escolar: parlendas, fábulas, contos, notícias, crônicas e mais.",
  },
  {
    icon: GraduationCap,
    title: "Progressão por Ano Escolar",
    desc: "O conteúdo respeita a progressão de complexidade definida pela BNCC, do 1º ao 5º ano do Ensino Fundamental I.",
  },
  {
    icon: ShieldCheck,
    title: "Habilidades Rastreáveis",
    desc: "Cada exercício está vinculado a uma ou mais habilidades da BNCC (ex: EF03LP01), permitindo rastreamento e auditoria completa.",
  },
  {
    icon: Scale,
    title: "Interpretação como Prioridade",
    desc: "80% do foco em compreensão e interpretação textual, conforme orientação da BNCC para o desenvolvimento de leitura crítica.",
  },
];

export default function BNCC() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 badge-xp mb-6 text-sm">
              <ShieldCheck size={16} />
              Documento Oficial de Conformidade
            </div>
            <h1 className="text-4xl md:text-5xl font-display text-foreground leading-tight mb-4">
              Brasil Letrado é <span className="text-primary">100% alinhada à BNCC</span>
            </h1>
            <p className="text-lg text-muted-foreground font-semibold max-w-2xl mx-auto">
               Este documento comprova o alinhamento integral da plataforma Brasil Letrado com a Base Nacional Comum Curricular (BNCC), 
               conforme estabelecido pela <strong>Lei nº 13.415/2017</strong> e <strong>Resolução CNE/CP nº 2/2017</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Selo de conformidade */}
      <section className="container -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-edu max-w-3xl mx-auto text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h2 className="font-display text-2xl text-foreground mb-2">Declaração de Conformidade</h2>
          <div className="bg-muted rounded-xl p-6 text-left space-y-3 text-sm text-foreground leading-relaxed">
            <p>
              A plataforma <strong>Brasil Letrado</strong> declara que todas as suas atividades pedagógicas, exercícios e conteúdos foram 
              desenvolvidos em estrita conformidade com a <strong>Base Nacional Comum Curricular (BNCC)</strong>, documento normativo 
              aprovado pelo Conselho Nacional de Educação e homologado pelo Ministério da Educação em dezembro de 2017.
            </p>
            <p>
              O componente curricular contemplado é <strong>Língua Portuguesa</strong>, abrangendo os anos iniciais do Ensino Fundamental 
              (1º ao 5º ano), com foco prioritário no eixo de <strong>Leitura/Escuta (compreensão e interpretação)</strong> e no eixo de 
              <strong> Análise Linguística/Semiótica</strong> aplicada ao contexto textual.
            </p>
            <p>
              Cada atividade na plataforma possui referência explícita à habilidade da BNCC correspondente (código alfanumérico), 
              permitindo <strong>rastreabilidade completa</strong> para fins de auditoria pedagógica, relatórios escolares e prestação de contas 
              a órgãos públicos e governamentais.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Princípios pedagógicos */}
      <section className="container py-16">
        <h2 className="font-display text-2xl text-foreground text-center mb-8">Princípios Pedagógicos Alinhados à BNCC</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PRINCIPIOS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="card-edu flex gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <p.icon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground font-semibold">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Navegador completo de habilidades */}
      <section className="container pb-16">
        <h2 className="font-display text-2xl text-foreground text-center mb-8">Navegador Completo de Habilidades BNCC</h2>
        <div className="max-w-5xl mx-auto">
          <BNCCBrowser />
        </div>
      </section>

      {/* Referências legais */}
      <section className="container pb-16">
        <h2 className="font-display text-2xl text-foreground text-center mb-8">Referências Legais e Normativas</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              title: "Base Nacional Comum Curricular (BNCC)",
              desc: "Documento normativo que define o conjunto de aprendizagens essenciais para a Educação Básica brasileira.",
              url: "http://basenacionalcomum.mec.gov.br/",
              org: "Ministério da Educação (MEC)",
            },
            {
              title: "Lei nº 13.415/2017",
              desc: "Altera a Lei de Diretrizes e Bases da Educação Nacional e estabelece a BNCC como referência para os currículos.",
              url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13415.htm",
              org: "Presidência da República",
            },
            {
              title: "Resolução CNE/CP nº 2/2017",
              desc: "Institui e orienta a implantação da BNCC, a ser respeitada obrigatoriamente ao longo das etapas da Educação Básica.",
              url: "http://portal.mec.gov.br/",
              org: "Conselho Nacional de Educação",
            },
          ].map((ref, i) => (
            <motion.div
              key={ref.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="card-edu"
            >
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-display text-base text-foreground mb-1">{ref.title}</h3>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">{ref.desc}</p>
                  <p className="text-xs text-muted-foreground">Fonte: {ref.org}</p>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-2 hover:underline"
                  >
                    Acessar documento oficial <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rodapé de conformidade */}
      <section className="container pb-16">
        <div className="max-w-3xl mx-auto bg-primary/5 rounded-2xl p-6 text-center">
          <CheckCircle2 size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm text-foreground font-semibold leading-relaxed">
             Este documento é gerado automaticamente pela plataforma <strong>Brasil Letrado</strong> e pode ser apresentado a 
             secretarias de educação, órgãos governamentais e auditorias como comprovação de conformidade curricular.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Última atualização: Março de 2026 · Versão 1.0
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 btn-hero text-sm px-6 py-2"
          >
            Voltar à plataforma
          </Link>
        </div>
      </section>
    </div>
  );
}
