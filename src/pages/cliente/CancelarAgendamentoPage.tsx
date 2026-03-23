import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { api, Agendamento } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { StatusMessage } from "../../components/ui/StatusMessage";

export function CancelarAgendamentoPage() {
  const { openMenu } = useClienteShell();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agendamentoId = searchParams.get("id");

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    async function loadAgendamento() {
      if (!agendamentoId) {
        setErro("ID do agendamento não encontrado");
        return;
      }

      try {
        // Mock: buscar dados do agendamento
        const dados = await api.obterAgendamento(parseInt(agendamentoId));
        setAgendamento(dados);
      } catch (error) {
        setErro("Não foi possível carregar os dados do agendamento");
      }
    }

    loadAgendamento();
  }, [agendamentoId]);

  async function handleCancelar() {
    if (!agendamento || !motivo.trim()) {
      setErro("Por favor, informe o motivo do cancelamento");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      await api.cancelarAgendamento(agendamento.id, motivo);
      setSucesso(true);
    } catch (error) {
      setErro(
        error instanceof Error 
          ? error.message 
          : "Não foi possível cancelar o agendamento"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatarHora(data: string) {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatarTipoServico(tipo: string) {
    if (!tipo) return "Serviço";
    return tipo;
  }

  if (sucesso) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Cancelar Agendamento" onMenuClick={openMenu} />
        
        <div className="px-4 sm:px-6 pt-10 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">
            Agendamento Cancelado!
          </h1>
          
          <p className="text-sm text-slate-700 leading-relaxed">
            Seu agendamento foi cancelado com sucesso.
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
        <TopBarTitle title="Cancelar Agendamento" onMenuClick={openMenu} />
        
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
      <TopBarTitle title="Cancelar Agendamento" onMenuClick={openMenu} />

      <div className="px-4 sm:px-6 pt-6 max-w-md mx-auto animate-slide-up">
        {agendamento && (
          <>
            {/* Card do Agendamento */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6 animate-slide-up">
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {formatarTipoServico(agendamento.tipoServico)}
                  </h2>
                  <p className="text-sm font-medium text-emerald-700">
                    Agendamento Confirmado
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data e Hora</span>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm font-semibold">{formatarData(agendamento.dataHora)} às {formatarHora(agendamento.dataHora)}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pet</span>
                    <div className="flex items-center justify-end gap-2 text-slate-700">
                      <span className="text-sm font-semibold">{agendamento.pet?.nome}</span>
                      <User className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-500">Profissional</span>
                     <span className="text-sm font-medium text-slate-900">{agendamento.profissional?.nome || "A definir"}</span>
                   </div>
                   <div className="flex items-center justify-between mt-1">
                     <span className="text-xs text-slate-500">Espécie</span>
                     <span className="text-sm font-medium text-slate-900">{agendamento.pet?.especie} ({agendamento.pet?.raca})</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Formulário de Cancelamento */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Motivo do cancelamento
                </label>
                <textarea
                  className="figma-input-white min-h-[140px] resize-none border-slate-200 focus:border-emerald-500 transition-all"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Por favor, conte-nos o motivo do cancelamento..."
                  required
                />
              </div>

              {erro && <StatusMessage type="error" message={erro} />}

              {/* Botões */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleCancelar}
                  disabled={loading}
                  className="figma-btn w-full py-3 font-semibold"
                >
                  {loading ? "Cancelando..." : "Confirmar Cancelamento"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="figma-btn-white w-full py-3"
                >
                  Voltar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
