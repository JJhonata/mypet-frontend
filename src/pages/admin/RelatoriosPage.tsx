import { useEffect, useState } from "react";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { TrendingUp, DollarSign, Users, Calendar, Download, AlertCircle } from "lucide-react";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { api } from "../../services/api";
import { StatusMessage } from "../../components/ui/StatusMessage";

type DashboardData = {
  faturamento_mes: number;
  novos_clientes_mes: number;
  total_agendamentos_mes: number;
  agendamentos_hoje: number;
  servicos_top: { tipo_servico: string; quantidade: number }[];
  total_clientes: number;
  total_pets: number;
};

export function RelatoriosPage() {
  const { openMenu } = useAdminShell();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await api.obterDashboardAdmin();
        setData(result);
      } catch (error: any) {
        console.error("Erro ao carregar relatórios:", error);
        setErro("Não foi possível carregar os dados dos relatórios.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = data
    ? [
      {
        title: "Faturamento Total",
        value: `R$ ${data.faturamento_mes.toFixed(2)}`,
        icon: DollarSign,
        color: "bg-emerald-700"
      },
      {
        title: "Novos Clientes",
        value: String(data.novos_clientes_mes),
        icon: Users,
        color: "bg-emerald-700"
      },
      {
        title: "Agendamentos do Mês",
        value: String(data.total_agendamentos_mes),
        icon: Calendar,
        color: "bg-emerald-700"
      },
      {
        title: "Agendamentos Hoje",
        value: String(data.agendamentos_hoje),
        icon: TrendingUp,
        color: "bg-emerald-700"
      }
    ]
    : [];

  // Calcular percentuais dos serviços
  const totalServicos = data?.servicos_top?.reduce((acc, s) => acc + s.quantidade, 0) ?? 0;
  const servicosComPercentual = (data?.servicos_top ?? []).map((s) => ({
    nome: s.tipo_servico,
    quantidade: s.quantidade,
    percentual: totalServicos > 0 ? Math.round((s.quantidade / totalServicos) * 100) : 0
  }));

  return (
    <div className="pb-10">
      <TopBarTitle title="Relatórios" onMenuClick={openMenu} />

      <div className="pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Relatórios e Análises</h1>
            <p className="text-sm text-slate-600">Visualize o desempenho do seu pet shop</p>
          </div>
        </div>

        {erro && <StatusMessage type="error" message={erro} />}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 animate-pulse">
                <div className="h-8 w-8 bg-slate-200 rounded mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Serviços Mais Populares */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Serviços Mais Populares</h2>

              {servicosComPercentual.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>Nenhum serviço realizado neste período.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {servicosComPercentual.map((servico, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                          <span className="font-medium text-sm sm:text-base text-slate-900">{servico.nome}</span>
                          <span className="text-xs sm:text-sm text-slate-600">{servico.quantidade} agendamentos</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-emerald-700 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${servico.percentual}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                        {servico.percentual}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumo Geral */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Resumo Geral</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-700 uppercase">Métrica</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-700 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-900">Total de Clientes</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-900">{data.total_clientes}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-900">Total de Pets</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-900">{data.total_pets}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-900">Novos Clientes (mês)</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-900">{data.novos_clientes_mes}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-900">Agendamentos (mês)</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-900">{data.total_agendamentos_mes}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-900">Agendamentos Hoje</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-900">{data.agendamentos_hoje}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-900">Faturamento (mês)</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-emerald-700 font-semibold">R$ {data.faturamento_mes.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
