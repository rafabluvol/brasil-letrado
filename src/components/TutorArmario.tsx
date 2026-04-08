import { motion } from "framer-motion";
import { Lock, Check, Palette } from "lucide-react";
import { getAllLevels, LevelInfo, GROUP_LABELS, AnimalGroup } from "@/lib/level-system";

interface Props {
  currentXp: number;
  equippedLevel: number | null;
  onEquip: (levelIdx: number) => void;
  onBack: () => void;
}

export default function TutorArmario({ currentXp, equippedLevel, onEquip, onBack }: Props) {
  const allLevels = getAllLevels();

  const groups: AnimalGroup[] = ["sabia", "tucano", "capivara", "mico", "arara"];

  const isUnlocked = (l: LevelInfo) => currentXp >= l.guarasNeeded;

  const renderItem = (l: LevelInfo) => {
    const unlocked = isUnlocked(l);
    const isEquipped = equippedLevel === l.nivel;

    return (
      <motion.button
        key={l.nivel}
        whileHover={unlocked ? { scale: 1.05 } : {}}
        whileTap={unlocked ? { scale: 0.95 } : {}}
        onClick={() => unlocked && onEquip(l.nivel)}
        className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
          isEquipped
            ? "border-primary bg-primary/10"
            : unlocked
            ? "border-border bg-muted/50 hover:border-primary/40"
            : "border-border/50 bg-muted/20 opacity-60 cursor-not-allowed"
        }`}
      >
        <div className="relative w-14 h-14">
          <img
            src={l.image}
            alt={l.titulo}
            className="w-full h-full object-contain rounded-full"
            loading="lazy"
          />
          {!unlocked && (
            <div className="absolute inset-0 bg-muted/60 rounded-full flex items-center justify-center">
              <Lock size={16} className="text-muted-foreground" />
            </div>
          )}
          {isEquipped && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check size={10} className="text-primary-foreground" />
            </div>
          )}
        </div>

        <span className="text-[10px] font-bold text-foreground text-center leading-tight">{l.titulo}</span>
        <span className="text-[10px] text-muted-foreground">{l.emoji}</span>

        {!unlocked && (
          <span className="text-[9px] font-semibold text-muted-foreground">
            🔒 {l.guarasNeeded} Guarás
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      key="armario"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-3"
    >
      <button onClick={onBack} className="text-xs text-primary font-semibold flex items-center gap-1 mb-1">
        ← Voltar
      </button>
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Palette size={16} className="text-secondary" /> Nosso Estilo
      </h4>

      {groups.map(groupKey => {
        const groupLevels = allLevels.filter(l => l.group === groupKey);
        const info = GROUP_LABELS[groupKey];
        const isFauna = groupKey !== "sabia";

        return (
          <div key={groupKey}>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-1">
              {info.emoji} {isFauna ? `Fauna: ${info.label}` : info.label}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {groupLevels.map(renderItem)}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
