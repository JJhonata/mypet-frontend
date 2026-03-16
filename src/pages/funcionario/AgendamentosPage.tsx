import { useEffect, useMemo, useState } from "react";
import { Calendar, Search, CheckCircle2, Clock3, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, Agendamento } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useFuncionarioShell } from "./Layout";

export function FuncionarioAgendamentosPage() {
  const { openMenu } = useFuncionarioShell();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  async function carregar() {
    setErro(null);
    try {
      setAgendamentos(await api.listarTodosAgendamentos());
    } catch {
      setErro("Não foi possível carregar os agendamentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return agendamentos
      .filter((ag) => {
        if (!termo) return true;
        const pet = ag.nomePet?.toLowerCase() ?? "";
        const cliente = ag.nomeCliente?.toLowerCase() ?? "";
        const servico = ag.tipoServico?.toLowerCase() ?? "";
        return pet.includes(termo) || cliente.includes(termo) || servico.includes(termo);
      })
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  }, [agendamentos, busca]);

  async function iniciarAtendimento(id: number) {
    try {
      const atualizado = await api.iniciarAgendamento(id);
      setAgendamentos((prev) => prev.map((ag) => (ag.id === id ? atualizado : ag)));
    } catch {
      setErro("Não foi possível iniciar o atendimento.");
    }
  }

  async function concluirAtendimento(id: number) {
    try {
      const atualizado = await api.concluirAgendamento(id, {
        formaPagamentoId: 2,
        valorPago: 0,
        observacoes: "Concluído pelo funcionário",
      });
      setAgendamentos((prev) => prev.map((ag) => (ag.id === id ? atualizado : ag)));
    } catch {
      setErro("Não foi possível concluir o atendimento.");
    }
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Agendamentos" onMenuClick={openMenu} />

      <div className="pt-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="figma-input-white pl-10 w-full"
              placeholder="Buscar por cliente, pet ou serviço"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/funcionario/agendamentos/novo")}
            className="figma-btn inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </div>

        {erro && <StatusMessage type="error" message={erro} />}

        {loading ? (
          <div className="pt-10 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : lista.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Calendar className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map((ag) => (
              <div key={ag.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{ag.nomePet ?? "Pet"} - {ag.nomeCliente ?? "Cliente"}</p>
                    <p className="text-xs text-slate-600 mt-1">{ag.tipoServico}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(ag.dataHora).toLocaleDateString("pt-BR")} às {new Date(ag.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-xs font-medium rounded-full bg-slate-100 text-slate-700 px-2 py-1">
                    {ag.status}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  {ag.status === "AGENDADO" && (
                    <button type="button" onClick={() => iniciarAtendimento(ag.id)} className="figma-btn-white inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      Iniciar
                    </button>
                  )}
                  {(ag.status === "AGENDADO" || ag.status === "EM_ANDAMENTO") && (
                    <button type="button" onClick={() => concluirAtendimento(ag.id)} className="figma-btn inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
