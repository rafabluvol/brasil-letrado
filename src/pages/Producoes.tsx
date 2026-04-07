import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, ArrowLeft, Play, Pause, SkipForward, RotateCcw, X, Share2, Trash2, Loader2, PanelRightOpen, PanelRightClose, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CinematicScene from "@/components/CinematicScene";
import ShareItemModal from "@/components/ShareItemModal";
import ReceiveItemModal from "@/components/ReceiveItemModal";

interface Cena {
  titulo: string;
  texto: string;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
}

interface Producao {
  id: string;
  titulo: string;
  historia_texto: string;
  ano: string;
  genero: string;
  cenas: Cena[];
  capa_url: string;
  created_at: string;
}

export default function Producoes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProd, setOpenProd] = useState<Producao | null>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [shareProd, setShareProd] = useState<Producao | null>(null);
  const [showReceive, setShowReceive] = useState(false);
  const [sharedProds, setSharedProds] = useState<Producao[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("student_productions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setProducoes((data as any as Producao[]) || []);
      setLoading(false);
    };
    load();
    fetchSharedProds();
  }, [user]);

  const fetchSharedProds = async () => {
    if (!user) return;
    try {
      const { data: sharedItems } = await supabase
        .from("shared_items" as any)
        .select("*")
        .eq("recipient_id", user.id)
        .eq("item_type", "production")
        .eq("status", "accepted");
      if (!sharedItems || (sharedItems as any[]).length === 0) { setSharedProds([]); return; }
      const prodIds = (sharedItems as any[]).map((s: any) => s.item_id);
      const ownerNames = Object.fromEntries((sharedItems as any[]).map((s: any) => [s.item_id, s.owner_name]));
      const { data: prods } = await supabase
        .from("student_productions" as any)
        .select("*")
        .in("id", prodIds);
      setSharedProds(((prods as any[]) || []).map((p: any) => ({ ...p, _sharedFrom: ownerNames[p.id] || "Amigo" })));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("student_productions" as any).delete().eq("id", id);
    setProducoes(prev => prev.filter(p => p.id !== id));
    toast({ title: "Produção removida" });
  };

  const handleShare = (prod: Producao) => {
    const text = `🎬 Olha o vídeo que eu criei no Brasil Letrado!\n\n"${prod.titulo}"\n\nVem criar o seu também!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const playScene = (idx: number) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const cena = openProd?.cenas[idx];
    if (!cena) return;
    if (cena.audioUrl) {
      const audio = new Audio(cena.audioUrl);
      audioRef.current = audio;
      audio.play().catch(console.error);
      audio.onended = () => setIsPlaying(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!!cena.videoUrl);
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  };

  const handleOpen = (prod: Producao) => {
    setOpenProd(prod);
    setCurrentScene(0);
    setIsPlaying(true);
  };

  const handleClose = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (videoRef.current) videoRef.current.pause();
    setOpenProd(null);
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); if (videoRef.current) videoRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play().catch(console.error); if (videoRef.current) videoRef.current.play().catch(console.error); setIsPlaying(true); }
    } else if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
      else { videoRef.current.play().catch(console.error); setIsPlaying(true); }
    }
  };

  useEffect(() => {
    if (openProd && isPlaying) playScene(currentScene);
  }, [currentScene, openProd]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Faça login para ver suas produções.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <Film size={28} className="text-primary" />
          <h2 className="text-2xl font-display font-bold text-foreground flex-1">Minhas Produções</h2>
          <button
            onClick={() => setShowReceive(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/20 text-secondary font-bold text-sm hover:bg-secondary/30 transition-colors"
          >
            <Gift size={16} /> Receber
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : producoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film size={64} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground mb-2">Nenhuma produção ainda</h3>
            <p className="text-sm text-muted-foreground">Crie uma história e gere vídeos para vê-los aqui!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {producoes.map((prod) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden border border-border bg-card shadow-md hover:shadow-lg transition-shadow group cursor-pointer"
                onClick={() => handleOpen(prod)}
              >
                <div className="relative aspect-video">
                  {prod.capa_url ? (
                    <img src={prod.capa_url} alt={prod.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Film size={40} className="text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={40} className="text-white" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShareProd(prod); }}
                      className="p-1.5 rounded-full bg-primary/80 text-white hover:bg-primary transition-colors"
                      title="Enviar para amigo"
                    >
                      <Gift size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(prod); }}
                      className="p-1.5 rounded-full bg-[#25D366]/80 text-white hover:bg-[#25D366] transition-colors"
                    >
                      <Share2 size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(prod.id); }}
                      className="p-1.5 rounded-full bg-destructive/80 text-white hover:bg-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground truncate">{prod.titulo}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {prod.cenas.length} cenas • {prod.genero} • {new Date(prod.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Shared productions */}
        {sharedProds.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Gift size={18} className="text-secondary" />
              <h3 className="text-lg font-display font-bold text-foreground">Recebidos de amigos</h3>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-bold">{sharedProds.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedProds.map((prod: any) => (
                <motion.div
                  key={`shared-${prod.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl overflow-hidden border-2 border-secondary/30 bg-card shadow-md hover:shadow-lg transition-shadow group cursor-pointer relative"
                  onClick={() => handleOpen(prod)}
                >
                  <div className="relative aspect-video">
                    {prod.capa_url ? (
                      <img src={prod.capa_url} alt={prod.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                        <Film size={40} className="text-secondary/40" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-secondary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Gift size={10} /> de {prod._sharedFrom}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground truncate">{prod.titulo}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prod.cenas?.length || 0} cenas • {prod.genero}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Player Modal */}
      <AnimatePresence>
        {openProd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex"
          >
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {openProd.cenas[currentScene] && (
                    <motion.div
                      key={`prod-scene-${currentScene}`}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0"
                    >
                      {openProd.cenas[currentScene].videoUrl ? (
                        <video
                          ref={videoRef}
                          src={openProd.cenas[currentScene].videoUrl!}
                          className="w-full h-full object-cover"
                          autoPlay loop playsInline
                        />
                      ) : openProd.cenas[currentScene].imageUrl ? (
                        <CinematicScene
                          imageUrl={openProd.cenas[currentScene].imageUrl!}
                          isPlaying={isPlaying}
                          sceneIndex={currentScene}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                      )}
                      {/* Cinema-style yellow subtitle at bottom */}
                      <div className="absolute bottom-2 left-0 right-0 px-6 flex flex-col items-center pointer-events-none">
                        <div className="max-w-3xl w-full">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-5 py-2.5">
                            <p
                              className="text-center font-bold leading-relaxed drop-shadow-lg"
                              style={{
                                color: '#FFD700',
                                fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
                                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.7)',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {openProd.cenas[currentScene].texto}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-3 mt-1.5">
                            <span className="text-white/40 text-[10px] font-medium tracking-wide uppercase">
                              {openProd.cenas[currentScene].titulo}
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="text-white/30 text-[10px]">
                              {currentScene + 1}/{openProd.cenas.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between px-6 py-4 bg-black/90 border-t border-white/10">
                <button onClick={handleClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                  <X size={16} /> Sair
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => playScene(currentScene)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                    <RotateCcw size={16} /> Rever
                  </button>
                  <button onClick={handleTogglePlay} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  {currentScene < openProd.cenas.length - 1 ? (
                    <button onClick={() => setCurrentScene(s => s + 1)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                      Próxima <SkipForward size={16} />
                    </button>
                  ) : (
                    <button onClick={handleClose} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/80 transition-colors">
                      Finalizar
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSidebar(s => !s)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                    {showSidebar ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                    Cenas
                  </button>
                  <button onClick={() => handleShare(openProd)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#25D366]/20 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/30 transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="h-full bg-black/95 border-l border-white/10 overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <Film size={16} /> Cenas
                    </h4>
                    <button onClick={() => setShowSidebar(false)} className="text-white/50 hover:text-white"><X size={14} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {openProd.cenas.map((cena, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setCurrentScene(idx); playScene(idx); }}
                        className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all ${
                          currentScene === idx ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="relative aspect-video">
                          {cena.videoUrl ? (
                            <video src={cena.videoUrl} className="w-full h-full object-cover" muted playsInline />
                          ) : cena.imageUrl ? (
                            <img src={cena.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center"><span className="text-2xl">🎨</span></div>
                          )}
                          {currentScene === idx && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Play size={24} className="text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-white text-xs font-bold truncate">{cena.titulo}</p>
                          <p className="text-white/50 text-[10px]">Cena {idx + 1}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share & Receive Modals */}
      {shareProd && (
        <ShareItemModal
          open={!!shareProd}
          onClose={() => setShareProd(null)}
          itemId={shareProd.id}
          itemType="production"
          itemTitle={shareProd.titulo}
        />
      )}
      <ReceiveItemModal
        open={showReceive}
        onClose={() => setShowReceive(false)}
        itemType="production"
        onReceived={fetchSharedProds}
      />
    </div>
  );
}
