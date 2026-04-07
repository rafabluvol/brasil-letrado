import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import sabiaLogo from "@/assets/sabia-logo.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [anoEscolar, setAnoEscolar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        navigate("/");
      } else {
        if (!nome.trim()) {
          toast({ title: "Preencha seu nome", variant: "destructive" });
          setLoading(false);
          return;
        }
        if (!anoEscolar) {
          toast({ title: "Selecione o ano escolar", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { nome, ano_escolar: anoEscolar },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (data.session) {
          toast({ title: "Conta criada com sucesso!", description: "Bem-vindo(a) à plataforma!" });
          navigate("/");
        } else {
          toast({ title: "Cadastro realizado!", description: "Verifique seu e-mail para confirmar a conta." });
        }
      }
    } catch (err: any) {
      toast({
        title: isLogin ? "Erro ao entrar" : "Erro ao cadastrar",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={sabiaLogo} alt="Brasil Letrado" className="w-16 h-16 mx-auto mb-3" />
          <h2 className="text-2xl font-display font-bold text-foreground">
            {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Entre para continuar aprendendo" : "Comece sua jornada de aprendizado"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-lg">
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Nome</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Ano Escolar</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={anoEscolar}
                    onChange={(e) => setAnoEscolar(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
                  >
                    <option value="">Selecione o ano</option>
                    <option value="1">1º ano</option>
                    <option value="2">2º ano</option>
                    <option value="3">3º ano</option>
                    <option value="4">4º ano</option>
                    <option value="5">5º ano</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "var(--gradient-hero)" }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isLogin ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Cadastre-se" : "Fazer login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
