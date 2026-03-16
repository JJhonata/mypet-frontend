import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { api, Agendamento, Cliente, Pet } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useAuth } from "../../context/AuthContext";

function formatarTipoServico(tipo: string) {
  if (tipo === "BANHO") return "Banho";
  if (tipo === "TOSA") return "Tosa";
  if (tipo === "VETERINARIO") return "Veterinário";
  return tipo;
}

function formatarStatus(status: string) {
  if (status === "AGENDADO") return "Agendado";
  if (status === "EM_ANDAMENTO") return "Em andamento";
  if (status === "CONCLUIDO") return "Concluído";
  if (status === "CANCELADO") return "Cancelado";
  return status;
}

export function AgendamentoDetalhesPage() {
  const navigate = useNavigate();
  const { openMenu } = useAdminShell();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRADOR";
  const flash = (location.state as { flash?: { type: "success" | "error" | "info"; message: string } } | null)?.flash;

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const agendamentoId = Number(id);
        if (!agendamentoId) {
          setErro("Agendamento inválido.");
          return;
        }

        const dadosAgendamento = await api.obterAgendamento(agendamentoId);
        if (!dadosAgendamento) {
          setErro("Agendamento não encontrado.");
          return;
        }

        const [dadosCliente, dadosPet] = await Promise.all([
          api.obterCliente(dadosAgendamento.clienteId),
          api.obterPet(dadosAgendamento.petId)
        ]);

        setAgendamento(dadosAgendamento);
        setCliente(dadosCliente ?? null);
        setPet(dadosPet ?? null);
      } catch (error) {
        setErro("Não foi possível carregar o agendamento.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (!user || (user.role !== "ADMINISTRADOR" && user.role !== "SUPER_USUARIO")) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Detalhes do Agendamento" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (erro || !agendamento) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Detalhes do Agendamento" onMenuClick={openMenu} />
        <div className="pt-10 text-center">
          <p className="text-slate-700">{erro ?? "Agendamento não encontrado."}</p>
          <button type="button" onClick={() => navigate("/admin/agendamentos")} className="figma-btn mt-6">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Detalhes do Agendamento" onMenuClick={openMenu} />

      <div className="pt-6 space-y-5 max-w-2xl mx-auto">
        {flash && <StatusMessage type={flash.type} message={flash.message} />}

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <p className="text-sm text-slate-700"><span className="font-medium">Serviço:</span> {formatarTipoServico(agendamento.tipoServico)}</p>
          <p className="text-sm text-slate-700"><span className="font-medium">Data/Hora:</span> {new Date(agendamento.dataHora).toLocaleString("pt-BR")}</p>
          <p className="text-sm text-slate-700"><span className="font-medium">Status:</span> {formatarStatus(agendamento.status)}</p>
          <p className="text-sm text-slate-700"><span className="font-medium">Observações:</span> {agendamento.observacoes || "Sem observações"}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">Cliente e Pet</h2>
          <p className="text-sm text-slate-700"><span className="font-medium">Cliente:</span> {cliente?.nome ?? "-"}</p>
          <p className="text-sm text-slate-700"><span className="font-medium">Pet:</span> {pet?.nome ?? "-"}</p>
          <p className="text-sm text-slate-700"><span className="font-medium">Espécie/Raça:</span> {pet ? `${pet.especie} • ${pet.raca}` : "-"}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate(`/admin/agendamentos/${agendamento.id}/editar`)}
              className="figma-btn"
            >
              Editar agendamento
            </button>
          )}
          <button type="button" onClick={() => navigate("/admin/agendamentos")} className="figma-btn-white">
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
