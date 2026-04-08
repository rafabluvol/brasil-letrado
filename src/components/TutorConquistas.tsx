import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { TROPHIES, Trophy as TrophyType, getUnlockedTrophies } from "@/lib/level-system";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  currentXp: number;
  onBack: () => void;
}

export default function TutorConquistas({ currentXp, onBack }: Props) {
  const unlocked = getUnlockedTrophies(currentXp);
  const unlockedIds = new Set(unlocked.map(t => t.id));

  return (
    <motion.div
      key="conquistas"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-3"
    >
      <button onClick={onBack} className="text-xs text-primary font-semibold flex items-center gap-1 mb-1">
        ← Voltar
      </button>
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Trophy size={16} className="text-xp" /> Conquistas
      </h4>
      <p className="text-[11px] text-muted-foreground">
        🏆 {unlocked.length}/{TROPHIES.length} troféus conquistados
      </p>

      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-3 gap-2">
          {TROPHIES.map((trophy) => {
            const isUnlocked = unlockedIds.has(trophy.id);
            return (
              <Tooltip key={trophy.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={isUnlocked ? { scale: 1.08 } : {}}
                    className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all cursor-default ${
                      isUnlocked
                        ? "border-yellow-400/60 bg-gradient-to-b from-yellow-50 to-amber-50 shadow-[0_0_12px_-2px_rgba(234,179,8,0.3)]"
                        : "border-border/50 bg-muted/20 opacity-50 grayscale"
                    }`}
                  >
                    <span className={`text-2xl ${isUnlocked ? "drop-shadow-[0_0_6px_rgba(234,179,8,0.6)] animate-pulse" : ""}`} style={isUnlocked ? { filter: "sepia(1) saturate(3) hue-rotate(15deg) brightness(1.1)" } : {}}>
                      {isUnlocked ? trophy.icon : "🔒"}
                    </span>
                    <span className={`text-[9px] font-bold text-center leading-tight ${isUnlocked ? "text-amber-700" : "text-foreground"}`}>
                      {trophy.title.replace("Troféu ", "")}
                    </span>
                    {!isUnlocked && (
                      <span className="text-[8px] text-muted-foreground font-semibold">
                        {trophy.guarasRequired} ✨
                      </span>
                    )}
                    {isUnlocked && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-sm">
                        <span className="text-[7px]">✓</span>
                      </div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-56 text-xs p-3">
                  <p className="font-bold mb-1">{trophy.title}</p>
                  {isUnlocked ? (
                    <p className="text-muted-foreground leading-relaxed">{trophy.inventorInfo}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Conquiste {trophy.guarasRequired} Guarás para desbloquear! ✨
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </motion.div>
  );
}
