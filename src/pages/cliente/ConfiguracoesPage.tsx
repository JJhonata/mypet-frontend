import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";

export function ConfiguracoesPage() {
  const navigate = useNavigate();
  const { openMenu } = useClienteShell();
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    lembretes: true
  });

  const toggleClass =
    "w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700";

  function handleLogout() {
    localStorage.removeItem("mypet:user");
    localStorage.removeItem("mypet:token");
    navigate("/login");
  }

  const SettingItemWhite = ({ label, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-600">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
      </label>
    </div>
  );

  return (
    <div className="pb-10">
      <TopBarTitle title="Configurações" onMenuClick={openMenu} />

      <div className="px-4 sm:px-6 pt-6 space-y-4">
        {/* Notificações */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-2 animate-fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Notificações</h2>
          </div>
          <SettingItemWhite
            label="Por Email"
            desc="Atualizações importantes"
            checked={notificacoes.email}
            onChange={(e: any) => setNotificacoes({...notificacoes, email: e.target.checked})}
          />
          <SettingItemWhite
            label="Lembretes"
            desc="Dos seus agendamentos"
            checked={notificacoes.lembretes}
            onChange={(e: any) => setNotificacoes({...notificacoes, lembretes: e.target.checked})}
          />
        </div>

        {/* Ações */}
        <div className="space-y-3 pt-4 animate-slide-up">
          <button
            onClick={handleLogout}
            className="figma-btn-white w-full flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Fazer Logout
          </button>
        </div>
      </div>
    </div>
  );
}
