import { NavLink, useNavigate } from "react-router-dom";
import { Home, User, Plus, LogOut, Calendar, History, Phone, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DarkModeToggle } from "./ui/DarkModeToggle";
import { AvatarUpload } from "./ui/AvatarUpload";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
  const activeClass = "bg-emerald-700 text-white shadow-md";
  const inactiveClass = "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:border-r md:border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-40">
      <div className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarUpload
                readonly
                size={40}
                fotoUrl={user?.foto}
                nome={user?.nome ?? "Cliente"}
                onUpload={async () => { }}
              />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">Olá,</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.nome ?? "Cliente"}
                </p>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            Página inicial
          </NavLink>
          <NavLink
            to="/app/perfil"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <User className="h-5 w-5 flex-shrink-0" />
            Conta
          </NavLink>
          <NavLink
            to="/app/pets"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Plus className="h-5 w-5 flex-shrink-0" />
            Pets
          </NavLink>
          <NavLink
            to="/app/agendamentos"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Calendar className="h-5 w-5 flex-shrink-0" />
            Agendamentos
          </NavLink>
          <NavLink
            to="/app/historico"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <History className="h-5 w-5 flex-shrink-0" />
            Histórico
          </NavLink>
          <NavLink
            to="/app/contatos"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Phone className="h-5 w-5 flex-shrink-0" />
            Contatos
          </NavLink>
          <NavLink
            to="/app/configuracoes"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            Configurações
          </NavLink>
        </nav>

        <div className="px-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={handleLogout}
            className={`${linkClass} ${inactiveClass} w-full text-left`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
