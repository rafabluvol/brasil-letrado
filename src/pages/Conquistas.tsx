import { motion } from "framer-motion";
import { Trophy, Star, Coins, TrendingUp, Lock, Sparkles, ChevronRight, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAllLevels, getLevelInfo, getUnlockedTrophies, getNextTrophy, TROPHIES, getXpForNextLevel, GROUP_LABELS, type AnimalGroup } from "@/lib/level-system";
import AnimatedSky from "@/components/AnimatedSky";
import guaraCoin from "@/assets/guara-coin.png";

const ANIMAL_ORDER: AnimalGroup[] = ["sabia", "tucano", "capivara", "mico", "arara"];

export default function Conquistas() {
  const { profile } = useAuth();
  const xp = profile?.total_xp ?? 0;
  const nivel = profile?.nivel ?? 1;
  const levelInfo = getLevelInfo(nivel);
  const allLevels = getAllLevels();
  const unlockedTrophies = getUnlockedTrophies(xp);
  const nextTrophy = getNextTrophy(xp);
  const nextLevelXp = getXpForNextLevel(nivel);
  const progressToNext = nivel < 21 ? Math.min(((xp - levelInfo.guarasNeeded) / (nextLevelXp - levelInfo.guarasNeeded)) * 100, 100) : 100;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-10 md:py-14">
        <AnimatedSky />
        <div className="container relative z-10 max-w-5xl">
          {/* Current Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-border/60 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative flex-shrink-0"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shadow-xl border-4 border-white/80">
                  <img src={levelInfo.image} alt={levelInfo.titulo} className="w-full h-full object-cover" />
                </div>
                <div className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${levelInfo.corBadge} text-white text-xs font-black shadow-lg`}>
                  Nível {nivel}
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-1">
                  {levelInfo.emoji} {levelInfo.titulo}
                </h1>
                <p className="text-muted-foreground font-semibold mb-4">{levelInfo.descricao}</p>

                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-full px-4 py-2 shadow-sm group/coin">
                    <img src={guaraCoin} alt="Guará" className="w-6 h-6 transition-transform duration-500 group-hover/coin:[transform:rotateY(360deg)]" loading="lazy" />
                    <span className="font-black text-amber-700 text-lg">{xp}</span>
                    <span className="font-bold text-amber-600 text-sm">Guarás</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-full px-4 py-2 shadow-sm">
                    <Trophy size={18} className="text-purple-500" />
                    <span className="font-black text-purple-700">{unlockedTrophies.length}</span>
                    <span className="font-bold text-purple-600 text-sm">/ {TROPHIES.length} troféus</span>
                  </div>
                </div>

                {/* Progress to next level */}
                {nivel < 21 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1.5">
                      <span>Próximo nível: {getLevelInfo(nivel + 1).titulo}</span>
                      <span>{nextLevelXp - xp} Guarás restantes</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* What are Guarás */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-border/60 mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                <Coins size={22} className="text-amber-600" />
              </div>
              O que são Guarás?
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: "⭐", title: "Moeda do Saber", desc: "Guarás são as moedas que você ganha ao completar atividades, responder exercícios corretamente e ler histórias. Quanto mais você aprende, mais Guarás acumula!" },
                { icon: "📈", title: "Como Ganhar", desc: "Complete atividades (+50-100), acerte exercícios (+10-20 cada), leia histórias em voz alta (+30), explore novos temas (+15 bônus) e mantenha sequências de acertos!" },
                { icon: "🎁", title: "Para que Servem", desc: "Seus Guarás desbloqueiam novos níveis, transformam seu tutor em novos animais incríveis e abrem troféus de inventores famosos!" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border border-amber-200/40 rounded-2xl p-6 text-center"
                >
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Levels Journey */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-border/60 mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                <TrendingUp size={22} className="text-primary" />
              </div>
              Jornada de Níveis
            </h2>
            <p className="text-sm text-muted-foreground mb-8 ml-13">
              Evolua seu tutor através de 5 animais da fauna brasileira, cada um com 4 estilos únicos!
            </p>

            {ANIMAL_ORDER.map((group) => {
              const groupInfo = GROUP_LABELS[group];
              const groupLevels = allLevels.filter(l => l.group === group);

              return (
                <div key={group} className="mb-8 last:mb-0">
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-4 text-lg">
                    <span className="text-xl">{groupInfo.emoji}</span>
                    {groupInfo.label}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {groupLevels.map((lvl) => {
                      const isUnlocked = nivel >= lvl.nivel;
                      const isCurrent = nivel === lvl.nivel;

                      return (
                        <motion.div
                          key={lvl.nivel}
                          whileHover={isUnlocked ? { scale: 1.05, y: -4 } : {}}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            isCurrent
                              ? "border-primary shadow-lg shadow-primary/20 bg-gradient-to-b from-primary/5 to-accent/5 ring-2 ring-primary/30"
                              : isUnlocked
                              ? "border-border/60 bg-card hover:shadow-md"
                              : "border-border/30 bg-muted/30 opacity-50"
                          }`}
                        >
                          {isCurrent && (
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black px-2.5 py-0.5 rounded-full">
                              ATUAL
                            </div>
                          )}
                          <div className={`w-16 h-16 rounded-xl overflow-hidden ${!isUnlocked ? "grayscale" : ""} shadow-sm`}>
                            <img src={lvl.image} alt={lvl.titulo} className="w-full h-full object-cover" />
                          </div>
                          <span className={`text-xs font-bold text-center leading-tight ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                            {lvl.emoji} {lvl.titulo}
                          </span>
                          <span className={`text-[10px] font-semibold ${isUnlocked ? "text-primary" : "text-muted-foreground"}`}>
                            {lvl.guarasNeeded === 0 ? "Início" : `${lvl.guarasNeeded} ⭐`}
                          </span>
                          {!isUnlocked && (
                            <Lock size={14} className="absolute top-2 right-2 text-muted-foreground/60" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Trophies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-border/60 mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                <Award size={22} className="text-amber-600" />
              </div>
              Troféus de Inventores
            </h2>
            <p className="text-sm text-muted-foreground mb-8 ml-13">
              Desbloqueie troféus de grandes inventores e cientistas ao acumular Guarás!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {TROPHIES.map((trophy, i) => {
                const isUnlocked = xp >= trophy.guarasRequired;
                return (
                  <motion.div
                    key={trophy.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    whileHover={isUnlocked ? { scale: 1.06, y: -4 } : {}}
                    className={`relative flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all ${
                      isUnlocked
                        ? "border-amber-300/80 bg-gradient-to-b from-yellow-50 to-amber-50 shadow-md shadow-amber-200/30 hover:shadow-lg"
                        : "border-border/40 bg-muted/20 opacity-60 grayscale"
                    }`}
                  >
                    <span className={`text-4xl ${isUnlocked ? "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : ""}`}
                      style={isUnlocked ? { filter: "sepia(1) saturate(3) hue-rotate(15deg) brightness(1.1)" } : {}}
                    >
                      {isUnlocked ? trophy.icon : "🔒"}
                    </span>
                    <span className={`text-sm font-bold text-center leading-tight ${isUnlocked ? "text-amber-800" : "text-muted-foreground"}`}>
                      {trophy.title.replace("Troféu ", "")}
                    </span>
                    <span className={`text-xs font-semibold ${isUnlocked ? "text-amber-600" : "text-muted-foreground"}`}>
                      {trophy.guarasRequired} ⭐
                    </span>
                    {isUnlocked && (
                      <p className="text-[11px] text-muted-foreground text-center leading-relaxed mt-1">
                        {trophy.description}
                      </p>
                    )}
                    {isUnlocked && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-md">
                        <span className="text-[10px]">✓</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {nextTrophy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl px-5 py-3"
              >
                <Sparkles size={18} className="text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">
                  Próximo troféu: <strong>{nextTrophy.title}</strong> — faltam {nextTrophy.guarasRequired - xp} Guarás!
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-border/60"
          >
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
                <Star size={22} className="text-primary" />
              </div>
              Como Funciona?
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { emoji: "📚", title: "Complete Atividades", desc: "Cada atividade completa rende entre 50 e 100 Guarás, dependendo do seu desempenho nos exercícios." },
                { emoji: "✅", title: "Acerte Exercícios", desc: "Cada exercício correto vale de 10 a 20 Guarás. Quanto mais difícil, mais você ganha!" },
                { emoji: "🎙️", title: "Leia em Voz Alta", desc: "A leitura em voz alta avaliada pela IA rende 30 Guarás extras e treina sua fluência!" },
                { emoji: "🔄", title: "Explore Temas Novos", desc: "Diversificar os temas gera bônus de 15 Guarás para incentivar a curiosidade." },
                { emoji: "🐦➡️🦜➡️🦫➡️🐒➡️🦅", title: "Evolua seu Tutor", desc: "A cada grupo de níveis, seu tutor se transforma em um novo animal da fauna brasileira com estilos únicos!" },
                { emoji: "🏆", title: "Conquiste Troféus", desc: "A cada marco de Guarás, você desbloqueia o troféu de um grande inventor ou cientista da história!" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/40"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                  <div>
                    <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
