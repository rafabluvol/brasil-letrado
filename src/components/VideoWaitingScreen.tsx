import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";

const CURIOSIDADES = [
  "🏆 O recorde de maior torre de Lego tem mais de 35 metros — mais alta que um prédio de 10 andares!",
  "🌍 O maior quebra-cabeça do mundo tem mais de 551.232 peças!",
  "🐕 O cachorro mais rápido do mundo (galgo) corre a quase 70 km/h!",
  "🎂 O maior bolo do mundo pesou mais de 58 toneladas — como 10 elefantes!",
  "📏 A pessoa mais alta da história media 2,72 metros!",
  "🎈 O maior número de balões estourados em 1 minuto é 200!",
  "🏃 O recorde de velocidade humana é de Usain Bolt: 44,72 km/h!",
  "🧊 O maior boneco de neve do mundo tinha 37 metros de altura!",
  "📚 A maior biblioteca do mundo tem mais de 170 milhões de itens!",
  "🎸 A maior guitarra do mundo mede 13 metros de comprimento!",
  "🍕 A maior pizza do mundo tinha mais de 1.200 metros quadrados!",
  "🚀 O foguete mais poderoso já lançado é o Starship da SpaceX!",
  "🦴 O maior dinossauro já encontrado (Argentinosaurus) pesava 70 toneladas!",
  "🌊 A onda mais alta já surfada tinha quase 27 metros!",
  "🎨 A pintura mais cara do mundo foi vendida por mais de 450 milhões de dólares!",
  "🏔️ O Monte Everest tem 8.849 metros — e ainda cresce 4 mm por ano!",
  "🦈 O tubarão-baleia pode ter mais de 12 metros — mas só come plâncton!",
  "🎵 A música mais ouvida no Spotify já passou de 4 bilhões de plays!",
  "🐘 Os elefantes são os únicos animais que não conseguem pular!",
  "🌈 Na Islândia, existem arco-íris que aparecem à meia-noite!",
  "⚽ A Copa do Mundo é o evento mais assistido do planeta: mais de 3 bilhões de pessoas!",
  "🦜 O papagaio mais velho do mundo viveu mais de 100 anos!",
  "🏊 Michael Phelps tem 23 medalhas de ouro — mais que muitos países inteiros!",
  "🍫 Os suíços comem mais de 10 kg de chocolate por pessoa por ano!",
  "🌙 Pegadas deixadas na Lua em 1969 ainda estão lá — não tem vento para apagá-las!",
  "🐋 O coração de uma baleia-azul é do tamanho de um carro pequeno!",
  "🎮 O videogame mais vendido de todos os tempos é o Minecraft!",
  "🦒 O pescoço da girafa tem apenas 7 ossos — o mesmo que o nosso!",
  "🌋 O Japão tem mais de 100 vulcões ativos!",
  "🐙 O polvo tem 3 corações e sangue azul!",
  "🦅 O falcão-peregrino mergulha a mais de 300 km/h — o animal mais rápido do mundo!",
  "🧠 O cérebro humano usa 20% de toda a energia do corpo!",
  "🐝 Uma abelha bate as asas 200 vezes por segundo!",
  "🌸 No Japão, a florada das cerejeiras dura apenas 2 semanas!",
  "🎯 O recorde de embaixadinhas é de mais de 250.000 toques seguidos!",
  "🦷 O narval (unicórnio do mar) tem um dente de até 3 metros!",
  "🏰 O castelo mais antigo do mundo ainda de pé tem mais de 1.000 anos!",
  "🐧 Os pinguins conseguem beber água do mar porque filtram o sal!",
  "🌍 O Brasil tem a maior biodiversidade do planeta!",
  "🎻 O violino mais caro do mundo foi vendido por 16 milhões de dólares!",
  "🦎 O lagarto mais rápido do mundo corre a 35 km/h!",
  "📱 O primeiro iPhone foi lançado em 2007 — há menos de 20 anos!",
  "🌊 O Oceano Pacífico é maior que toda a superfície terrestre junta!",
  "🐢 A tartaruga mais velha do mundo tem mais de 190 anos!",
  "⚡ Um raio dura menos de 1 segundo, mas atinge 30.000°C!",
  "🦴 Bebês nascem com cerca de 270 ossos, mas adultos têm apenas 206!",
  "🌟 Existem mais estrelas no universo do que grãos de areia na Terra!",
  "🏋️ O recorde de levantamento de peso é de mais de 500 kg!",
  "🐸 O sapo mais venenoso do mundo cabe na ponta do dedo!",
  "🎡 A roda-gigante mais alta do mundo tem 250 metros!",
  "🦁 Os leões dormem até 20 horas por dia!",
  "🌺 A maior flor do mundo (Rafflesia) pode ter 1 metro de largura!",
  "🚂 O trem mais rápido do mundo (Maglev) passa de 600 km/h!",
  "🐜 Se juntássemos todas as formigas do mundo, elas pesariam mais que todos os humanos!",
  "🎶 Mozart começou a compor música aos 5 anos de idade!",
  "🦋 As borboletas-monarca migram até 4.000 km todo ano!",
  "🏖️ A praia mais longa do mundo fica no Brasil — Praia do Cassino com 254 km!",
  "🤯 Existem mais formas de embaralhar um baralho do que átomos na Terra!",
  "🐄 As vacas têm melhores amigas e ficam tristes quando separadas!",
  "🍯 O mel nunca estraga! Já encontraram mel de 3.000 anos no Egito — ainda comestível!",
  "🪐 Um dia em Vênus dura mais que um ano em Vênus!",
  "🦦 As lontras dormem de mãos dadas para não se separarem!",
  "🦩 Os flamingos nascem brancos e ficam rosa por causa da comida!",
  "☁️ Uma nuvem média pesa cerca de 500 toneladas!",
  "🐬 Os golfinhos têm nomes uns para os outros!",
  "🦒 A língua da girafa tem até 50 cm!",
  "⚡ Um raio pode ser 5 vezes mais quente que a superfície do Sol!",
  "🐜 Existem mais de 10 quatrilhões de formigas na Terra!",
  "🏖️ A areia da praia era rocha há milhares de anos!",
  "🐱 Os gatos passam 70% da vida dormindo!",
  "🌙 A Lua está se afastando da Terra 3,8 cm por ano!",
  "🦈 Os tubarões existem há mais tempo que as árvores!",
  "⭐ As estrelas-do-mar não têm cérebro!",
  "🧬 O DNA humano tem 3 metros de comprimento se esticado!",
  "🐴 Os cavalos podem dormir de pé!",
  "🦠 Existem mais bactérias no seu corpo do que células humanas!",
];

