import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Par {
  palavra: string;
  sinonimo: string;
}

interface Props {
  pares: Par[];
  onComplete: (acertou: boolean) => void;
}

interface Card {
  id: number;
  text: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

export default function ExercicioMemoria({ pares, onComplete }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Filter out invalid pairs and build cards with stable unique ids
    const validPairs = (pares || []).filter(
      (p) => p?.palavra?.trim() && p?.sinonimo?.trim()
    );
    const allCards: Card[] = [];
    validPairs.forEach((par, i) => {
      allCards.push({ id: i * 2, text: par.palavra.trim(), pairId: i, flipped: false, matched: false });
      allCards.push({ id: i * 2 + 1, text: par.sinonimo.trim(), pairId: i, flipped: false, matched: false });
    });
    // Fisher-Yates shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    setCards(allCards);
    setFlippedIds([]);
    setMatchedCount(0);
    setAttempts(0);
    setChecking(false);
  }, [pares]);

  const handleCardClick = (cardId: number) => {
    if (checking) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (flippedIds.length >= 2) return;

    const newCards = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedIds, cardId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setChecking(true);
      setAttempts(a => a + 1);
      const [first, second] = newFlipped.map(id => newCards.find(c => c.id === id)!);

      setTimeout(() => {
        if (first.pairId === second.pairId) {
          const matched = newCards.map(c =>
            c.pairId === first.pairId ? { ...c, matched: true, flipped: true } : c
          );
          setCards(matched);
          const newMatchedCount = matchedCount + 1;
          setMatchedCount(newMatchedCount);
          const uniquePairs = new Set(cards.map(c => c.pairId)).size;
          if (newMatchedCount === uniquePairs) {
            onComplete(attempts + 1 <= uniquePairs * 2);
          }
        } else {
          setCards(prev => prev.map(c =>
            newFlipped.includes(c.id) ? { ...c, flipped: false } : c
          ));
        }
        setFlippedIds([]);
        setChecking(false);
      }, 800);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground font-semibold">
          Encontre os pares de sinônimos!
        </p>
        <span className="text-xs font-bold text-info bg-info/10 px-2 py-1 rounded-full">
          {matchedCount}/{pares.length} pares
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileHover={!card.flipped && !card.matched ? { scale: 1.05 } : {}}
            whileTap={!card.flipped && !card.matched ? { scale: 0.95 } : {}}
            onClick={() => handleCardClick(card.id)}
            className={`relative h-20 rounded-xl border-2 font-bold text-sm transition-all ${
              card.matched
                ? "border-success bg-success/10 text-success"
                : card.flipped
                ? "border-primary bg-primary/10 text-primary"
                : "border-muted bg-muted/50 text-transparent hover:border-muted-foreground/30 cursor-pointer"
            }`}
            style={{ perspective: "600px" }}
          >
            <AnimatePresence mode="wait">
              {card.flipped || card.matched ? (
                <motion.span
                  key="front"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {card.text}
                </motion.span>
              ) : (
                <motion.span
                  key="back"
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -90 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl block"
                >
                  ❓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
