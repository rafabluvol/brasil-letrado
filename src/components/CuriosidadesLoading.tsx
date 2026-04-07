import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lightbulb } from "lucide-react";

const CURIOSIDADES = [
  "🦒 A girafa é o animal mais alto do mundo e pode medir até 5,8 metros — quase 3 andares de um prédio!",
  "🌊 O Oceano Pacífico é tão grande que cabem todos os continentes dentro dele!",
  "🐙 O polvo tem 3 corações e sangue azul!",
  "🌳 A Floresta Amazônica produz cerca de 20% do oxigênio do planeta!",
  "🐋 A baleia-azul é o maior animal que já existiu — maior até que os dinossauros!",
  "⚡ Um raio pode aquecer o ar ao redor até 30.000°C — 5 vezes mais quente que a superfície do Sol!",
  "🦷 O tubarão pode ter até 3.000 dentes ao mesmo tempo!",
  "🌍 A Terra gira a cerca de 1.670 km/h, mas nós não sentimos!",
  "🐜 As formigas podem carregar até 50 vezes o seu próprio peso!",
  "🧠 O cérebro humano tem mais conexões do que estrelas na Via Láctea!",
  "🦜 Papagaios podem viver mais de 80 anos!",
  "🌙 Na Lua, você pesaria 6 vezes menos do que na Terra!",
  "🐧 Os pinguins-imperadores podem mergulhar a mais de 500 metros de profundidade!",
  "🎵 As baleias jubarte cantam músicas que podem durar até 20 horas!",
  "🦎 O camaleão pode mover cada olho independentemente!",
  "🌋 Existem mais vulcões no fundo do oceano do que em terra firme!",
  "🐝 Uma abelha visita cerca de 5.000 flores por dia para fazer mel!",
  "🦴 O corpo humano tem 206 ossos, mas bebês nascem com cerca de 270!",
  "🌈 O arco-íris tem na verdade mais de 1 milhão de cores — nós só enxergamos 7!",
  "🐢 Algumas tartarugas podem respirar pelo bumbum! Sério!",
  "📚 A palavra mais longa do português tem 46 letras: pneumoultramicroscopicossilicovulcanoconiótico!",
  "🦈 Os tubarões existem há mais tempo que as árvores!",
  "🔬 Existem mais bactérias no seu corpo do que pessoas no planeta!",
  "🌊 O Rio Amazonas despeja tanta água no mar que é possível encontrar água doce a 160 km da costa!",
  "🦅 A águia-real pode enxergar um coelho a mais de 3 km de distância!",
  "🎮 O primeiro videogame da história foi criado em 1958 — um jogo de tênis!",
  "🦕 O Brasil já foi lar de dinossauros! O Staurikosaurus foi descoberto no Rio Grande do Sul!",
  "🌟 Existem mais estrelas no universo do que grãos de areia em todas as praias da Terra!",
  "🐸 Existem sapos tão pequenos que cabem na ponta do seu dedo!",
  "🏔️ O Monte Everest cresce cerca de 4 mm por ano!",
];

interface CuriosidadesLoadingProps {
  message?: string;
}

export default function CuriosidadesLoading({ message = "Gerando sua atividade com IA..." }: CuriosidadesLoadingProps) {
  const [currentIdx, setCurrentIdx] = useState(() => Math.floor(Math.random() * CURIOSIDADES.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * CURIOSIDADES.length);
        } while (next === prev);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <div className="max-w-md w-full mx-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Loader2 size={32} className="text-primary" />
        </motion.div>

        <p className="text-foreground font-bold text-lg mb-2">{message}</p>
        <p className="text-muted-foreground text-sm font-semibold mb-8">
          Enquanto preparamos sua história incrível, fique por dentro! 🧠
        </p>

        <div className="card-edu min-h-[120px] flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-xp" />
            <span className="text-xs font-bold text-xp uppercase tracking-wider">Você sabia?</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-foreground font-semibold leading-relaxed px-2"
            >
              {CURIOSIDADES[currentIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
