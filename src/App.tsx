import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { CadastroPage } from "./pages/CadastroPage";
import { EsqueciSenhaPage } from "./pages/EsqueciSenhaPage";
import { RedefinirSenhaPage } from "./pages/RedefinirSenhaPage";
import { ClienteLayout } from "./pages/cliente/ClienteLayout";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { ClienteDashboard } from "./pages/cliente/ClienteDashboard";
import { ClientePerfil } from "./pages/cliente/ClientePerfil";
import { EditarPerfilPage } from "./pages/cliente/EditarPerfilPage";
import { CancelarAgendamentoPage } from "./pages/cliente/CancelarAgendamentoPage";
import { ReagendarAgendamentoPage } from "./pages/cliente/ReagendarAgendamentoPage";
import { ContatosPage } from "./pages/cliente/ContatosPage";
import { ConfiguracoesPage } from "./pages/cliente/ConfiguracoesPage";
import { PetsPage } from "./pages/cliente/PetsPage";
import { NovoPetPage } from "./pages/cliente/NovoPetPage";
import { EditarPetPage } from "./pages/cliente/EditarPetPage";
import { AgendamentosPage } from "./pages/cliente/AgendamentosPage";
import { NovoAgendamentoPage } from "./pages/cliente/NovoAgendamentoPage";
import { HistoricoPage } from "./pages/cliente/HistoricoPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ClientesPage } from "./pages/admin/ClientesPage";
import { ClienteNovoPage } from "./pages/admin/ClienteNovoPage";
import { ClienteDetalhesPage } from "./pages/admin/ClienteDetalhesPage";
import { ClienteEditarPage } from "./pages/admin/ClienteEditarPage";
import { AgendamentosPage as AdminAgendamentosPage } from "./pages/admin/AgendamentosPage";
import { AgendamentoNovoPage } from "./pages/admin/AgendamentoNovoPage";
import { AgendamentoDetalhesPage } from "./pages/admin/AgendamentoDetalhesPage";
import { AgendamentoEditarPage } from "./pages/admin/AgendamentoEditarPage";
import { PetsPage as AdminPetsPage } from "./pages/admin/PetsPage";
import { PetNovoPage } from "./pages/admin/PetNovoPage";
import { PetDetalhesPage } from "./pages/admin/PetDetalhesPage";
import { PetEditarPage } from "./pages/admin/PetEditarPage";
import { RelatoriosPage } from "./pages/admin/RelatoriosPage";
import { FuncionariosPage } from "./pages/admin/FuncionariosPage";
import { FuncionarioNovoPage } from "./pages/admin/FuncionarioNovoPage";
import { FuncionarioDetalhesPage } from "./pages/admin/FuncionarioDetalhesPage";
import { FuncionarioEditarPage } from "./pages/admin/FuncionarioEditarPage";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";
import { ErrorPage } from "./pages/ErrorPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { FuncionarioDashboardPage } from "./pages/funcionario/DashboardPage";
import { FuncionarioLayout } from "./pages/funcionario/Layout";
import { FuncionarioAgendamentosPage } from "./pages/funcionario/AgendamentosPage";
import { FuncionarioAgendamentoNovoPage } from "./pages/funcionario/AgendamentoNovoPage";
import { FuncionarioClientesPage } from "./pages/funcionario/ClientesPage";
import { FuncionarioPetsPage } from "./pages/funcionario/PetsPage";
import { FuncionarioPerfilPage } from "./pages/funcionario/PerfilPage";
import { FuncionarioHistoricoPage } from "./pages/funcionario/HistoricoPage";
import { FuncionarioClienteNovoPage } from "./pages/funcionario/ClienteNovoPage";
import { FuncionarioClienteDetalhesPage } from "./pages/funcionario/ClienteDetalhesPage";
import { FuncionarioClienteEditarPage } from "./pages/funcionario/ClienteEditarPage";
import { FuncionarioPetNovoPage } from "./pages/funcionario/PetNovoPage";
import { FuncionarioPetDetalhesPage } from "./pages/funcionario/PetDetalhesPage";
import { FuncionarioPetEditarPage } from "./pages/funcionario/PetEditarPage";
import { AdminHistoricoPage } from "./pages/admin/HistoricoPage";
import { ServicosPage } from "./pages/admin/ServicosPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

          <Route

            path="/admin"
            element={
              <PrivateRoute allowedRoles={["SUPER_USUARIO", "ADMINISTRADOR"]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="clientes/novo" element={<ClienteNovoPage />} />
            <Route path="clientes/:id" element={<ClienteDetalhesPage />} />
            <Route path="clientes/:id/editar" element={<ClienteEditarPage />} />
            <Route path="agendamentos" element={<AdminAgendamentosPage />} />
            <Route
              path="agendamentos/novo"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <AgendamentoNovoPage />
                </PrivateRoute>
              }
            />
            <Route path="agendamentos/:id" element={<AgendamentoDetalhesPage />} />
            <Route
              path="agendamentos/:id/editar"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <AgendamentoEditarPage />
                </PrivateRoute>
              }
            />
            <Route path="historico" element={<AdminHistoricoPage />} />
            <Route
              path="servicos"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <ServicosPage />
                </PrivateRoute>
              }
            />
            <Route path="pets" element={<AdminPetsPage />} />
            <Route
              path="pets/novo"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <PetNovoPage />
                </PrivateRoute>
              }
            />
            <Route path="pets/:id" element={<PetDetalhesPage />} />
            <Route
              path="pets/:id/editar"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <PetEditarPage />
                </PrivateRoute>
              }
            />
            <Route
              path="relatorios"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <RelatoriosPage />
                </PrivateRoute>
              }
            />

            {/* Rotas de Funcionarios */}
            <Route
              path="funcionarios"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <FuncionariosPage />
                </PrivateRoute>
              }
            />
            <Route
              path="funcionarios/novo"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <FuncionarioNovoPage />
                </PrivateRoute>
              }
            />
            <Route
              path="funcionarios/:id"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <FuncionarioDetalhesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="funcionarios/:id/editar"
              element={
                <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
                  <FuncionarioEditarPage />
                </PrivateRoute>
              }
            />
          </Route>

          <Route
            path="/funcionario"
            element={
              <PrivateRoute allowedRoles={["FUNCIONARIO"]}>
                <FuncionarioLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<FuncionarioDashboardPage />} />
            <Route path="agendamentos" element={<FuncionarioAgendamentosPage />} />
            <Route path="agendamentos/novo" element={<FuncionarioAgendamentoNovoPage />} />
            <Route path="clientes" element={<FuncionarioClientesPage />} />
            <Route path="clientes/novo" element={<FuncionarioClienteNovoPage />} />
            <Route path="clientes/:id" element={<FuncionarioClienteDetalhesPage />} />
            <Route path="clientes/:id/editar" element={<FuncionarioClienteEditarPage />} />
            <Route path="pets" element={<FuncionarioPetsPage />} />
            <Route path="pets/novo" element={<FuncionarioPetNovoPage />} />
            <Route path="pets/:id" element={<FuncionarioPetDetalhesPage />} />
            <Route path="pets/:id/editar" element={<FuncionarioPetEditarPage />} />
            <Route path="perfil" element={<FuncionarioPerfilPage />} />
            <Route path="historico" element={<FuncionarioHistoricoPage />} />
          </Route>

          <Route
            path="/app"
            element={
              <PrivateRoute
                allowedRoles={["CLIENTE", "SUPER_USUARIO", "ADMINISTRADOR"]}
              >
                <ClienteLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<ClienteDashboard />} />
            <Route path="perfil" element={<ClientePerfil />} />
            <Route path="perfil/editar" element={<EditarPerfilPage />} />
            <Route path="pets" element={<PetsPage />} />
            <Route path="pets/novo" element={<NovoPetPage />} />
            <Route path="pets/:id/editar" element={<EditarPetPage />} />
            <Route path="agendamentos" element={<AgendamentosPage />} />
            <Route path="agendamentos/novo" element={<NovoAgendamentoPage />} />
            <Route
              path="agendamentos/cancelar"
              element={<CancelarAgendamentoPage />}
            />
            <Route
              path="agendamentos/reagendar"
              element={<ReagendarAgendamentoPage />}
            />
            <Route path="historico" element={<HistoricoPage />} />
            <Route path="contatos" element={<ContatosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
          </Route>

          <Route path="/acesso-negado" element={<AccessDeniedPage />} />

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;