import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

type WeatherState = "clear" | "rain";

const WEATHER_DURATION = 18000;

function CloudSVG({ width = 120, opacity = 0.7 }: { width?: number; opacity?: number }) {
  const h = width * 0.45;
  return (
    <svg width={width} height={h} viewBox="0 0 120 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="38" rx="55" ry="16" fill="white" opacity={opacity * 0.6} />
      <circle cx="36" cy="30" r="18" fill="white" opacity={opacity} />
      <circle cx="60" cy="22" r="22" fill="white" opacity={opacity} />
      <circle cx="82" cy="28" r="16" fill="white" opacity={opacity} />
      <circle cx="48" cy="20" r="15" fill="white" opacity={opacity * 0.9} />
      <circle cx="72" cy="18" r="14" fill="white" opacity={opacity * 0.85} />
    </svg>
  );
}

function RainDrop({ left, delay, duration, height }: { left: string; delay: number; duration: number; height: number }) {
  return (
    <motion.svg
      className="absolute"
      style={{ left, top: -10 }}
      width="3"
      height={height}
      viewBox={`0 0 3 ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: [0, 550], opacity: [0.6, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
    >
      <line x1="1.5" y1="0" x2="1.5" y2={height} stroke="hsl(210,50%,72%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="1.5" cy={height} r="1.5" fill="hsl(210,50%,72%)" opacity="0.3" />
    </motion.svg>
  );
}

export default function AnimatedSky() {
  const [weather, setWeather] = useState<WeatherState>("clear");

  useEffect(() => {
    const interval = setInterval(() => {
      setWeather((prev) => (prev === "clear" ? "rain" : "clear"));
    }, WEATHER_DURATION);
    return () => clearInterval(interval);
  }, []);

  const rainDrops = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      left: `${(i * 3.3) % 100}%`,
      height: 16 + (i % 4) * 4,
      delay: (i * 0.08) % 2.5,
      duration: 1.1 + (i % 3) * 0.25,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Fixed background color */}
      <div className="absolute inset-0" style={{ backgroundColor: "#E8F0F8" }} />

      {/* SVG Clouds */}
      <motion.div className="absolute" style={{ top: "6%", left: "-12%" }}
        animate={{ x: [0, 900, 0] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <CloudSVG width={180} opacity={0.6} />
      </motion.div>

      <motion.div className="absolute" style={{ top: "14%", right: "-10%" }}
        animate={{ x: [0, -700, 0] }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      >
        <CloudSVG width={140} opacity={0.55} />
      </motion.div>

      <motion.div className="absolute" style={{ top: "22%", left: "10%" }}
        animate={{ x: [0, 600, 0] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <CloudSVG width={100} opacity={0.5} />
      </motion.div>

      <motion.div className="absolute" style={{ top: "10%", left: "40%" }}
        animate={{ x: [0, -500, 0] }}
        transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
      >
        <CloudSVG width={160} opacity={0.5} />
      </motion.div>

      <motion.div className="absolute" style={{ top: "28%", left: "60%" }}
        animate={{ x: [0, 400, 0] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <CloudSVG width={90} opacity={0.45} />
      </motion.div>

      <motion.div className="absolute" style={{ top: "18%", left: "75%" }}
        animate={{ x: [0, -800, 0] }}
        transition={{ duration: 95, repeat: Infinity, ease: "linear" }}
      >
        <CloudSVG width={130} opacity={0.5} />
      </motion.div>

      {/* Rain SVG drops */}
      {weather === "rain" && rainDrops.map((drop, i) => (
        <RainDrop key={i} left={drop.left} delay={drop.delay} duration={drop.duration} height={drop.height} />
      ))}
    </div>
  );
}
