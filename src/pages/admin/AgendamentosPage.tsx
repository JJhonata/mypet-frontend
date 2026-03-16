import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Agendamento, Cliente, FormaPagamentoOption, Pet } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { Calendar, Search, Filter, Eye, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { useAuth } from "../../context/AuthContext";
import { sanitizeDecimalInput } from "../../utils/inputFormatters";

const inputClass =
  "w-full rounded-lg bg-white px-4 py-3 text-sm text-slate-900 shadow border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

export function AgendamentosPage() {
  const { openMenu } = useAdminShell();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRADOR";
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoOption[]>([]);
  const [isConclusaoModalOpen, setIsConclusaoModalOpen] = useState(false);
  const [agendamentoParaConcluir, setAgendamentoParaConcluir] = useState<number | null>(null);
  const [formaPagamentoId, setFormaPagamentoId] = useState("2");
  const [valorPago, setValorPago] = useState("");
  const [codigoAutorizacao, setCodigoAutorizacao] = useState("");
  const [observacoesConclusao, setObservacoesConclusao] = useState("Atendimento concluído");
  const [salvandoConclusao, setSalvandoConclusao] = useState(false);
  const [erroConclusao, setErroConclusao] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [agendamentosData, clientesData, petsData, formasPagamentoData] = await Promise.all([
          api.listarTodosAgendamentos(),
          api.listarTodosClientes(),
          api.listarTodosPets(),
          api.listarFormasPagamento()
        ]);
        
        setAgendamentos(agendamentosData);
        setClientes(clientesData);
        setPets(petsData);
        setFormasPagamento(formasPagamentoData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let filtered = agendamentos;

    // Filter by status
    if (statusFilter !== "todos") {
      filtered = filtered.filter(ag => ag.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ag => {
        const cliente = clientes.find(c => c.id === ag.clienteId);
        const pet = pets.find(p => p.id === ag.petId);
        
        return (
          cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ag.tipoServico.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredAgendamentos(filtered);
  }, [searchTerm, statusFilter, agendamentos, clientes, pets]);

  const getClienteNome = (clienteId: number) => 
    clientes.find(c => c.id === clienteId)?.nome || "Cliente não encontrado";

  const getPetNome = (petId: number) => 
    pets.find(p => p.id === petId)?.nome || "Pet não encontrado";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADO": return "bg-slate-100 text-slate-800";
      case "EM_ANDAMENTO": return "bg-emerald-50 text-emerald-700";
      case "CONCLUIDO": return "bg-emerald-100 text-emerald-800";
      case "CANCELADO": return "bg-slate-200 text-slate-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getFormaPagamentoLabel = (forma?: string) => {
    if (forma === "DINHEIRO") return "Dinheiro";
    if (forma === "PIX") return "PIX";
    if (forma === "CARTAO") return "Cartão";
    return "-";
  };

  const abrirModalConclusao = (id: number) => {
    setAgendamentoParaConcluir(id);
    setFormaPagamentoId("2");
    setValorPago("");
    setCodigoAutorizacao("");
    setObservacoesConclusao("Atendimento concluído");
    setErroConclusao(null);
    setIsConclusaoModalOpen(true);
  };

  const fecharModalConclusao = () => {
    if (salvandoConclusao) return;
    setIsConclusaoModalOpen(false);
    setAgendamentoParaConcluir(null);
    setErroConclusao(null);
  };

  const confirmarConclusao = async () => {
    if (!agendamentoParaConcluir) return;
    setErroConclusao(null);
    setSalvandoConclusao(true);
    try {
      const atualizado = await api.concluirAgendamento(agendamentoParaConcluir, {
        formaPagamentoId: Number(formaPagamentoId),
        valorPago: Number(valorPago.replace(",", ".")),
        observacoes: observacoesConclusao,
      });
      setAgendamentos((prev) => prev.map((ag) => (ag.id === agendamentoParaConcluir ? atualizado : ag)));
      setIsConclusaoModalOpen(false);
      setAgendamentoParaConcluir(null);
    } catch (error) {
      setErroConclusao(
        error instanceof Error ? error.message : "Erro ao concluir atendimento"
      );
    } finally {
      setSalvandoConclusao(false);
    }
  };

  const handleValorPagoChange = (value: string) => {
    setValorPago(sanitizeDecimalInput(value));
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      if (newStatus === "EM_ANDAMENTO") {
        const atualizado = await api.iniciarAgendamento(id);
        setAgendamentos((prev) => prev.map((ag) => (ag.id === id ? atualizado : ag)));
        return;
      }

      if (newStatus === "CANCELADO") {
        await api.cancelarAgendamento(id, "Cancelado pela equipe.");
        const atualizado = await api.obterAgendamento(id);
        if (atualizado) {
          setAgendamentos((prev) => prev.map((ag) => (ag.id === id ? atualizado : ag)));
        }
        return;
      }

      if (newStatus === "CONCLUIDO") {
        abrirModalConclusao(id);
      }
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  };

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Agendamentos" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Agendamentos" onMenuClick={openMenu} />

      <div className="pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Gerenciar Agendamentos</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Total de {filteredAgendamentos.length} agendamentos
            </p>
          </div>
          <AnimatedButton
            onClick={() => {
              if (isAdmin) navigate("/admin/agendamentos/novo");
            }}
            className="inline-flex items-center gap-2 w-full sm:w-auto"
            disabled={!isAdmin}
          >
            <Calendar className="h-4 w-4" />
            Novo Agendamento
          </AnimatedButton>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar agendamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="figma-input-white pl-10 w-full text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="figma-input-white w-full sm:w-auto text-sm"
            >
              <option value="todos">Todos os Status</option>
              <option value="AGENDADO">Agendados</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDO">Concluídos</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Agendados", value: agendamentos.filter(a => a.status === "AGENDADO").length, color: "bg-slate-600" },
            { label: "Em Andamento", value: agendamentos.filter(a => a.status === "EM_ANDAMENTO").length, color: "bg-emerald-500" },
            { label: "Concluídos", value: agendamentos.filter(a => a.status === "CONCLUIDO").length, color: "bg-emerald-700" },
            { label: "Cancelados", value: agendamentos.filter(a => a.status === "CANCELADO").length, color: "bg-slate-500" }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 text-center animate-fade-in">
              <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Agendamentos List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredAgendamentos.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-700 font-medium">Nenhum agendamento encontrado</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {searchTerm || statusFilter !== "todos" ? "Tente ajustar os filtros" : "Comece criando um novo agendamento"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-3 sm:px-6 py-3 hidden sm:table-cell text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-3 sm:px-6 py-3 hidden sm:table-cell text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Pet
                    </th>
                    <th className="px-3 sm:px-6 py-3 hidden lg:table-cell text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 hidden md:table-cell text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAgendamentos.map((agendamento) => (
                    <tr key={agendamento.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(agendamento.dataHora).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {new Date(agendamento.dataHora).toLocaleTimeString("pt-BR", { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <p className="text-sm font-medium text-slate-900">
                          {getClienteNome(agendamento.clienteId)}
                        </p>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <p className="text-sm text-slate-900">{getPetNome(agendamento.petId)}</p>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        <p className="text-sm text-slate-900">
                          {agendamento.tipoServico === "BANHO" && "Banho"}
                          {agendamento.tipoServico === "TOSA" && "Tosa"}
                          {agendamento.tipoServico === "VETERINARIO" && "Veterinário"}
                        </p>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agendamento.status)}`}>
                          {agendamento.status === "AGENDADO" && "Agendado"}
                          {agendamento.status === "EM_ANDAMENTO" && "Em Andamento"}
                          {agendamento.status === "CONCLUIDO" && "Concluído"}
                          {agendamento.status === "CANCELADO" && "Cancelado"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        {agendamento.statusPagamento === "PAGO" && agendamento.formaPagamento && typeof agendamento.valorPago === "number" ? (
                          <div>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                              Pago
                            </span>
                            <p className="mt-1 text-xs text-slate-600">
                              {getFormaPagamentoLabel(agendamento.formaPagamento)} · R$ {agendamento.valorPago.toFixed(2)}
                            </p>
                            {agendamento.codigoAutorizacao && (
                              <p className="text-xs text-slate-500">NSU: {agendamento.codigoAutorizacao}</p>
                            )}
                            {agendamento.confirmadoPor && (
                              <p className="text-xs text-slate-500">Confirmado por: {agendamento.confirmadoPor}</p>
                            )}
                          </div>
                        ) : agendamento.statusPagamento === "FALHOU" ? (
                          <div>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
                              Falhou
                            </span>
                            <p className="mt-1 text-xs text-slate-600">Pagamento não confirmado</p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                              Aguardando
                            </span>
                            <p className="mt-1 text-xs text-slate-600">
                              {agendamento.pagamentoMomento === "ANTES"
                                ? "Preferência: antes"
                                : "Preferência: no atendimento"}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {agendamento.status === "AGENDADO" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(agendamento.id, "EM_ANDAMENTO")}
                                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Iniciar Atendimento"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(agendamento.id, "CONCLUIDO")}
                                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Concluir"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(agendamento.id, "CANCELADO")}
                                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {agendamento.status === "EM_ANDAMENTO" && (
                            <button
                              onClick={() => handleStatusChange(agendamento.id, "CONCLUIDO")}
                              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Concluir"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/agendamentos/${agendamento.id}`)}
                            className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => navigate(`/admin/agendamentos/${agendamento.id}/editar`)}
                              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isConclusaoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Concluir atendimento</h2>
            <p className="mt-1 text-sm text-slate-600">
              Registre a forma e o valor pago pelo cliente.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">Forma de pagamento</label>
                <select
                  className={inputClass}
                  value={formaPagamentoId}
                  onChange={(e) => setFormaPagamentoId(e.target.value)}
                  disabled={salvandoConclusao}
                >
                  {formasPagamento.map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">Valor pago (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className={inputClass}
                  value={valorPago}
                  onChange={(e) => handleValorPagoChange(e.target.value)}
                  disabled={salvandoConclusao}
                  placeholder="Ex: 89.90"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">Código de autorização / NSU</label>
                <input
                  type="text"
                  className={inputClass}
                  value={codigoAutorizacao}
                  onChange={(e) => setCodigoAutorizacao(e.target.value)}
                  disabled={salvandoConclusao}
                  placeholder="Ex: 123456"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">Observações</label>
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  value={observacoesConclusao}
                  onChange={(e) => setObservacoesConclusao(e.target.value)}
                  disabled={salvandoConclusao}
                />
              </div>

              {erroConclusao && (
                <p className="text-sm text-red-600">{erroConclusao}</p>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharModalConclusao}
                className="figma-btn-white"
                disabled={salvandoConclusao}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarConclusao}
                className="figma-btn"
                disabled={salvandoConclusao}
              >
                {salvandoConclusao ? "Concluindo..." : "Concluir atendimento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
