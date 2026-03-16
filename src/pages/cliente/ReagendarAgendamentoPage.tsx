import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { api, Agendamento, FormaPagamentoOption } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { StatusMessage } from "../../components/ui/StatusMessage";

const inputClass =
  "w-full rounded-lg bg-white px-4 py-3 text-sm text-slate-900 shadow border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

export function ReagendarAgendamentoPage() {
  const { openMenu } = useClienteShell();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agendamentoId = searchParams.get("id");

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<{ hora: string; data_hora: string; disponivel: boolean }[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoOption[]>([]);
  const [formaPagamentoId, setFormaPagamentoId] = useState<number | null>(null);
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadAgendamento() {
      if (!agendamentoId) {
        setErro("ID do agendamento não encontrado");
        return;
      }

      try {
        const [dados, formas] = await Promise.all([
          api.obterAgendamento(parseInt(agendamentoId)),
          api.listarFormasPagamento(),
        ]);

        if (formas.length > 0) setFormasPagamento(formas);

        if (dados) {
          setAgendamento(dados);

          // Pré-seleciona forma de pagamento atual (se houver match por tipo)
          if (formas.length > 0 && dados.formaPagamento) {
            const match = formas.find((f) => f.tipo === dados.formaPagamento);
            if (match) setFormaPagamentoId(match.id);
          }

          const dataAtual = new Date(dados.dataHora);
          const dataPadrao =
            dataAtual.toISOString().split("T")[0] < hoje
              ? hoje
              : dataAtual.toISOString().split("T")[0];

          setNovaData(dataPadrao);

          // Carrega horários usando dados diretamente (não depende de state)
          await carregarHorariosDisponiveis(dataPadrao, dados);
        }
      } catch (error) {
        setErro("Não foi possível carregar os dados do agendamento");
      }
    }

    loadAgendamento();
  }, [agendamentoId]);

  async function carregarHorariosDisponiveis(data: string, ag?: Agendamento) {
    const ref = ag || agendamento;
    if (!ref) return;
    setCarregandoHorarios(true);
    try {
      const slots = await api.listarHorariosDisponiveis(
        data,
        ref.servico?.id || undefined,
        ref.petId || undefined
      );
      const livres = slots.filter((s: any) => s.disponivel);
      setHorariosDisponiveis(livres);
      setNovaHora(livres.length > 0 ? livres[0].data_hora : "");
    } catch (error) {
      setHorariosDisponiveis([]);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  function handleDataChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = e.target.value;
    setNovaData(d);
    carregarHorariosDisponiveis(d);
  }

  async function handleReagendar() {
    if (!agendamento || !novaData || !novaHora) {
      setErro("Por favor, selecione nova data e horário");
      return;
    }

    if (!formaPagamentoId) {
      setErro("Por favor, selecione uma forma de pagamento");
      return;
    }

    if (!motivo.trim()) {
      setErro("Por favor, informe o motivo do reagendamento");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      await api.reagendarAgendamento(agendamento.id, {
        novaDataHora: novaHora,
        motivo,
        formaPagamentoId,
      });

      setSucesso(true);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.response?.data?.detail;
      setErro(
        typeof msg === "string"
          ? msg
          : "Não foi possível reagendar o agendamento"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatarHora(data: string) {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarTipoServico(tipo: string) {
    switch (tipo) {
      case "BANHO": return "Banho";
      case "TOSA": return "Tosa";
      case "BANHO_TOSA": return "Banho e Tosa";
      case "CORTE_UNHAS": return "Corte de Unhas";
      case "BANHO_TERAPEUTICO": return "Banho Terapêutico";
      case "VETERINARIO": return "Consulta Veterinária";
      default: return tipo;
    }
  }

  if (sucesso) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Reagendar Agendamento" onMenuClick={openMenu} />

        <div className="px-4 sm:px-6 pt-10 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-4">
            Agendamento Reagendado!
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed">
            Seu agendamento foi reagendado com sucesso.
            <br />
            Você receberá um e-mail de confirmação.
          </p>

          <button
            onClick={() => navigate("/app/agendamentos")}
            className="figma-btn mt-8 w-full"
          >
            Voltar para Meus Agendamentos
          </button>
        </div>
      </div>
    );
  }

  if (erro && !agendamento) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Reagendar Agendamento" onMenuClick={openMenu} />

        <div className="px-4 sm:px-6 pt-10 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-4">
            Ops! Algo deu errado
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed">{erro}</p>

          <button
            onClick={() => navigate("/app/agendamentos")}
            className="figma-btn mt-8 w-full"
          >
            Voltar para Meus Agendamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Reagendar Agendamento" onMenuClick={openMenu} />

      <div className="px-4 sm:px-6 pt-4 animate-slide-up">
        {agendamento && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleReagendar(); }}
            className="rounded-xl bg-white shadow border border-slate-200 p-4 sm:p-5 space-y-4"
          >
            {/* Info do agendamento atual */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Agendamento atual</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {formatarTipoServico(agendamento.tipoServico)} — {agendamento.pet?.nome}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatarData(agendamento.dataHora)} às {formatarHora(agendamento.dataHora)}
                  </p>
                </div>
              </div>
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nova Data
              </label>
              <input
                className={inputClass}
                type="date"
                value={novaData}
                onChange={handleDataChange}
                min={hoje}
                required
              />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Novo Horário
              </label>
              <select
                className={inputClass}
                value={novaHora}
                onChange={(e) => setNovaHora(e.target.value)}
                required
                disabled={!novaData || carregandoHorarios}
              >
                <option value="">
                  {carregandoHorarios
                    ? "Carregando horários..."
                    : !novaData || horariosDisponiveis.length === 0
                    ? "Selecione uma data"
                    : "Selecione um horário"}
                </option>
                {horariosDisponiveis.map((h) => (
                  <option key={h.data_hora} value={h.data_hora}>
                    {h.hora}
                  </option>
                ))}
              </select>

              {!carregandoHorarios && horariosDisponiveis.length === 0 && novaData && (
                <p className="text-yellow-600 text-sm mt-2">
                  Nenhum horário disponível nesta data. Tente outra data.
                </p>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                className={inputClass}
                value={formaPagamentoId || ""}
                onChange={(e) => setFormaPagamentoId(Number(e.target.value))}
                required
              >
                <option value="">Selecione...</option>
                {formasPagamento.map((forma) => (
                  <option key={forma.id} value={forma.id}>
                    {forma.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo do reagendamento
              </label>
              <textarea
                className={`${inputClass} min-h-[80px] resize-y`}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Informe o motivo do reagendamento..."
                rows={3}
                required
              />
            </div>

            {erro && <StatusMessage type="error" message={erro} />}

            {/* Botões */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="figma-btn-white flex-1 sm:flex-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="figma-btn flex-1 sm:flex-none"
              >
                {loading ? "Reagendando..." : "Confirmar Reagendamento"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
