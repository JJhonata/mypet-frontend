import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, HistoricoItem, Pet } from "../../services/api";
import { TopBarGreeting } from "../../components/mobile/TopBarGreeting";
import { useClienteShell } from "./ClienteLayout";
import { History } from "lucide-react";

export function HistoricoPage() {
  const { user } = useAuth();
  const { openMenu, userName } = useClienteShell();
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const clienteId = user.clienteId ?? user.id;
      setPets(await api.listarPets(clienteId));
      setHistorico(await api.listarHistorico(clienteId));
    }
    load();
  }, [user]);

  const petNomeById = (id: number) => pets.find((p) => p.id === id)?.nome ?? "Pet";

  return (
    <div className="pb-10">
      <TopBarGreeting nome={userName} onRightClick={openMenu} />

      <div className="pt-4 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 animate-fade-in">
            Histórico de atendimentos
          </h1>
          <p className="text-sm text-slate-600 animate-slide-up">
            Serviços realizados por pet.
          </p>
        </div>

        {historico.length === 0 ? (
          <div className="rounded-xl bg-white shadow border border-slate-200 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <History className="h-7 w-7" />
            </div>
            <p className="text-slate-700 font-medium">Nenhum atendimento</p>
            <p className="text-sm text-slate-500 mt-1">
              O histórico de banho, tosa e consultas aparecerá aqui.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {historico.map((item, index) => (
              <li key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:scale-[1.02] transition-transform hover:shadow-md">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {petNomeById(item.petId)} • {formatTipoServico(item.tipoServico)}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {new Date(item.dataAtendimento).toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </p>
                    <p className="text-sm font-medium text-emerald-700 mt-1">
                      R$ {item.valorPago.toFixed(2).replace(".", ",")}
                    </p>
                    {item.observacoes && (
                      <p className="text-xs text-slate-600 mt-2">{item.observacoes}</p>
                    )}
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

function formatTipoServico(tipo: string) {
  if (tipo === "BANHO") return "Banho";
  if (tipo === "TOSA") return "Tosa";
  if (tipo === "VETERINARIO") return "Atendimento veterinário";
  return tipo;
}
