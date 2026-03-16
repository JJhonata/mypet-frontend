import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { DarkModeToggle } from "../components/ui/DarkModeToggle";

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8 text-amber-700 dark:text-amber-300" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Acesso negado</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Seu perfil não possui permissão para acessar esta área.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="figma-btn-white"
          >
            Ir para login
          </button>
          <button
            onClick={() => navigate(-1)}
            className="figma-btn"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
