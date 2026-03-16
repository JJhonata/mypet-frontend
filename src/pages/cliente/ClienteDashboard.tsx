import { useEffect, useState } from "react";
import { api, Agendamento, Pet } from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { TopBarGreeting } from "../../components/mobile/TopBarGreeting";
import { useClienteShell } from "./ClienteLayout";
import { PawPrint, Stethoscope, ShowerHead, CalendarCheck2, ArrowRight } from "lucide-react";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { AvatarUpload } from "../../components/ui/AvatarUpload";

export function ClienteDashboard() {
  const { openMenu, userName } = useClienteShell();
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const stored = localStorage.getItem("mypet:user");
      if (!stored) return;
      const userData = JSON.parse(stored) as { id: number; clienteId?: number };
      const clienteId = userData.clienteId ?? userData.id;
      if (!clienteId) return;
      setPets(await api.listarPets(clienteId));
      setAgendamentos(await api.listarAgendamentos(clienteId));
    }
    load();
  }, []);

  useEffect(() => {
    const flash = (location.state as { flash?: { type: "success" | "error"; message: string } })
      ?.flash;
    if (flash) {
      setFlashMessage(flash);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  return (
    <div className="pb-10">
      <TopBarGreeting nome={userName} onRightClick={openMenu} />

      {flashMessage && (
        <div className="pt-4">
          <StatusMessage type={flashMessage.type} message={flashMessage.message} />
        </div>
      )}

      {pets.length === 0 ? (
        <div className="pt-10 text-center">
          <div className="mx-auto h-40 w-40 rounded-full bg-slate-100 flex items-center justify-center">
            <div className="text-slate-400">
              <PawPrint className="h-16 w-16 mx-auto" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900 animate-fade-in">Ops!</h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            Parece que você não tem nenhum pet
            <br />
            cadastrado no momento.
            <br />
            Adicione seu animal de estimação agora!
          </p>
          <button
            type="button"
            onClick={() => navigate("/app/pets/novo")}
            className="figma-btn mt-8 w-full"
          >
            Toque para continuar
          </button>
        </div>
      ) : (
        <div className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-800">
              Perfis de animais de estimação
            </p>
            <span className="h-5 min-w-5 px-1 rounded bg-emerald-700 text-white text-xs inline-flex items-center justify-center">
              {pets.length}
            </span>
          </div>

          <div className="relative bg-white rounded-xl border border-slate-200 p-5 hover:scale-[1.02] transition-transform">
            <div className="pr-24">
              <p className="text-xl font-semibold text-slate-900">{pets[0].nome}</p>
              <p className="text-sm text-slate-600">
                {pets[0].especie ?? "Pet"} | {pets[0].raca ?? "Raça"}
              </p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <AvatarUpload
                readonly
                size={64}
                fotoUrl={pets[0].foto}
                nome={pets[0].nome}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-8 rounded-full bg-emerald-700" />
            <span className="h-2 w-2 rounded-full bg-emerald-700/40" />
            <span className="h-2 w-2 rounded-full bg-emerald-700/40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              label="Adicione um novo pet"
              icon={<PawPrint className="h-10 w-10 text-emerald-700" />}
              onClick={() => navigate("/app/pets/novo")}
              index={0}
            />
            <ActionCard
              label="Consulta Veterinária"
              icon={<Stethoscope className="h-10 w-10 text-emerald-700" />}
              onClick={() => navigate("/app/agendamentos/novo?tipo=VETERINARIO")}
              index={1}
            />
            <ActionCard
              label="Banho e Tosa"
              icon={<ShowerHead className="h-10 w-10 text-emerald-700" />}
              onClick={() => navigate("/app/agendamentos/novo?tipo=BANHO_TOSA")}
              index={2}
            />
            <ActionCard
              label="Marcações"
              icon={<CalendarCheck2 className="h-10 w-10 text-emerald-700" />}
              onClick={() => navigate("/app/agendamentos")}
              index={3}
            />
          </div>
        </div>
      )}
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
  return "Concluído";
}

function ActionCard({
  label,
  icon,
  onClick,
  index
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  index?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-4 text-left relative min-h-[140px] animate-fade-in hover:scale-110 transition-transform hover:shadow-md"
      style={{ animationDelay: index ? `${index * 100}ms` : undefined }}
    >
      <p className="text-sm font-semibold leading-snug text-slate-900">{label}</p>
      <div className="mt-6 text-emerald-700">{icon}</div>
      <div className="absolute right-3 bottom-3">
        <ArrowRight className="h-5 w-5 text-emerald-700" />
      </div>
    </button>
  );
}

