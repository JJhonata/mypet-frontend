import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { Users, Calendar, PawPrint, TrendingUp, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StatusMessage } from "../../components/ui/StatusMessage";

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { openMenu } = useAdminShell();
  const isAdmin = user?.role === "ADMINISTRADOR";
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPets: 0,
    totalAgendamentos: 0,
    agendamentosHoje: 0,
    faturamentoMes: 0,
    novosClientesMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        if (isAdmin) {
          // Admin: busca todos os dados do dashboard, incluindo financeiro
          const data = await api.obterDashboardAdmin();
          setStats({
            totalClientes: data.total_clientes,
            totalPets: data.total_pets,
            totalAgendamentos: data.total_agendamentos_mes,
            agendamentosHoje: data.agendamentos_hoje,
            faturamentoMes: data.faturamento_mes,
            novosClientesMes: data.novos_clientes_mes
          });
        } else {
          // Funcionário: busca apenas contagens básicas (sem permissão no /admin/dashboard/)
          let totalClientes = 0;
          let totalPets = 0;
          let totalAgendamentos = 0;

          try {
            const cRes = await api.listarTodosClientes();
            totalClientes = cRes.length;
          } catch { /* sem permissão */ }

          try {
            const pRes = await api.listarTodosPets();
            totalPets = pRes.length;
          } catch { /* sem permissão */ }

          try {
            const aRes = await api.listarTodosAgendamentos();
            totalAgendamentos = aRes.length;
          } catch { /* sem permissão */ }

          setStats(prev => ({
            ...prev,
            totalClientes,
            totalPets,
            totalAgendamentos
          }));
        }
      } catch (error: any) {
        console.error("Erro ao carregar dashboard:", error);
        setErro("Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [isAdmin]);

  useEffect(() => {
    const flash = (location.state as { flash?: { type: "success" | "error"; message: string } })
      ?.flash;
    if (flash) {
      setFlashMessage(flash);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  // Cards diferentes para admin vs funcionário
  const statCards = isAdmin
    ? [
      {
        title: "Total de Clientes",
        value: stats.totalClientes,
        icon: Users,
        color: "bg-blue-600",
        trend: `+${stats.novosClientesMes} este mês`
      },
      {
        title: "Total de Pets",
        value: stats.totalPets,
        icon: PawPrint,
        color: "bg-emerald-600",
        trend: "cadastrados"
      },
      {
        title: "Agendamentos Hoje",
        value: stats.agendamentosHoje,
        icon: Calendar,
        color: "bg-purple-600",
        trend: `${stats.totalAgendamentos} este mês`
      },
      {
        title: "Faturamento do Mês",
        value: `R$ ${stats.faturamentoMes.toFixed(2)}`,
        icon: DollarSign,
        color: "bg-orange-600",
        trend: "neste mês"
      }
    ]
    : [
      {
        title: "Clientes",
        value: stats.totalClientes,
        icon: Users,
        color: "bg-blue-600",
        trend: "cadastrados"
      },
      {
        title: "Pets",
        value: stats.totalPets,
        icon: PawPrint,
        color: "bg-emerald-600",
        trend: "cadastrados"
      },
      {
        title: "Agendamentos",
        value: stats.totalAgendamentos,
        icon: Calendar,
        color: "bg-purple-600",
        trend: "neste mês"
      }
    ];

  return (
    <div className="pb-10">
      <TopBarTitle title="Painel Administrativo" onMenuClick={openMenu} />

      <div className="pt-6 space-y-6">
        {flashMessage && (
          <StatusMessage type={flashMessage.type} message={flashMessage.message} />
        )}

        {erro && (
          <StatusMessage type="error" message={erro} />
        )}

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Bem-vindo, {user?.nome ?? "Administrador"}
          </h1>
          <p className="text-sm text-slate-600">
            {isAdmin
              ? "Gerencie seu pet shop de forma simples e eficiente"
              : "Visualize agendamentos e gerencie atendimentos"
            }
          </p>
        </div>

        {loading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
            {[1, 2, 3, ...(isAdmin ? [4] : [])].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 animate-pulse">
                <div className="h-8 w-8 bg-slate-200 rounded mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Stats Cards */
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {stat.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Ações Rápidas</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/admin/clientes")}
              className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all text-left group"
            >
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">
                {isAdmin ? "Gerenciar Clientes" : "Visualizar Clientes"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {isAdmin ? "Visualize e edite dados dos clientes" : "Consulte dados dos clientes"}
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/agendamentos")}
              className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all text-left group"
            >
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Agendamentos</h3>
              <p className="text-xs sm:text-sm text-slate-600">Gerencie todos os agendamentos</p>
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate("/admin/relatorios")}
                className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all text-left group"
              >
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">Relatórios</h3>
                <p className="text-xs sm:text-sm text-slate-600">Veja estatísticas e relatórios</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
