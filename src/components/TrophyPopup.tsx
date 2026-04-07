import { motion, AnimatePresence } from "framer-motion";
import { Trophy as TrophyType } from "@/lib/level-system";

interface Props {
  trophy: TrophyType | null;
  onClose: () => void;
}

export default function TrophyPopup({ trophy, onClose }: Props) {
  if (!trophy) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.3, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="bg-card rounded-2xl p-6 max-w-xs mx-4 text-center shadow-2xl border-2 border-xp/30"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: 2, duration: 0.5 }}
            className="text-6xl mb-3"
          >
            {trophy.icon}
          </motion.div>
          <h3 className="text-lg font-bold text-foreground font-display mb-1">
            🏆 Nova Conquista!
          </h3>
          <p className="text-sm font-bold text-xp mb-2">{trophy.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {trophy.inventorInfo}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold text-sm shadow-lg"
          >
            Incrível! ✨
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
