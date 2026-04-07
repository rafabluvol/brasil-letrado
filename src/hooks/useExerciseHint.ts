import { useState, useEffect, useCallback, useRef } from "react";

const HINT_DELAY_MS = 15_000;

const HINTS_BY_CATEGORY: Record<string, string[]> = {
  interpretacao: [
    "💡 Dica: Releia o texto com calma e procure a resposta nas entrelinhas!",
    "💡 Dica: Pense no que o autor quis dizer com suas palavras.",
    "💡 Dica: Volte ao texto e procure pistas que ajudem a responder!",
    "💡 Dica: Tente resumir o trecho na sua cabeça antes de responder.",
  ],
  vocabulario: [
    "💡 Dica: Pense em palavras parecidas que você já conhece!",
    "💡 Dica: Olhe as outras palavras ao redor para entender o significado.",
    "💡 Dica: Tente trocar a palavra por outra e veja se a frase faz sentido!",
    "💡 Dica: Lembre de sinônimos — palavras que significam a mesma coisa.",
  ],
  gramatica: [
    "💡 Dica: Leia a frase em voz alta — seu ouvido pode ajudar!",
    "💡 Dica: Preste atenção na concordância entre sujeito e verbo.",
    "💡 Dica: Verifique a pontuação e acentuação das palavras.",
    "💡 Dica: Pense nas regras que você aprendeu sobre essa parte da gramática!",
  ],
};

const HINTS_BY_TYPE: Record<string, string[]> = {
  ligar: [
    "💡 Dica: Tente conectar os itens que combinam entre si!",
    "💡 Dica: Comece pelos pares que você tem mais certeza.",
  ],
  memoria: [
    "💡 Dica: Tente lembrar onde cada carta estava!",
    "💡 Dica: Vire as cartas com calma e memorize suas posições.",
  ],
  ordenar: [
    "💡 Dica: Pense na ordem lógica dos acontecimentos!",
    "💡 Dica: O que aconteceu primeiro? Comece por aí!",
  ],
  aberta: [
    "💡 Dica: Escreva o que você sentiu ou pensou ao ler o texto!",
    "💡 Dica: Não existe resposta errada — use suas próprias palavras!",
  ],
  completar: [
    "💡 Dica: Leia a frase toda e pense qual palavra completa o sentido!",
    "💡 Dica: Tente cada opção na lacuna e veja qual faz mais sentido.",
  ],
};

interface UseExerciseHintOptions {
  categoria?: string;
  tipo?: string;
  isActive: boolean;
}

export function useExerciseHint({ categoria, tipo, isActive }: UseExerciseHintOptions) {
  const [hint, setHint] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedRef = useRef<Set<string>>(new Set());

  const pickHint = useCallback(() => {
    const categoryHints = HINTS_BY_CATEGORY[categoria || "interpretacao"] || HINTS_BY_CATEGORY.interpretacao;
    const typeHints = tipo ? HINTS_BY_TYPE[tipo] || [] : [];
    const allHints = [...typeHints, ...categoryHints];
    const available = allHints.filter(h => !usedRef.current.has(h));
    const pool = available.length > 0 ? available : allHints;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedRef.current.add(chosen);
    return chosen;
  }, [categoria, tipo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHint(null);
    if (!isActive) return;
    timerRef.current = setTimeout(() => {
      setHint(pickHint());
    }, HINT_DELAY_MS);
  }, [isActive, pickHint]);

  // Reset on exercise change
  useEffect(() => {
    usedRef.current.clear();
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [categoria, tipo, isActive]);

  // User interaction resets timer
  const registerInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const dismissHint = useCallback(() => {
    setHint(null);
  }, []);

  return { hint, registerInteraction, dismissHint };
}
