import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, QrCode, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ShareItemModalProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemType: "book" | "production";
  itemTitle: string;
}

function generateShareCode(): string {
  const words = ["LEAO", "GATO", "URSO", "LOBO", "PATO", "SAPO", "TUTU", "MICO", "FOCA", "ARARA", "ONCA", "CORUJA"];
  const word = words[Math.floor(Math.random() * words.length)];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${word}-${code}`;
}

export default function ShareItemModal({ open, onClose, itemId, itemType, itemTitle }: ShareItemModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    const fetchOrCreate = async () => {
      setLoading(true);
      // Check existing share code
      const { data: existing } = await supabase
        .from("shared_items" as any)
        .select("share_code")
        .eq("item_id", itemId)
        .eq("owner_id", user.id)
        .eq("status", "pending")
        .is("recipient_id", null)
        .limit(1);

      if (existing && (existing as any[]).length > 0) {
        setShareCode((existing as any[])[0].share_code);
      } else {
        const code = generateShareCode();
        await supabase.from("shared_items" as any).insert({
          share_code: code,
          item_type: itemType,
          item_id: itemId,
          owner_id: user.id,
          owner_name: profile?.nome || "Amigo",
          owner_ano: profile?.ano_escolar || null,
        } as any);
        setShareCode(code);
      }
      setLoading(false);
    };
    fetchOrCreate();
  }, [open, user, itemId]);

  const handleCopy = () => {
    if (!shareCode) return;
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    toast({ title: "Código copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = shareCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareCode)}`
    : null;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Gift size={28} className="text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Compartilhar</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">"{itemTitle}"</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : shareCode ? (
            <div className="space-y-5">
              {/* Code display */}
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Código de compartilhamento</p>
                <p className="text-3xl font-mono font-bold text-primary tracking-wider">{shareCode}</p>
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copiado!" : "Copiar código"}
              </button>

              {/* QR Code */}
              {qrUrl && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <QrCode size={14} /> ou escaneie o QR Code
                  </div>
                  <img src={qrUrl} alt="QR Code" className="w-36 h-36 rounded-lg border border-border" />
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Seu amigo precisa estar na mesma série e ter uma conta ativa para receber!
              </p>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
