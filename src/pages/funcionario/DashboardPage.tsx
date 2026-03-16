import { useNavigate } from "react-router-dom";
import { Calendar, Users, PawPrint, UserCircle2 } from "lucide-react";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAuth } from "../../context/AuthContext";
import { useFuncionarioShell } from "./Layout";

export function FuncionarioDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openMenu } = useFuncionarioShell();

  return (
    <div className="pb-10">
      <TopBarTitle title="Painel do Funcionário" onMenuClick={openMenu} />

      <div className="pt-6 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Olá,</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {user?.nome ?? "Funcionário"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use os atalhos abaixo para acessar as rotinas do dia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction
            title="Agendamentos"
            description="Ver e atualizar atendimentos"
            icon={<Calendar className="h-6 w-6 text-emerald-700" />}
            onClick={() => navigate("/funcionario/agendamentos")}
          />
          <QuickAction
            title="Clientes"
            description="Consultar dados dos clientes"
            icon={<Users className="h-6 w-6 text-emerald-700" />}
            onClick={() => navigate("/funcionario/clientes")}
          />
          <QuickAction
            title="Pets"
            description="Consultar dados dos pets"
            icon={<PawPrint className="h-6 w-6 text-emerald-700" />}
            onClick={() => navigate("/funcionario/pets")}
          />
          <QuickAction
            title="Meu Perfil"
            description="Ver e editar meus dados"
            icon={<UserCircle2 className="h-6 w-6 text-emerald-700" />}
            onClick={() => navigate("/funcionario/perfil")}
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-600 hover:shadow-md transition-all"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
        {icon}
      </div>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </button>
  );
}
