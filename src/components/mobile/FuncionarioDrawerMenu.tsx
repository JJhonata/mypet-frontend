import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, PawPrint, UserCircle2, LogOut, X, History } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AvatarUpload } from "../ui/AvatarUpload";
import { DarkModeToggle } from "../ui/DarkModeToggle";

export function FuncionarioDrawerMenu({
  open,
  onClose,
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
                nome={user?.nome ?? "Funcionário"}
                onUpload={async () => {}}
              />
              <div className="leading-tight min-w-0">
                <p className="text-xs text-slate-700 dark:text-slate-300">Funcionário</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.nome ?? "Funcionário"}
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
          <MenuLink to="/funcionario" label="Dashboard" icon={<LayoutDashboard className="h-5 w-5 flex-shrink-0" />} onClose={onClose} />
          <MenuLink to="/funcionario/agendamentos" label="Agendamentos" icon={<Calendar className="h-5 w-5 flex-shrink-0" />} onClose={onClose} />
          <MenuLink to="/funcionario/clientes" label="Clientes" icon={<Users className="h-5 w-5 flex-shrink-0" />} onClose={onClose} />
          <MenuLink to="/funcionario/pets" label="Pets" icon={<PawPrint className="h-5 w-5 flex-shrink-0" />} onClose={onClose} />
          <MenuLink to="/funcionario/perfil" label="Meu Perfil" icon={<UserCircle2 className="h-5 w-5 flex-shrink-0" />} onClose={onClose} />
          <MenuLink to="/funcionario/historico" label="Histórico" icon={<History className="h-5 w-5 flex-shrink-0" />} onClose={onClose} />
        </nav>

        <div className="fixed bottom-0 left-0 w-[85vw] max-w-sm px-5 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={handleLogout} className="figma-btn w-full flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuLink({
  to,
  label,
  icon,
  onClose,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/funcionario"}
      onClick={onClose}
      className={({ isActive }) =>
        `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
          isActive
            ? "bg-emerald-700 text-white shadow-md"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
