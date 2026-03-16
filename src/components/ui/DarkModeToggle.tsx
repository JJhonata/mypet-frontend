import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function DarkModeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 active:scale-95"
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600" />
      )}
    </button>
  );
}
