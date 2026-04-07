import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ChevronLeft, ChevronRight, Download, Share2, ArrowLeft, Loader2, Gift } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { playPageTurnSound } from "@/lib/sounds";
import ShareItemModal from "@/components/ShareItemModal";
import ReceiveItemModal from "@/components/ReceiveItemModal";

interface Pagina {
  numero: number;
  titulo: string;
  texto: string;
  imagemUrl: string;
}

interface Livro {
  id: string;
  titulo: string;
  autor?: string;
  resumo?: string;
  genero: string;
  ano: string;
  capa_url: string;
  paginas: Pagina[];
  created_at: string;
}

export default function Estante() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [openBook, setOpenBook] = useState<Livro | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev">("next");
  const [isTurning, setIsTurning] = useState(false);
  const [shareBook, setShareBook] = useState<Livro | null>(null);
  const [showReceive, setShowReceive] = useState(false);
  const [sharedBooks, setSharedBooks] = useState<Livro[]>([]);

  useEffect(() => {
    const novoLivro = location.state?.novoLivro;
    if (novoLivro && user) {
      const saveBook = async () => {
        try {
          // Upsert: if same user+titulo exists, update it instead of duplicating
          const { error } = await supabase.from("student_books").upsert(
            {
              user_id: user.id,
              titulo: novoLivro.titulo,
              autor: novoLivro.autor || "Jovem Autor",
              genero: novoLivro.genero || "",
              ano: novoLivro.ano || "",
              capa_url: novoLivro.capaUrl || "",
              resumo: novoLivro.resumo || "",
              paginas: novoLivro.paginas || [],
            },
            { onConflict: "user_id,titulo" }
          );
          if (error) throw error;
          window.history.replaceState({}, document.title);
          fetchBooks();
        } catch (err: any) {
          console.error("Error saving book:", err);
          toast({ title: "Erro ao salvar livro", description: err.message, variant: "destructive" });
        }
      };
      saveBook();
    }
  }, [location.state, user]);

  const fetchBooks = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("student_books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLivros((data || []).map((d: any) => ({
        id: d.id,
        titulo: d.titulo,
        autor: d.autor,
        resumo: d.resumo,
        genero: d.genero,
        ano: d.ano,
        capa_url: d.capa_url,
        paginas: d.paginas as Pagina[],
        created_at: d.created_at,
      })));
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); fetchSharedBooks(); }, [user]);

  const fetchSharedBooks = async () => {
    if (!user) return;
    try {
      const { data: sharedItems } = await supabase
        .from("shared_items" as any)
        .select("*")
        .eq("recipient_id", user.id)
        .eq("item_type", "book")
        .eq("status", "accepted");
      if (!sharedItems || (sharedItems as any[]).length === 0) { setSharedBooks([]); return; }
      const bookIds = (sharedItems as any[]).map((s: any) => s.item_id);
      const ownerNames = Object.fromEntries((sharedItems as any[]).map((s: any) => [s.item_id, s.owner_name]));
      const { data: books } = await supabase
        .from("student_books")
        .select("*")
        .in("id", bookIds);
      setSharedBooks((books || []).map((d: any) => ({
        id: d.id,
        titulo: d.titulo,
        autor: ownerNames[d.id] || d.autor,
        resumo: d.resumo,
        genero: d.genero,
        ano: d.ano,
        capa_url: d.capa_url,
        paginas: d.paginas as Pagina[],
        created_at: d.created_at,
        _shared: true,
      })) as any);
    } catch (err) { console.error("Error fetching shared books:", err); }
  };

  const handleOpenBook = (livro: Livro) => {
    setOpenBook(livro);
    setCurrentPage(0);
    setTurnDirection("next");
    setIsTurning(false);

    const url = new URL(window.location.href);
    url.searchParams.set("livro", livro.id);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const handleCloseBook = () => {
    setOpenBook(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("livro");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const goToPage = useCallback((dir: "next" | "prev", max: number) => {
    if (isTurning) return;
    setIsTurning(true);
    setTurnDirection(dir);
    playPageTurnSound();
    setTimeout(() => {
      setCurrentPage((p) => (dir === "next" ? Math.min(max, p + 1) : Math.max(0, p - 1)));
      setIsTurning(false);
    }, 400);
  }, [isTurning]);

  useEffect(() => {
    const livroId = new URLSearchParams(location.search).get("livro");
    if (!livroId || livros.length === 0 || openBook) return;

    const livro = livros.find((item) => item.id === livroId);
    if (livro) {
      setOpenBook(livro);
      setCurrentPage(0);
      setTurnDirection("next");
      setIsTurning(false);
    }
  }, [location.search, livros, openBook]);

  const handleShare = (livro: Livro) => {
    const shareUrl = `${window.location.origin}/estante?livro=${livro.id}`;
    const text = `📚 Olha o livrinho que eu criei no Brasil Letrado!\n\n"${livro.titulo}"\n\nLeia aqui: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadPdf = async (livro: Livro) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Erro", description: "Permita pop-ups para baixar o PDF", variant: "destructive" });
      return;
    }

    const pagesHtml = livro.paginas
      .map(
        (p, i) => `
      <div style="page-break-after: always; padding: 40px; text-align: center; font-family: 'Comic Sans MS', 'Segoe UI', sans-serif;">
        ${p.imagemUrl ? `<img src="${p.imagemUrl}" style="max-width: 80%; max-height: 400px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />` : ""}
        <h2 style="color: #2d6a4f; font-size: 24px; margin-bottom: 16px;">${p.titulo}</h2>
        <p style="font-size: 18px; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto;">${p.texto}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">Página ${i + 1}</p>
      </div>
    `,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${livro.titulo}</title>
        <style>
          @media print { body { margin: 0; } }
          body { font-family: 'Comic Sans MS', 'Segoe UI', sans-serif; margin: 0; }
        </style>
      </head>
      <body>
        <div style="page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #e8f5e9, #fff3e0);">
          ${livro.capa_url ? `<img src="${livro.capa_url}" style="max-width: 70%; max-height: 500px; border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); margin-bottom: 24px;" />` : ""}
          <h1 style="color: #2d6a4f; font-size: 32px;">${livro.titulo}</h1>
          <p style="color: #666; font-size: 16px;">Um livrinho criado na sabIA 📚</p>
        </div>
        ${pagesHtml}
        <script>
          const imgs = Array.from(document.images || []);
          Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          }))).then(() => {
            setTimeout(() => {
              window.focus();
              window.print();
            }, 150);
          });
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">📚</span>
          <h2 className="font-display text-2xl text-foreground mb-2">Minha Estante</h2>
          <p className="text-muted-foreground font-semibold mb-4">Faça login para ver seus livrinhos!</p>
          <button onClick={() => navigate("/auth")} className="btn-hero">Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container py-8">
          <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen size={22} className="text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl text-foreground">Minha Estante</h2>
            <p className="text-sm text-muted-foreground font-semibold">{livros.length} livrinhos</p>
          </div>
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
        ) : livros.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">📖</span>
            <h3 className="font-display text-xl text-foreground mb-2">Sua estante está vazia</h3>
            <p className="text-muted-foreground font-semibold mb-6">Complete uma atividade e gere seu primeiro livrinho!</p>
            <button onClick={() => navigate("/")} className="btn-hero">Começar Atividade</button>
          </div>
        ) : (
          <div className="relative">
            {Array.from({ length: Math.ceil(livros.length / 4) }).map((_, rowIdx) => (
              <div key={rowIdx} className="mb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pb-4">
                  {livros.slice(rowIdx * 4, (rowIdx + 1) * 4).map((livro) => (
                    <div
                      key={livro.id}
                      className="relative cursor-pointer group"
                      onMouseEnter={() => setHoveredBook(livro.id)}
                      onMouseLeave={() => setHoveredBook(null)}
                      onClick={() => handleOpenBook(livro)}
                    >
                      {/* Book cover */}
                      <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden shadow-lg border-2 border-border/40">
                        {livro.capa_url ? (
                          <img
                            src={livro.capa_url}
                            alt={livro.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-info/20 flex items-center justify-center">
                            <span className="text-5xl">📚</span>
                          </div>
                        )}
                        {/* Spine effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/20 to-transparent" />

                        {/* Hover overlay with summary */}
                        <motion.div
                          initial={false}
                          animate={{ opacity: hoveredBook === livro.id ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center pointer-events-none"
                        >
                          <h4 className="font-display text-sm text-white leading-tight mb-2">{livro.titulo}</h4>
                          {livro.resumo && (
                            <p className="text-xs text-white/80 line-clamp-3 mb-2">{livro.resumo}</p>
                          )}
                          {livro.autor && (
                            <p className="text-xs text-white/60 italic">por {livro.autor}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 pointer-events-auto">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShareBook(livro); }}
                              className="px-3 py-1 rounded-lg bg-primary/80 text-white text-xs font-bold hover:bg-primary transition-colors flex items-center gap-1"
                            >
                              <Gift size={12} /> Enviar
                            </button>
                            <span className="text-xs text-primary font-bold">Ler</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Shelf bar */}
                <div className="h-3 bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800 rounded-sm shadow-[0_4px_8px_rgba(0,0,0,0.2)]" />
                <div className="h-1 bg-amber-900/30 rounded-b-sm" />
              </div>
            ))}
          </div>
        )}

        {/* Shared books section */}
        {sharedBooks.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Gift size={18} className="text-secondary" />
              <h3 className="font-display text-lg text-foreground font-bold">Recebidos de amigos</h3>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-bold">{sharedBooks.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {sharedBooks.map((livro) => (
                <div
                  key={`shared-${livro.id}`}
                  className="relative cursor-pointer group"
                  onClick={() => handleOpenBook(livro)}
                >
                  <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden shadow-lg border-2 border-secondary/30">
                    {livro.capa_url ? (
                      <img src={livro.capa_url} alt={livro.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                        <span className="text-5xl">📚</span>
                      </div>
                    )}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/20 to-transparent" />
                    <div className="absolute top-2 left-2 bg-secondary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Gift size={10} /> de {livro.autor}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-2 truncate">{livro.titulo}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Reader Modal */}
      <AnimatePresence>
        {openBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseBook}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col"
              style={{ fontFamily: "'Comic Sans MS', 'Segoe UI', sans-serif" }}
            >
              <button
                onClick={handleCloseBook}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex-1 overflow-hidden relative" style={{ perspective: "1200px" }}>
                <AnimatePresence mode="wait">
                  {currentPage === 0 && (
                    <motion.div
                      key="cover"
                      initial={{ rotateY: turnDirection === "next" ? -90 : 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: turnDirection === "next" ? 90 : -90, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      style={{ transformOrigin: turnDirection === "next" ? "left center" : "right center" }}
                      className="p-8 text-center"
                    >
                      {openBook.capa_url && (
                        <img
                          src={openBook.capa_url}
                          alt={openBook.titulo}
                          className="w-full max-h-[400px] object-contain rounded-xl shadow-lg mb-6"
                        />
                      )}
                      <h2 className="text-2xl font-bold text-[#2d6a4f] mb-1">{openBook.titulo}</h2>
                      <p className="text-base text-[#555] italic mb-1">por {openBook.autor || "Jovem Autor"}</p>
                      <p className="text-sm text-muted-foreground">Um livrinho criado na sabIA 📚</p>
                    </motion.div>
                  )}

                  {currentPage > 0 && currentPage <= openBook.paginas.length && (() => {
                    const page = openBook.paginas[currentPage - 1];
                    return (
                      <motion.div
                        key={`page-${currentPage}`}
                        initial={{ rotateY: turnDirection === "next" ? -90 : 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: turnDirection === "next" ? 90 : -90, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ transformOrigin: turnDirection === "next" ? "left center" : "right center" }}
                        className="flex flex-col md:flex-row h-full min-h-[420px]"
                      >
                        <div className="md:w-1/2 w-full bg-white flex items-center justify-center p-6 md:border-r border-border">
                          {page.imagemUrl ? (
                            <img
                              src={page.imagemUrl}
                              alt={page.titulo}
                              className="w-full max-h-[380px] object-contain rounded-xl shadow-md"
                            />
                          ) : (
                            <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                              <span className="text-6xl">🎨</span>
                            </div>
                          )}
                        </div>

                        <div className="md:w-1/2 w-full flex flex-col items-center justify-center p-8 bg-white">
                          <h3 className="text-xl font-bold text-[#2d6a4f] mb-6 text-center">
                            {page.titulo}
                          </h3>
                          <p className="text-base leading-[2] text-[#333] max-w-sm text-center">
                            {page.texto}
                          </p>
                          <p className="text-xs text-muted-foreground mt-8">
                            Página {currentPage} de {openBook.paginas.length}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8e0d0]">
                <button
                  onClick={() => goToPage("prev", openBook.paginas.length)}
                  disabled={currentPage === 0 || isTurning}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm disabled:opacity-30 hover:bg-primary/20 transition-colors"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPdf(openBook)}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    title="Baixar PDF"
                  >
                    <Download size={18} className="text-foreground" />
                  </button>
                  <button
                    onClick={() => handleShare(openBook)}
                    className="p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                    title="Compartilhar no WhatsApp"
                  >
                    <Share2 size={18} className="text-[#25D366]" />
                  </button>
                </div>

                <button
                  onClick={() => goToPage("next", openBook.paginas.length)}
                  disabled={currentPage >= openBook.paginas.length || isTurning}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm disabled:opacity-30 hover:bg-primary/20 transition-colors"
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share & Receive Modals */}
      {shareBook && (
        <ShareItemModal
          open={!!shareBook}
          onClose={() => setShareBook(null)}
          itemId={shareBook.id}
          itemType="book"
          itemTitle={shareBook.titulo}
        />
      )}
      <ReceiveItemModal
        open={showReceive}
        onClose={() => setShowReceive(false)}
        itemType="book"
        onReceived={fetchSharedBooks}
      />
    </div>
  );
}
