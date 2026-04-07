import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface Afirmacao {
  frase: string;
  correta: boolean;
}

interface Props {
  textoContexto: string;
  afirmacoes: Afirmacao[];
  onComplete: (acertou: boolean) => void;
}

export default function ExercicioVF({ textoContexto, afirmacoes, onComplete }: Props) {
  const [respostas, setRespostas] = useState<Record<number, boolean | null>>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number, valor: boolean) => {
    if (showResult) return;
    setRespostas(prev => ({ ...prev, [idx]: valor }));
  };

  const handleVerify = () => {
    setShowResult(true);
    const totalCorrect = afirmacoes.filter((a, i) => respostas[i] === a.correta).length;
    onComplete(totalCorrect >= Math.ceil(afirmacoes.length * 0.75));
  };

  const allAnswered = afirmacoes.every((_, i) => respostas[i] !== undefined && respostas[i] !== null);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Context text */}
      <div className="bg-muted/50 rounded-xl px-4 py-3 border border-border">
        <p className="text-xs text-muted-foreground font-semibold mb-1">📖 Leia o trecho:</p>
        <p className="text-sm text-foreground leading-relaxed">{textoContexto}</p>
      </div>

      <p className="text-sm font-bold text-foreground">Marque Verdadeiro (V) ou Falso (F) para cada afirmação:</p>

      <div className="space-y-3">
        {afirmacoes.map((afirmacao, idx) => {
          const resposta = respostas[idx];
          const isCorrect = showResult && resposta === afirmacao.correta;
          const isWrong = showResult && resposta !== null && resposta !== undefined && resposta !== afirmacao.correta;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-xl border-2 transition-all ${
                isCorrect ? 'border-green-500 bg-green-50' :
                isWrong ? 'border-red-500 bg-red-50' :
                'border-border bg-card'
              }`}
            >
              <p className="text-sm text-foreground font-medium mb-2">{afirmacao.frase}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelect(idx, true)}
                  disabled={showResult}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
                    resposta === true
                      ? showResult
                        ? afirmacao.correta ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-500 bg-red-100 text-red-700'
                        : 'border-primary bg-primary/10 text-primary'
                      : showResult && afirmacao.correta
                        ? 'border-green-300 bg-green-50 text-green-600'
                        : 'border-border bg-muted/50 text-foreground hover:border-primary/40'
                  }`}
                >
                  V - Verdadeiro
                </button>
                <button
                  onClick={() => handleSelect(idx, false)}
                  disabled={showResult}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
                    resposta === false
                      ? showResult
                        ? !afirmacao.correta ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-500 bg-red-100 text-red-700'
                        : 'border-primary bg-primary/10 text-primary'
                      : showResult && !afirmacao.correta
                        ? 'border-green-300 bg-green-50 text-green-600'
                        : 'border-border bg-muted/50 text-foreground hover:border-primary/40'
                  }`}
                >
                  F - Falso
                </button>
              </div>
              {showResult && (
                <div className="flex items-center gap-1 mt-2">
                  {isCorrect ? (
                    <><CheckCircle2 size={14} className="text-green-600" /><span className="text-xs text-green-600 font-semibold">Correto!</span></>
                  ) : isWrong ? (
                    <><XCircle size={14} className="text-red-600" /><span className="text-xs text-red-600 font-semibold">A resposta é {afirmacao.correta ? 'Verdadeiro' : 'Falso'}</span></>
                  ) : null}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!showResult && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerify}
          disabled={!allAnswered}
          className="btn-hero w-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Verificar Respostas
        </motion.button>
      )}
    </div>
  );
}
