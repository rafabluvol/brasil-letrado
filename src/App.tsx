import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import TutorWidget from "@/components/TutorWidget";
import Index from "./pages/Index.tsx";
import Atividade from "./pages/Atividade.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import BNCC from "./pages/BNCC.tsx";
import Auth from "./pages/Auth.tsx";
import Estante from "./pages/Estante.tsx";
import Producoes from "./pages/Producoes.tsx";
import Vivenciando from "./pages/Vivenciando.tsx";
import Conquistas from "./pages/Conquistas.tsx";
import Professor from "./pages/Professor.tsx";
import NotFound from "./pages/NotFound.tsx";
import { playPipeSound } from "@/lib/sounds";

const queryClient = new QueryClient();

function GlobalSoundListener({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role='button'], .btn-hero")) {
        playPipeSound();
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <GlobalSoundListener>
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/atividade" element={<Atividade />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bncc" element={<BNCC />} />
              <Route path="/estante" element={<Estante />} />
              <Route path="/producoes" element={<Producoes />} />
              <Route path="/vivenciando" element={<Vivenciando />} />
              <Route path="/conquistas" element={<Conquistas />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/professor" element={<Professor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <TutorWidget />
          </GlobalSoundListener>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
