import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { api } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useAuth } from "../../context/AuthContext";

export function AgendamentoEditarPage() {
  const navigate = useNavigate();
  const { openMenu } = useAdminShell();
  const { id } = useParams();
  const { user } = useAuth();
  const hoje = new Date().toISOString().split("T")[0];

  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const agendamentoId = Number(id);
        if (!agendamentoId) {
          setErro("Agendamento inválido.");
          return;
        }

        const dados = await api.obterAgendamento(agendamentoId);
        if (!dados) {
          setErro("Agendamento não encontrado.");
          return;
        }

        const dataObj = new Date(dados.dataHora);
        setData(dataObj.toISOString().split("T")[0]);
        setHorario(dataObj.toTimeString().slice(0, 5));
        setObservacoes(dados.observacoes ?? "");
      } catch (error) {
        setErro("Não foi possível carregar agendamento.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (user?.role !== "ADMINISTRADOR") {
    return <Navigate to="/acesso-negado" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSaving(true);

    try {
      const agendamentoId = Number(id);
      const dataHora = new Date(`${data}T${horario}:00`).toISOString();

      await api.atualizarAgendamento(agendamentoId, {
        dataHora,
        observacoes
      });

      navigate(`/admin/agendamentos/${agendamentoId}`, {
        state: {
          flash: {
            type: "success",
            message: "Agendamento atualizado com sucesso."
          }
        }
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Editar Agendamento" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (erro && !data) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Editar Agendamento" onMenuClick={openMenu} />
        <div className="pt-10 text-center">
          <p className="text-slate-700">{erro}</p>
          <button type="button" onClick={() => navigate("/admin/agendamentos")} className="figma-btn mt-6">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Editar Agendamento" onMenuClick={openMenu} />

      <div className="pt-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Data</label>
              <input className="figma-input-white" type="date" value={data} min={hoje} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Horário</label>
              <select className="figma-input-white" value={horario} onChange={(e) => setHorario(e.target.value)} required>
                <option value="">Selecione</option>
                <option value="07:00">07:00</option>
                <option value="07:30">07:30</option>
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="13:00">13:00</option>
                <option value="13:30">13:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea className="figma-input-white min-h-[100px]" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>

          {erro && <StatusMessage type="error" message={erro} />}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="figma-btn">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="figma-btn-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
