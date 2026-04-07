import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Props {
  imageUrl?: string;
  isGenerating?: boolean;
  title?: string;
}

export default function StoryFrameImage({ imageUrl, isGenerating, title }: Props) {
  return (
    <div className="relative w-full mx-auto flex-shrink-0">
      {/* Outer decorative frame - full width banner */}
      <div
        className="w-full rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #2ecc40, #a8e63d, #f9e230, #f4a400, #1ab0c8)',
          padding: '5px',
        }}
      >
        <div className="w-full rounded-[13px] bg-card overflow-hidden relative" style={{ aspectRatio: '16/7' }}>
          {/* Inner decorative border */}
          <div className="absolute inset-[5px] rounded-xl border-2 border-dashed border-primary/20 pointer-events-none z-10" />
          {/* Corner decorations */}
          {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
            <span key={i} className={`absolute ${pos} z-10 text-sm`}>
              {['⭐', '🌟', '✨', '💫'][i]}
            </span>
          ))}

          {isGenerating ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/5 to-secondary/5">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Revelando cena...</p>
            </div>
          ) : imageUrl ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              src={imageUrl}
              alt={title || "Cena da história"}
              className="w-full h-full object-contain bg-card"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-5xl">🎨</span>
            </div>
          )}
        </div>
      </div>

      {/* Title label */}
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, hsl(145, 65%, 45%), hsl(200, 80%, 50%))',
            color: 'white',
            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)',
          }}
        >
          {title}
        </motion.div>
      )}
    </div>
  );
}
