import { useRouteError } from "react-router-dom";
import { DarkModeToggle } from "../components/ui/DarkModeToggle";

export function ErrorPage() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Ops! Algo deu errado</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <details className="text-left text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded">
          <summary className="cursor-pointer font-medium">Detalhes do erro</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {error?.message || "Erro desconhecido"}
          </pre>
        </details>
        <button
          onClick={() => window.location.reload()}
          className="figma-btn mt-4"
        >
          Recarregar página
        </button>
      </div>
    </div>
  );
}
