import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, TrendingUp, User, GraduationCap, LogOut, Library, Clapperboard, Trophy, ClipboardList } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getLevelInfo } from "@/lib/level-system";
import MicoAnimado, { type MicoAnimadoHandle } from "@/components/MicoAnimado";
import guaraCoin from "@/assets/guara-coin.png";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Início", desc: "Página inicial com atividades", color: "from-[#22c55e] to-[#4ade80]", activeColor: "#22c55e", gradientEnd: "#4ade80" },
  { to: "/professor", icon: ClipboardList, label: "Professora", desc: "Painel da professora", color: "from-[#8b5cf6] to-[#a78bfa]", activeColor: "#8b5cf6", gradientEnd: "#a78bfa" },
  { to: "/estante", icon: Library, label: "Estante", desc: "Seus livrinhos mágicos", color: "from-[#eab308] to-[#facc15]", activeColor: "#eab308", gradientEnd: "#facc15" },
  { to: "/producoes", icon: Clapperboard, label: "Produções", desc: "Vídeos e animações", color: "from-[#0ea5e9] to-[#38bdf8]", activeColor: "#0ea5e9", gradientEnd: "#38bdf8" },
  { to: "/conquistas", icon: Trophy, label: "Conquistas", desc: "Níveis, Guarás e troféus", color: "from-[#eab308] to-[#f59e0b]", activeColor: "#eab308", gradientEnd: "#f59e0b" },
  { to: "/dashboard", icon: TrendingUp, label: "Progresso", desc: "Seu desempenho e evolução", color: "from-[#a855f7] to-[#c084fc]", activeColor: "#a855f7", gradientEnd: "#c084fc" },
  { to: "/bncc", icon: GraduationCap, label: "BNCC", desc: "Currículo e habilidades", color: "from-[#d946ef] to-[#e879f9]", activeColor: "#d946ef", gradientEnd: "#e879f9" },
];

export default function Header() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const micoRef = useRef<MicoAnimadoHandle>(null);
  const brRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerWidth, setHeaderWidth] = useState(0);

  // Auto-trigger pendulum swing after 8s
  const swingOnce = useRef(false);
  if (!swingOnce.current) {
    setTimeout(() => { micoRef.current?.jumpTo(brRef); swingOnce.current = true; }, 8000);
  }

  const xp = profile?.total_xp ?? 0;
  const nivel = profile?.nivel ?? 1;
  const levelInfo = getLevelInfo(nivel);
  const progresso = Math.min(((xp % 300) / 300) * 100, 100);

  const oncaDuration = 45;
  const oncaSize = 85;

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderWidth(headerRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white border-b border-border" style={{ minHeight: 72 }}>
      {/* Onça walking along the bottom border of the header, behind everything */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        {headerWidth > 0 && (
          <MicoAnimado ref={micoRef} size={oncaSize} walkWidth={headerWidth} walkDuration={oncaDuration} />
        )}
      </div>

      <div className="container flex items-center justify-between h-[72px] relative" style={{ zIndex: 5 }}>
         <Link to="/" className="flex items-center gap-1.5 relative" onClick={(e) => { if (location.pathname === "/") e.preventDefault(); }}>
          <div className="relative flex items-center overflow-visible">
            <div className="flex flex-col leading-none relative z-10 overflow-visible pl-6">
              <div onMouseEnter={() => micoRef.current?.jumpTo(brRef)} className="relative overflow-visible">
                <h1 className="text-2xl font-display font-bold tracking-tight whitespace-nowrap relative overflow-visible flex items-baseline gap-1">
                  <span
                    ref={brRef}
                    className="relative inline-flex items-baseline overflow-visible"
                    style={{
                      background: 'linear-gradient(135deg, #2ecc40, #a8e63d, #f9e230, #f4a400, #1ab0c8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      zIndex: 10,
                    }}
                  >
                    Brasil
                  </span>
                  <span className="relative inline-flex flex-col items-center" style={{ zIndex: 10 }}>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #2ecc40, #a8e63d, #f9e230, #f4a400, #1ab0c8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Letrado
                    </span>
                    <span
                      className="font-bold uppercase powered-by-ai-shimmer"
                      style={{
                        fontSize: '8px',
                        letterSpacing: '1.8px',
                        marginTop: '2px',
                        lineHeight: 1,
                        color: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      Powered by AI
                    </span>
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </Link>

        {/* XP Bar - only when logged in */}
        {user && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative group/coin flex items-center gap-2.5 bg-card/80 border border-border/60 rounded-full pl-0.5 pr-4 py-0.5 shadow-sm cursor-default">
              <img
                src={guaraCoin}
                alt="Guará"
                className="w-9 h-9 drop-shadow-[0_2px_6px_rgba(234,179,8,0.35)] transition-transform duration-700 group-hover/coin:[transform:rotateY(360deg)]"
                loading="lazy"
              />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-normal text-muted-foreground">{xp}</span>
                <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">Guarás</span>
              </div>
            </div>
            <div className="w-24 progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progresso}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">Nível {nivel}</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.label} to={item.to} className="relative group">
                <motion.div
                  whileHover={{ scale: 1.12, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${item.activeColor}22, ${item.activeColor}11)`,
                    boxShadow: `0 4px 15px -3px ${item.activeColor}40`,
                  } : {}}
                >
                  {/* Glow effect on hover */}
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`}
                  />
                  {/* Icon with color */}
                  <item.icon
                    size={21}
                    className="relative z-10 transition-all duration-300"
                    style={isActive ? { color: item.activeColor, filter: `drop-shadow(0 0 6px ${item.activeColor}60)` } : {}}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: item.activeColor, boxShadow: `0 0 8px ${item.activeColor}` }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-y-0 translate-y-1 z-50">
                  <div
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap shadow-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${item.activeColor}, ${item.gradientEnd})` }}
                  >
                    {item.label}
                  </div>
                </div>
              </Link>
            );
          })}
          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={signOut}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </motion.button>
          ) : (
            <Link to="/auth">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-colors ${
                  location.pathname === "/auth" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <User size={20} />
              </motion.div>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