interface VideoWaitingScreenProps {
  visible: boolean;
}

export default function VideoWaitingScreen({ visible }: VideoWaitingScreenProps) {
  const [factIdx, setFactIdx] = useState(0);
  const [showCuriosity, setShowCuriosity] = useState(true);
  const shuffledRef = useRef<number[]>([]);

  // Shuffle all indices so we never repeat until all are shown
  const reshuffle = () => {
    const indices = Array.from({ length: CURIOSIDADES.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  const posRef = useRef(0);

  useEffect(() => {
    if (!visible) return;
    shuffledRef.current = reshuffle();
    posRef.current = 0;
    setFactIdx(shuffledRef.current[0]);

    const interval = setInterval(() => {
      posRef.current += 1;
      if (posRef.current >= shuffledRef.current.length) {
        shuffledRef.current = reshuffle();
        posRef.current = 0;
      }
      setFactIdx(shuffledRef.current[posRef.current]);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center z-10"
    >
      <div className="max-w-sm w-full mx-4 text-center">
        {/* Generating badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-lg"
          >
            ✨
          </motion.span>
          <span
            className="text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #2ecc40, #a8e63d, #f9e230, #f4a400, #1ab0c8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Gerando vídeo com IA...
          </span>
        </div>

        {/* Curiosidades */}
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10 p-5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-yellow-400" />
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Você Sabia?</span>
          </div>
          <AnimatePresence mode="wait">
            {showCuriosity && (
              <motion.p
                key={factIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-white/90 font-semibold leading-relaxed"
              >
                {CURIOSIDADES[factIdx]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
