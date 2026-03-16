import { useEffect, useMemo, useState } from "react";
import { api, HistoricoItem } from "../../services/api";
import { useFuncionarioShell } from "./Layout";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { History, Search } from "lucide-react";

export function FuncionarioHistoricoPage() {
  const { openMenu } = useFuncionarioShell();
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
      const servico = h.tipoServico?.toLowerCase() ?? "";
      return pet.includes(termo) || cliente.includes(termo) || servico.includes(termo);
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
            placeholder="Buscar por pet, cliente ou serviço..."
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
            <p className="text-xs text-slate-500 mt-1">Valor total</p>
          </div>
        </div>

        {/* Lista */}
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
          <ul className="space-y-3">
            {filtrado.map((item, index) => (
              <li
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.nomePet ?? "Pet"} &bull; {formatTipoServico(item.tipoServico)}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        Cliente: {item.nomeCliente ?? "—"}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {new Date(item.dataAtendimento).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      {item.observacoes && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                          {item.observacoes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 whitespace-nowrap ml-3">
                      R$ {item.valorPago.toFixed(2).replace(".", ",")}
                    </span>
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
  const map: Record<string, string> = {
    BANHO: "Banho",
    TOSA: "Tosa",
    VETERINARIO: "Atendimento veterinário",
    BANHO_TOSA: "Banho e Tosa",
  };
  return map[tipo] ?? tipo;
}
