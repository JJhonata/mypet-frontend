import { Search, Menu } from "lucide-react";

export function TopBarGreeting({
  nome,
  onRightClick
}: {
  nome: string;
  onRightClick?: () => void;
}) {
  return (
    <div className="-mx-5 px-5 pt-4 md:mx-0 md:px-0 md:pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onRightClick}
            disabled={!onRightClick}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </button>

          <div className="leading-tight min-w-0">
          <p className="text-sm text-slate-700 dark:text-slate-300">Olá,</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-10 w-10 hidden md:inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>
      <div className="mt-3 figma-divider" />
    </div>
  );
}

