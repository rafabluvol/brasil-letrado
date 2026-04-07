import { motion, AnimatePresence } from "framer-motion";
import sabiaTutor from "@/assets/sabia-tutor.png";
import { X } from "lucide-react";

interface Props {
  hint: string | null;
  onDismiss: () => void;
}

export default function ExerciseHintBubble({ hint, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {hint && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          className="fixed bottom-28 right-6 z-50 max-w-72"
        >
          <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-4 pr-8 shadow-lg">
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
            <div className="flex items-start gap-3">
              <img src={sabiaTutor} alt="Brasil Letrado" className="w-10 h-10 rounded-full flex-shrink-0" />
              <p className="text-sm text-foreground leading-relaxed font-medium">
                {hint}
              </p>
            </div>
          </div>
          {/* Arrow pointing to tutor FAB */}
          <div className="flex justify-end pr-6">
            <div className="w-3 h-3 bg-card border-r-2 border-b-2 border-primary/20 rotate-45 -mt-1.5" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
