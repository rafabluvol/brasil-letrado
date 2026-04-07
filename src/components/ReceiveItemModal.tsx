import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReceiveItemModalProps {
  open: boolean;
  onClose: () => void;
  itemType: "book" | "production";
  onReceived: () => void;
}

export default function ReceiveItemModal({ open, onClose, itemType, onReceived }: ReceiveItemModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [receivedTitle, setReceivedTitle] = useState("");

  const handleClaim = async () => {
    if (!user || !code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Look up the share code
      const { data: items, error: fetchErr } = await supabase
        .from("shared_items" as any)
        .select("*")
        .eq("share_code", code.trim().toUpperCase())
        .eq("status", "pending")
        .is("recipient_id", null)
        .limit(1);

      if (fetchErr) throw fetchErr;
      const shared = (items as any[])?.[0];

      if (!shared) {
        setError("Código não encontrado ou já foi usado.");
        setLoading(false);
        return;
      }

      if (shared.owner_id === user.id) {
        setError("Você não pode resgatar seu próprio compartilhamento!");
        setLoading(false);
        return;
      }

      if (shared.item_type !== itemType) {
        setError(itemType === "book" 
          ? "Esse código é de um vídeo, não de um livro. Tente em 'Minhas Produções'." 
          : "Esse código é de um livro, não de um vídeo. Tente na 'Estante'.");
        setLoading(false);
        return;
      }

      // Check same grade
      if (shared.owner_ano && profile?.ano_escolar && shared.owner_ano !== profile.ano_escolar) {
        setError(`Este conteúdo é de um aluno do ${shared.owner_ano}º ano. Vocês precisam estar na mesma série!`);
        setLoading(false);
        return;
      }

      // Claim it
      const { error: updateErr } = await supabase
        .from("shared_items" as any)
        .update({
          recipient_id: user.id,
          status: "accepted",
          accepted_at: new Date().toISOString(),
        } as any)
        .eq("id", shared.id);

      if (updateErr) throw updateErr;

      // Fetch title from source table
      const table = shared.item_type === "book" ? "student_books" : "student_productions";
      const { data: sourceItem } = await supabase
        .from(table)
        .select("titulo")
        .eq("id", shared.item_id)
        .single();

      setReceivedTitle((sourceItem as any)?.titulo || "Item");
      setSuccess(true);
      toast({ title: `🎉 Você recebeu: "${(sourceItem as any)?.titulo || "Item"}"!` });
      onReceived();
    } catch (err: any) {
      console.error(err);
      setError("Erro ao resgatar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError(null);
    setSuccess(false);
    setReceivedTitle("");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        >
          <button onClick={handleClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
              <Gift size={28} className="text-secondary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              {success ? "Recebido! 🎉" : "Receber conteúdo"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {success
                ? `"${receivedTitle}" agora aparece na sua ${itemType === "book" ? "estante" : "galeria"}!`
                : "Digite o código que seu amigo compartilhou"}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                placeholder="Ex: LEAO-3X9K"
                className="w-full text-center text-2xl font-mono font-bold tracking-wider px-4 py-4 rounded-xl border-2 border-border bg-muted text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors"
                maxLength={12}
                autoFocus
              />

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={loading || code.trim().length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                {loading ? "Resgatando..." : "Resgatar"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
