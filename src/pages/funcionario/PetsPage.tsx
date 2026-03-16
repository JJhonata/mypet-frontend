import { useEffect, useMemo, useState } from "react";
import { Search, PawPrint } from "lucide-react";
import { api, Pet } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useFuncionarioShell } from "./Layout";

export function FuncionarioPetsPage() {
  const { openMenu } = useFuncionarioShell();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setPets(await api.listarTodosPets());
      } catch {
        setErro("Não foi possível carregar os pets.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pets.filter((p) => {
      if (!termo) return true;
      const nome = p.nome?.toLowerCase() ?? "";
      const raca = p.raca?.toLowerCase() ?? "";
      const dono = p.nomeCliente?.toLowerCase() ?? "";
      return nome.includes(termo) || raca.includes(termo) || dono.includes(termo);
    });
  }, [pets, busca]);

  return (
    <div className="pb-10">
      <TopBarTitle title="Pets" onMenuClick={openMenu} />

      <div className="pt-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="figma-input-white pl-10"
            placeholder="Buscar pet por nome, raça ou cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {erro && <StatusMessage type="error" message={erro} />}

        {loading ? (
          <div className="pt-10 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : lista.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <PawPrint className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">Nenhum pet encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{p.nome}</p>
                <p className="text-xs text-slate-600 mt-1">{p.especie} - {p.raca}</p>
                <p className="text-xs text-slate-600 mt-1">Tutor: {p.nomeCliente ?? "-"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
