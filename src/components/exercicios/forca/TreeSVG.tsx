import { motion } from "framer-motion";

interface Props {
  errors: number;
  won: boolean;
  maxErrors: number;
}

export default function TreeSVG({ errors, won, maxErrors }: Props) {
  const leafGroups = [
    { cx: 70, cy: 28, rx: 22, ry: 18, stage: 1 },
    { cx: 45, cy: 42, rx: 18, ry: 14, stage: 2 },
    { cx: 95, cy: 42, rx: 18, ry: 14, stage: 3 },
    { cx: 40, cy: 62, rx: 16, ry: 12, stage: 4 },
    { cx: 100, cy: 62, rx: 16, ry: 12, stage: 5 },
    { cx: 70, cy: 72, rx: 20, ry: 14, stage: 6 },
  ];

  const flowers = won ? [
    { cx: 58, cy: 30 }, { cx: 82, cy: 25 }, { cx: 48, cy: 48 },
    { cx: 92, cy: 44 }, { cx: 42, cy: 65 }, { cx: 98, cy: 60 },
  ] : [];

  return (
    <svg viewBox="0 0 140 130" className="w-32 h-32">
      <ellipse cx="70" cy="118" rx="28" ry="6" fill="rgba(139,90,43,0.3)" />
      <rect x="63" y="78" width="14" height="38" rx="7" fill="#8B5A2B" />
      <line x1="70" y1="85" x2="45" y2="65" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
      <line x1="70" y1="85" x2="95" y2="65" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
      <line x1="70" y1="78" x2="70" y2="45" stroke="#8B5A2B" strokeWidth="6" strokeLinecap="round" />
      {errors >= maxErrors && (
        <>
          <line x1="45" y1="65" x2="35" y2="50" stroke="#6B4423" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="65" x2="105" y2="50" stroke="#6B4423" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {leafGroups.map((leaf, i) => {
        const visible = errors < leaf.stage;
        return visible ? (
          <motion.ellipse
            key={i}
            cx={leaf.cx} cy={leaf.cy} rx={leaf.rx} ry={leaf.ry}
            fill={won ? "#4ade80" : "#22c55e"}
            opacity={won ? 1 : 0.85}
            initial={false}
            animate={{ opacity: visible ? 0.85 : 0, scale: visible ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <motion.circle
            key={`fallen-${i}`}
            cx={leaf.cx + (i % 2 === 0 ? -8 : 8)} cy={112} r={3}
            fill="#86efac" opacity={0.5}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.5, y: 0 }}
          />
        );
      })}
      {flowers.map((f, i) => (
        <motion.g key={`flower-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
          <circle cx={f.cx} cy={f.cy} r={5} fill="#fb7185" opacity={0.9} />
          <circle cx={f.cx} cy={f.cy} r={2} fill="#fef08a" />
        </motion.g>
      ))}
    </svg>
  );
}
