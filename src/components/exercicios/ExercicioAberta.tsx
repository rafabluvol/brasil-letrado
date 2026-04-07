import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Lightbulb } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  pergunta: string;
  dicaResposta?: string;
  onComplete: (resposta: string) => void;
  showResult: boolean;
}

export default function ExercicioAberta({ pergunta, dicaResposta, onComplete, showResult }: Props) {
  const [resposta, setResposta] = useState("");
  const [showDica, setShowDica] = useState(false);

  const wordCount = resposta.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = resposta.split("\n").length;
  const minWords = 15; // ~3 lines
  const maxWords = 80; // ~5 lines
  const canSubmit = wordCount >= minWords;

  return (
    <div className="space-y-4">
      <p className="text-base font-bold text-foreground">{pergunta}</p>

      {dicaResposta && (
        <div>
          <button
            onClick={() => setShowDica(!showDica)}
            className="flex items-center gap-1.5 text-xs font-bold text-info hover:text-info/80 transition-colors"
          >
            <Lightbulb size={14} />
            {showDica ? "Ocultar dica" : "Precisa de uma dica?"}
          </button>
          {showDica && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm text-info bg-info/5 border border-info/20 rounded-lg p-3 mt-2"
            >
              💡 {dicaResposta}
            </motion.p>
          )}
        </div>
      )}

      <div className="relative">
        <Textarea
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          placeholder="Escreva sua resposta aqui com suas próprias palavras..."
          className="min-h-[140px] text-base font-medium resize-none border-2 focus:border-primary rounded-xl"
          disabled={showResult}
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs font-semibold ${
            wordCount < minWords ? "text-muted-foreground" : wordCount > maxWords ? "text-destructive" : "text-success"
          }`}>
            {wordCount} palavras {wordCount < minWords ? `(mínimo ${minWords})` : "✓"}
          </span>
        </div>
      </div>

      {!showResult && (
        <button
          onClick={() => onComplete(resposta)}
          disabled={!canSubmit}
          className="btn-hero w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          Enviar Resposta
        </button>
      )}

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 bg-success/5 border-success/20"
        >
          <p className="font-bold text-sm text-success mb-1">🎉 Resposta enviada!</p>
          <p className="text-sm text-muted-foreground">
            Parabéns por expressar sua opinião! O importante é pensar criticamente sobre o texto.
          </p>
        </motion.div>
      )}
    </div>
  );
}
