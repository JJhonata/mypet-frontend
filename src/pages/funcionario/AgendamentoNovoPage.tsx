import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { api, Cliente, Pet } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useAuth } from "../../context/AuthContext";
import { useFuncionarioShell } from "./Layout";

export function FuncionarioAgendamentoNovoPage() {
  const navigate = useNavigate();
  const { openMenu } = useFuncionarioShell();
  const { user } = useAuth();
  const hoje = new Date().toISOString().split("T")[0];

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState("");
  const [petId, setPetId] = useState("");
  const [servicosDisponiveis, setServicosDisponiveis] = useState<{ id: number, tipo: string, descricao: string, preco: number }[]>([]);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState<number | null>(null);
  const [tipoServico, setTipoServico] = useState("BANHO");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<{ hora: string, data_hora: string, disponivel: boolean }[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<{ id: number, nome: string }[]>([]);
  const [formaPagamentoId, setFormaPagamentoId] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [todosClientes, todosPets, todosServicos, todasFormas] = await Promise.all([
          api.listarTodosClientes(),
          api.listarTodosPets(),
          api.listarServicos(),
          api.listarFormasPagamento()
        ]);

        setClientes(todosClientes);
        setPets(todosPets);
        if (todasFormas.length > 0) setFormasPagamento(todasFormas);

        if (todosServicos.length > 0) {
          setServicosDisponiveis(todosServicos);
          setServicoSelecionadoId(todosServicos[0].id);
          setTipoServico(todosServicos[0].tipo);
        }

        if (todosClientes.length > 0) {
          const primeiroCliente = String(todosClientes[0].id);
          setClienteId(primeiroCliente);

          const petCliente = todosPets.find((pet) => String(pet.clienteId) === primeiroCliente);
          if (petCliente) {
            setPetId(String(petCliente.id));
          }
        }
      } catch (error) {
        setErro("Não foi possível carregar os dados iniciais.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const petsDoCliente = useMemo(
    () => pets.filter((pet) => String(pet.clienteId) === clienteId),
    [pets, clienteId]
  );

  useEffect(() => {
    if (!petsDoCliente.some((pet) => String(pet.id) === petId)) {
      setPetId(petsDoCliente[0] ? String(petsDoCliente[0].id) : "");
    }
  }, [petsDoCliente, petId]);

  useEffect(() => {
    async function loadHorarios() {
      if (!data || !servicoSelecionadoId) {
        setHorariosDisponiveis([]);
        setHorario("");
        return;
      }

      setCarregandoHorarios(true);
      try {
        const slots = await api.listarHorariosDisponiveis(data, servicoSelecionadoId, petId || undefined);
        setHorariosDisponiveis(slots.filter((s: any) => s.disponivel));
        setHorario(slots.length > 0 ? slots[0].data_hora : "");
      } finally {
        setCarregandoHorarios(false);
      }
    }

    loadHorarios();
  }, [data, servicoSelecionadoId, petId]);

  if (user?.role !== "FUNCIONARIO") {
    return <Navigate to="/acesso-negado" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!clienteId || !petId || !data || !horario || !formaPagamentoId) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setErro(null);
    setSaving(true);

    try {
      const novo = await api.criarAgendamento(Number(clienteId), {
        petId: Number(petId),
        servicoId: servicoSelecionadoId || 1,
        formaPagamentoId: formaPagamentoId,
        dataHora: horario,
        observacoes
      });

      navigate(`/funcionario/agendamentos`, {
        state: {
          flash: {
            type: "success",
            message: "Agendamento criado com sucesso."
          }
        }
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.detail;
      setErro(typeof msg === 'string' ? msg : "Não foi possível criar agendamento.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Novo Agendamento" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Novo Agendamento" onMenuClick={openMenu} />

      <div className="pt-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select className="figma-input-white" value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Pet</label>
              <select className="figma-input-white" value={petId} onChange={(e) => setPetId(e.target.value)} required>
                {petsDoCliente.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.nome} ({pet.especie})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Serviço</label>
              <select
                className="figma-input-white"
                value={servicoSelecionadoId || ""}
                onChange={(e) => {
                  const s = servicosDisponiveis.find(x => x.id === Number(e.target.value));
                  setServicoSelecionadoId(s?.id || null);
                  setTipoServico(s?.tipo || "BANHO");
                }}
              >
                {servicosDisponiveis.map(s => (
                  <option key={s.id} value={s.id}>{s.tipo} - R$ {s.preco}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Data</label>
              <input className="figma-input-white" type="date" value={data} onChange={(e) => setData(e.target.value)} min={hoje} required />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Horário</label>
            <select className="figma-input-white" value={horario} onChange={(e) => setHorario(e.target.value)} required disabled={!data || carregandoHorarios}>
              <option value="">
                {carregandoHorarios
                  ? 'Carregando horários...'
                  : (!data || horariosDisponiveis.length === 0)
                    ? "Selecione uma data"
                    : "Selecione um horário"}
              </option>
              {horariosDisponiveis.map((slot) => (
                <option key={slot.data_hora} value={slot.data_hora}>{slot.hora}</option>
              ))}
            </select>
            {!carregandoHorarios && horariosDisponiveis.length === 0 && data && servicoSelecionadoId && (
              <p className="text-yellow-600 text-sm mt-2">💡 Dica: Nenhum profissional expedindo neste momento.</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
            <select
              className="figma-input-white"
              value={formaPagamentoId || ""}
              onChange={(e) => setFormaPagamentoId(Number(e.target.value))}
              required
            >
              <option value="">Selecione...</option>
              {formasPagamento.map(forma => (
                <option key={forma.id} value={forma.id}>{forma.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea className="figma-input-white min-h-[90px]" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>

          {erro && <StatusMessage type="error" message={erro} />}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="figma-btn">
              {saving ? "Salvando..." : "Criar agendamento"}
            </button>
            <button type="button" onClick={() => navigate("/funcionario/agendamentos")} className="figma-btn-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
