import { NavLink, useNavigate } from "react-router-dom";
import { Home, User, Plus, X, Calendar, History, Phone, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AvatarUpload } from "../ui/AvatarUpload";
import { DarkModeToggle } from "../ui/DarkModeToggle";

export function DrawerMenu({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="fixed inset-0 bg-black/30 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto transition-transform duration-300 translate-x-0">
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarUpload
                readonly
                size={36}
                fotoUrl={user?.foto}
                nome={user?.nome ?? "Cliente"}
                onUpload={async () => { }}
              />
              <div className="leading-tight min-w-0">
                <p className="text-xs text-slate-700 dark:text-slate-300">Olá,</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.nome ?? "Cliente"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 flex-shrink-0 inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5 text-slate-800 dark:text-slate-200" />
              </button>
            </div>
          </div>
          <div className="mt-3 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <nav className="px-5 pt-4 pb-20 space-y-1">
          <NavLink
            to="/app"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${isActive
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            <span>Página Inicial</span>
          </NavLink>

          <NavLink
            to="/app/pets"
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${isActive
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Plus className="h-5 w-5 flex-shrink-0" />
            <span>Pets</span>
          </NavLink>

          <NavLink
            to="/app/agendamentos"
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${isActive
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Calendar className="h-5 w-5 flex-shrink-0" />
            <span>Agendamentos</span>
          </NavLink>

          <NavLink
            to="/app/historico"
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${isActive
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <History className="h-5 w-5 flex-shrink-0" />
            <span>Histórico</span>
          </NavLink>

          <NavLink
            to="/app/contatos"
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${isActive
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Phone className="h-5 w-5 flex-shrink-0" />
            <span>Contatos</span>
          </NavLink>

          <NavLink
            to="/app/configuracoes"
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${isActive
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>Configurações</span>
          </NavLink>

          <NavLink
            to="/app/perfil"
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${isActive
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <User className="h-5 w-5 flex-shrink-0" />
            <span>Perfil</span>
          </NavLink>
        </nav>

        <div className="fixed bottom-0 left-0 w-[85vw] max-w-sm px-5 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={handleLogout} className="figma-btn w-full">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

