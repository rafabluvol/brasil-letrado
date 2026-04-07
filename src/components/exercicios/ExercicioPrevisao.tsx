import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  pergunta: string;
  opcoes: [string, string];
  onAnswer: () => void;
}

export default function ExercicioPrevisao({ pergunta, opcoes, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (idx: number) => {
    if (confirmed) return;
    setSelected(idx);
    setConfirmed(true);
    setTimeout(() => onAnswer(), 1200);
  };

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-5xl"
      >
        🔮
      </motion.div>

      <p className="text-center text-lg font-bold text-foreground max-w-md">
        {pergunta}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {opcoes.map((opt, idx) => (
          <motion.button
            key={idx}
            whileHover={!confirmed ? { scale: 1.03, y: -3 } : {}}
            whileTap={!confirmed ? { scale: 0.97 } : {}}
            disabled={confirmed}
            onClick={() => handleSelect(idx)}
            className={`flex-1 px-5 py-4 rounded-xl border-2 font-semibold text-sm text-center transition-all ${
              selected === idx && confirmed
                ? 'border-primary bg-primary/20 text-primary scale-[1.02]'
                : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted'
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm"
          >
            Vamos descobrir! <ArrowRight size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
