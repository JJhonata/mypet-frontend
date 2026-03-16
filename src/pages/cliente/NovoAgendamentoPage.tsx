import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, Pet } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { StatusMessage } from "../../components/ui/StatusMessage";

const inputClass =
  "w-full rounded-lg bg-white px-4 py-3 text-sm text-slate-900 shadow border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

export function NovoAgendamentoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openMenu } = useClienteShell();
  const hoje = new Date().toISOString().split("T")[0];

  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState("");
  const [tipoServico, setTipoServico] = useState("BANHO");
  const [pagamentoMomento, setPagamentoMomento] = useState("DEPOIS");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<{ hora: string, data_hora: string, disponivel: boolean }[]>([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState<{ id: number, tipo: string, tipo_display: string, preco: number }[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<{ id: number, nome: string }[]>([]);
  const [formaPagamentoId, setFormaPagamentoId] = useState<number | null>(null);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState<number | null>(null);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const clienteId = user.clienteId ?? user.id;
      const listaPets = await api.listarPets(clienteId);
      setPets(listaPets);
      if (listaPets.length > 0) {
        setPetId(String(listaPets[0].id));
      }

      const listaServicos = await api.listarServicos();
      if (listaServicos.length > 0) {
        setServicosDisponiveis(listaServicos);
        setServicoSelecionadoId(listaServicos[0].id);
        setTipoServico(listaServicos[0].tipo);
      }

      const formas = await api.listarFormasPagamento();
      if (formas.length > 0) {
        setFormasPagamento(formas);
      }
    }
    load();
  }, [user]);

  useEffect(() => {
    async function loadSlots() {
      if (!data || !servicoSelecionadoId) return;
      setCarregandoHorarios(true);
      try {
        const slots = await api.listarHorariosDisponiveis(data, servicoSelecionadoId, petId || undefined);
        setHorariosDisponiveis(slots.filter((s: any) => s.disponivel));
        setHorario(slots.length > 0 ? slots[0].data_hora : "");
      } catch (err) {
        console.error(err);
      } finally {
        setCarregandoHorarios(false);
      }
    }
    loadSlots();
  }, [data, servicoSelecionadoId, petId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !petId || !data || !horario) return;
    setErro(null);
    setSalvando(true);
    try {
      if (!formaPagamentoId) {
        setErro("Por favor, selecione uma forma de pagamento.");
        setSalvando(false);
        return;
      }

      const clienteIdAgend = user.clienteId ?? user.id;
      await api.criarAgendamento(clienteIdAgend, {
        petId: Number(petId),
        servicoId: servicoSelecionadoId || 1,
        formaPagamentoId: formaPagamentoId,
        dataHora: horario,
        observacoes
      });
      navigate("/app/agendamentos");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.detail;
      setErro(typeof msg === 'string' ? msg : "Não foi possível concluir o agendamento.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="pb-10">
      <TopBarTitle
        title="Novo agendamento"
        onMenuClick={openMenu}
      />

      <div className="px-4 sm:px-6 pt-4 animate-slide-up">
        {pets.length === 0 ? (
          <div className="rounded-xl bg-white shadow border border-slate-200 p-4 sm:p-6 text-center">
            <p className="text-slate-700 font-medium">Cadastre um pet primeiro</p>
            <p className="text-sm text-slate-500 mt-1">
              Você precisa ter pelo menos um pet para agendar serviços.
            </p>
            <button
              type="button"
              onClick={() => navigate("/app/pets/novo")}
              className="figma-btn mt-6"
            >
              Cadastrar pet
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white shadow border border-slate-200 p-4 sm:p-5 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pet
              </label>
              <select
                className={inputClass}
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                required
              >
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.nome} ({pet.especie})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de serviço
                </label>
                <select
                  className={inputClass}
                  value={servicoSelecionadoId || ""}
                  onChange={(e) => {
                    const serv = servicosDisponiveis.find((s) => s.id === Number(e.target.value));
                    setServicoSelecionadoId(serv?.id || null);
                    setTipoServico(serv?.tipo || "BANHO");
                  }}
                >
                  {servicosDisponiveis.map(serv => (
                    <option key={serv.id} value={serv.id}>{serv.tipo_display} - R$ {serv.preco}</option>
                  ))}
                  {servicosDisponiveis.length === 0 && <option value="">Carregando...</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data
                </label>
                <input
                  className={inputClass}
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  min={hoje}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Forma de Pagamento Principal
              </label>
              <select
                className={inputClass}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Horário disponível
              </label>
              <select
                className={inputClass}
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
                disabled={!data || carregandoHorarios}
              >
                <option value="">
                  {carregandoHorarios
                    ? 'Carregando horários...'
                    : (!data || horariosDisponiveis.length === 0)
                      ? "Selecione uma data"
                      : "Selecione um horário"}
                </option>
                {horariosDisponiveis.map((h) => (
                  <option key={h.data_hora} value={h.data_hora}>
                    {h.hora}
                  </option>
                ))}
              </select>

              {!carregandoHorarios && horariosDisponiveis.length === 0 && data && servicoSelecionadoId && (
                <p className="text-yellow-600 text-sm mt-2">
                  💡 Dica: Tente selecionar outra data ou serviço. Nenhum profissional disponível no expediente.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Observações (opcional)
              </label>
              <textarea
                className={`${inputClass} min-h-[80px] resize-y`}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: preferir água morna, tosar apenas patas..."
                rows={3}
              />
            </div>

            {erro && <StatusMessage type="error" message={erro} />}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/app/agendamentos")}
                className="figma-btn-white flex-1 sm:flex-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="figma-btn flex-1 sm:flex-none"
              >
                {salvando ? "Agendando..." : "Confirmar agendamento"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
