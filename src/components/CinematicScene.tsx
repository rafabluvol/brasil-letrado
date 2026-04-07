import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CinematicSceneProps {
  imageUrl: string;
  isPlaying?: boolean;
  sceneIndex?: number;
}

// Different cinematic animation presets per scene
const SCENE_PRESETS = [
  { // Slow zoom in + drift right
    scale: [1, 1.15],
    x: [0, 30],
    y: [0, -10],
    duration: 14,
  },
  { // Zoom out + drift left
    scale: [1.18, 1],
    x: [20, -20],
    y: [-15, 5],
    duration: 16,
  },
  { // Slow pan up with gentle zoom
    scale: [1.05, 1.12],
    x: [-10, 10],
    y: [20, -20],
    duration: 13,
  },
  { // Dramatic zoom in center
    scale: [1, 1.22],
    x: [0, 5],
    y: [0, -15],
    duration: 15,
  },
];

// Floating particle configs
const PARTICLE_COUNT = 12;

function generateParticles(seed: number) {
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const rng = Math.sin(seed * 100 + i * 37) * 10000;
    const frac = rng - Math.floor(rng);
    particles.push({
      id: i,
      x: (frac * 100),
      y: ((Math.sin(seed * 50 + i * 73) * 10000 % 1) * 100 + 100) % 100,
      size: 2 + frac * 4,
      delay: frac * 8,
      duration: 6 + frac * 10,
      opacity: 0.15 + frac * 0.25,
    });
  }
  return particles;
}

export default function CinematicScene({ imageUrl, isPlaying = true, sceneIndex = 0 }: CinematicSceneProps) {
  const preset = SCENE_PRESETS[sceneIndex % SCENE_PRESETS.length];
  const particles = generateParticles(sceneIndex);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Main image with cinematic Ken Burns */}
      <motion.div
        className="absolute inset-0"
        initial={{
          scale: preset.scale[0],
          x: preset.x[0],
          y: preset.y[0],
        }}
        animate={isPlaying ? {
          scale: [preset.scale[0], preset.scale[1], preset.scale[0]],
          x: [preset.x[0], preset.x[1], preset.x[0]],
          y: [preset.y[0], preset.y[1], preset.y[0]],
        } : {}}
        transition={{
          duration: preset.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onLoad={() => setLoaded(true)}
        />
      </motion.div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Floating particles (sparkles/dust) */}
      {loaded && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(255,255,220,${p.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 2}px rgba(255,255,200,${p.opacity * 0.5})`,
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{
            y: [
              `${p.y}vh`,
              `${p.y - 30}vh`,
              `${p.y - 60}vh`,
            ],
            opacity: [0, p.opacity, 0],
            x: [0, Math.sin(p.id) * 20, Math.cos(p.id) * -15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle light sweep effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 8,
          delay: 2,
          repeat: Infinity,
          repeatDelay: 6,
          ease: "easeInOut",
        }}
      />

      {/* Film grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
