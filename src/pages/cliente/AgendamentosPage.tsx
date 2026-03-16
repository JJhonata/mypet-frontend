import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, Agendamento, Pet } from "../../services/api";
import { TopBarGreeting } from "../../components/mobile/TopBarGreeting";
import { useClienteShell } from "./ClienteLayout";
import { Calendar, Plus, X, Clock, RotateCcw } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { SkeletonCard } from "../../components/ui/SkeletonCard";

export function AgendamentosPage() {
  const { user } = useAuth();
  const { openMenu, userName } = useClienteShell();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const clienteId = user.clienteId ?? user.id;
        setAgendamentos(await api.listarAgendamentos(clienteId));
        setPets(await api.listarPets(clienteId));
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const petNomeById = (id: number) => pets.find((p) => p.id === id)?.nome ?? "Pet";

  return (
    <div className="pb-10">
      <TopBarGreeting nome={userName} onRightClick={openMenu} />

      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 animate-fade-in">Agendamentos</h1>
            <p className="text-sm text-slate-600 animate-slide-up">
              Visualize e gerencie seus agendamentos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/app/agendamentos/novo")}
            className="figma-btn inline-flex items-center gap-2 animate-scale-in"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="rounded-xl bg-white shadow border border-slate-200 p-4 sm:p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Calendar className="h-7 w-7" />
            </div>
            <p className="text-slate-700 font-medium">Nenhum agendamento</p>
            <p className="text-sm text-slate-500 mt-1">
              Agende banho, tosa ou consulta veterinária para seu pet.
            </p>
            <button
              type="button"
              onClick={() => navigate("/app/agendamentos/novo")}
              className="figma-btn mt-6"
            >
              Fazer agendamento
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {agendamentos.map((ag, index) => (
              <li key={ag.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:scale-[1.02] transition-transform hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {petNomeById(ag.petId)} • {formatTipoServico(ag.tipoServico)}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {new Date(ag.dataHora).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                      <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        {formatStatus(ag.status)}
                      </span>
                      {ag.observacoes && (
                        <p className="text-xs text-slate-600 mt-2">{ag.observacoes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {ag.status === "AGENDADO" && (
                        <>
                          <button
                            onClick={() => navigate(`/app/agendamentos/reagendar?id=${ag.id}`)}
                            className="p-2 border border-emerald-700 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors hover:scale-110 active:scale-95"
                            title="Reagendar"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/app/agendamentos/cancelar?id=${ag.id}`)}
                            className="p-2 border border-emerald-700 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors hover:scale-110 active:scale-95"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatTipoServico(tipo: Agendamento["tipoServico"]) {
  if (tipo === "BANHO") return "Banho";
  if (tipo === "TOSA") return "Tosa";
  return "Atendimento veterinário";
}

function formatStatus(status: Agendamento["status"]) {
  if (status === "AGENDADO") return "Agendado";
  if (status === "EM_ANDAMENTO") return "Em andamento";
  if (status === "CANCELADO") return "Cancelado";
  return "Concluído";
}
