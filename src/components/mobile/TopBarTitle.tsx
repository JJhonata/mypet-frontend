import { X, Menu } from "lucide-react";
import { DarkModeToggle } from "../ui/DarkModeToggle";

export function TopBarTitle({
  title,
  onClose,
  onMenuClick
}: {
  title: string;
  onClose?: () => void;
  onMenuClick?: () => void;
}) {
  return (
    <div className="-mx-5 px-5 pt-4 md:mx-0 md:px-0 md:pt-2">
      <div className="grid grid-cols-3 items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMenuClick}
            disabled={!onMenuClick}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5 text-slate-800 dark:text-slate-200" />
          </button>
        </div>
        <div className="text-center min-w-0">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</p>
        </div>
        <div className="flex justify-end">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full active:scale-[0.98]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            </button>
          ) : (
            <DarkModeToggle />
          )}
        </div>
      </div>
      <div className="mt-2 figma-divider" />
    </div>
  );
}

