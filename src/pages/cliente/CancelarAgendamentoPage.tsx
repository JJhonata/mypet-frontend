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
    switch (tipo) {
      case 'BANHO': return 'Banho';
      case 'TOSA': return 'Tosa';
      case 'VETERINARIO': return 'Consulta Veterinária';
      default: return tipo;
    }
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
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {formatarTipoServico(agendamento.tipoServico)}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {agendamento.pet?.nome}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="h-5 w-5 text-emerald-700" />
                  <span className="text-sm">
                    {formatarData(agendamento.dataHora)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-slate-700">
                  <Clock className="h-5 w-5 text-emerald-700" />
                  <span className="text-sm">
                    {formatarHora(agendamento.dataHora)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <User className="h-5 w-5 text-emerald-700" />
                  <span className="text-sm">
                    {agendamento.pet?.especie} • {agendamento.pet?.raca}
                  </span>
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
                  className="figma-input min-h-[120px] resize-none"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Informe o motivo do cancelamento..."
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
                  onClick={() => navigate(-1)}
                  className="w-full py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
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
