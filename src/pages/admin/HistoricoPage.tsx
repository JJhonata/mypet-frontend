import { useEffect, useMemo, useState } from "react";
import { api, HistoricoItem } from "../../services/api";
import { useAdminShell } from "./AdminLayout";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { History, Search } from "lucide-react";

export function AdminHistoricoPage() {
  const { openMenu } = useAdminShell();
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setHistorico(await api.listarHistorico(0));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return historico.filter((h) => {
      if (!termo) return true;
      const pet = h.nomePet?.toLowerCase() ?? "";
      const cliente = h.nomeCliente?.toLowerCase() ?? "";
      const funcionario = h.nomeFuncionario?.toLowerCase() ?? "";
      const servico = h.tipoServico?.toLowerCase() ?? "";
      return (
        pet.includes(termo) ||
        cliente.includes(termo) ||
        funcionario.includes(termo) ||
        servico.includes(termo)
      );
    });
  }, [historico, busca]);

  return (
    <div className="pb-10">
      <TopBarTitle title="Histórico de Atendimentos" onMenuClick={openMenu} />

      <div className="pt-4 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por pet, cliente, funcionário ou serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{historico.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total de atendimentos</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              R$ {historico.reduce((sum, h) => sum + h.valorPago, 0).toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-slate-500 mt-1">Receita total</p>
          </div>
        </div>

        {/* Tabela responsiva */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Carregando...</div>
        ) : filtrado.length === 0 ? (
          <div className="rounded-xl bg-white shadow border border-slate-200 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <History className="h-7 w-7" />
            </div>
            <p className="text-slate-700 font-medium">Nenhum atendimento encontrado</p>
            <p className="text-sm text-slate-500 mt-1">
              {busca ? "Tente outro termo de busca." : "O histórico aparecerá aqui quando houver atendimentos concluídos."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Data</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Pet</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 hidden sm:table-cell">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 hidden lg:table-cell">Funcionário</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 hidden md:table-cell">Serviço</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrado.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {new Date(item.dataAtendimento).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.nomePet ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{item.nomeCliente ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{item.nomeFuncionario ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatTipoServico(item.tipoServico)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                      R$ {item.valorPago.toFixed(2).replace(".", ",")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTipoServico(tipo: string) {
  const map: Record<string, string> = {
    BANHO: "Banho",
    TOSA: "Tosa",
    VETERINARIO: "Atendimento veterinário",
    BANHO_TOSA: "Banho e Tosa",
  };
  return map[tipo] ?? tipo;
}
