import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  tipo: 'multipla_escolha' | 'emocao';
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  onAnswer: (correta: boolean) => void;
}

const EMOJIS_DEFAULT = ["😊", "😨", "😢", "😡"];

export default function ExercicioPostVideo({ tipo, pergunta, opcoes, respostaCorreta, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const displayOpcoes = tipo === 'emocao'
    ? (opcoes?.length >= 4 ? opcoes : EMOJIS_DEFAULT)
    : opcoes;

  const handleSelect = (idx: number) => {
    if (confirmed) return;
    if (tipo === 'emocao') {
      setSelected(idx);
      setConfirmed(true);
      setTimeout(() => onAnswer(true), 700);
      return;
    }
    setSelected(idx);
  };

  const handleConfirm = () => {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    const correta = selected === respostaCorreta;
    setTimeout(() => onAnswer(correta), 900);
  };

  const isCorrectSelected = confirmed && selected === respostaCorreta;
  const isWrongSelected = confirmed && selected !== respostaCorreta;

  return (
    <div className="flex flex-col gap-5 w-full">
      <p className="text-center text-lg font-bold text-foreground">
        {pergunta}
      </p>

      {tipo === 'emocao' ? (
        <div className="flex gap-4 justify-center flex-wrap">
          {displayOpcoes.map((emoji, idx) => (
            <motion.button
              key={idx}
              whileHover={!confirmed ? { scale: 1.15, y: -4 } : {}}
              whileTap={!confirmed ? { scale: 0.9 } : {}}
              disabled={confirmed}
              onClick={() => handleSelect(idx)}
              className={`text-5xl w-20 h-20 rounded-2xl flex items-center justify-center border-2 transition-all ${
                selected === idx && confirmed
                  ? 'border-primary bg-primary/20 scale-110'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {displayOpcoes.map((opt, idx) => {
            const isCorrectOpt = confirmed && idx === respostaCorreta;
            const isWrongOpt = confirmed && idx === selected && idx !== respostaCorreta;
            const isSelectedOpt = selected === idx;
            return (
              <motion.button
                key={idx}
                whileHover={!confirmed ? { scale: 1.01, x: 4 } : {}}
                whileTap={!confirmed ? { scale: 0.99 } : {}}
                disabled={confirmed}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center gap-3 ${
                  isCorrectOpt
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : isWrongOpt
                      ? 'border-red-500 bg-red-100 text-red-700'
                      : isSelectedOpt
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted'
                }`}
              >
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {isCorrectOpt && <CheckCircle2 size={18} className="flex-shrink-0" />}
                {isWrongOpt && <XCircle size={18} className="flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {confirmed && tipo === 'multipla_escolha' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-2 px-4 rounded-xl font-bold text-sm ${
              isCorrectSelected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            {isCorrectSelected ? '🎉 Ótima resposta!' : '😊 Tudo bem, a história continua!'}
          </motion.div>
        )}
        {confirmed && tipo === 'emocao' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2 px-4 rounded-xl font-bold text-sm bg-primary/10 text-primary"
          >
            Obrigado por compartilhar! 💚
          </motion.div>
        )}
      </AnimatePresence>

      {tipo === 'multipla_escolha' && !confirmed && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={selected === null}
            className="btn-hero px-10 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Responder
          </motion.button>
        </div>
      )}
    </div>
  );
}
