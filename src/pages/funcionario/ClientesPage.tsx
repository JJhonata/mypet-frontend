import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { api, Cliente } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useFuncionarioShell } from "./Layout";

export function FuncionarioClientesPage() {
  const { openMenu } = useFuncionarioShell();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setClientes(await api.listarTodosClientes());
      } catch {
        setErro("Não foi possível carregar os clientes.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return clientes.filter((c) => {
      if (!termo) return true;
      return c.nome.toLowerCase().includes(termo) || c.email.toLowerCase().includes(termo);
    });
  }, [clientes, busca]);

  return (
    <div className="pb-10">
      <TopBarTitle title="Clientes" onMenuClick={openMenu} />

      <div className="pt-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="figma-input-white pl-10"
            placeholder="Buscar cliente por nome ou email"
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
            <Users className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{c.nome}</p>
                <p className="text-xs text-slate-600 mt-1">{c.email}</p>
                <p className="text-xs text-slate-600 mt-1">{c.telefone || "Sem telefone"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
