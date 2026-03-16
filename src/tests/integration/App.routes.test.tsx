import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  user: null as any
}));

vi.mock("../../context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: authState.user,
    login: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    logout: vi.fn()
  })
}));

vi.mock("../../pages/LoginPage", () => ({ LoginPage: () => <div>Pagina Login</div> }));
vi.mock("../../pages/CadastroPage", () => ({ CadastroPage: () => <div>Pagina Cadastro</div> }));
vi.mock("../../pages/EsqueciSenhaPage", () => ({ EsqueciSenhaPage: () => <div>Pagina Esqueci Senha</div> }));
vi.mock("../../pages/RedefinirSenhaPage", () => ({ RedefinirSenhaPage: () => <div>Pagina Redefinir Senha</div> }));
vi.mock("../../pages/cliente/ClienteLayout", () => ({ ClienteLayout: () => <div>Layout Cliente</div> }));
vi.mock("../../pages/admin/AdminLayout", () => ({ AdminLayout: () => <div>Layout Admin</div> }));
vi.mock("../../pages/cliente/ClienteDashboard", () => ({ ClienteDashboard: () => <div>Dashboard Cliente</div> }));
vi.mock("../../pages/cliente/ClientePerfil", () => ({ ClientePerfil: () => <div>Perfil Cliente</div> }));
vi.mock("../../pages/cliente/EditarPerfilPage", () => ({ EditarPerfilPage: () => <div>Editar Perfil</div> }));
vi.mock("../../pages/cliente/CancelarAgendamentoPage", () => ({ CancelarAgendamentoPage: () => <div>Cancelar Agendamento</div> }));
vi.mock("../../pages/cliente/ReagendarAgendamentoPage", () => ({ ReagendarAgendamentoPage: () => <div>Reagendar Agendamento</div> }));
vi.mock("../../pages/cliente/ContatosPage", () => ({ ContatosPage: () => <div>Contatos</div> }));
vi.mock("../../pages/cliente/ConfiguracoesPage", () => ({ ConfiguracoesPage: () => <div>Configuracoes</div> }));
vi.mock("../../pages/cliente/PetsPage", () => ({ PetsPage: () => <div>Pets Cliente</div> }));
vi.mock("../../pages/cliente/NovoPetPage", () => ({ NovoPetPage: () => <div>Novo Pet</div> }));
vi.mock("../../pages/cliente/EditarPetPage", () => ({ EditarPetPage: () => <div>Editar Pet</div> }));
vi.mock("../../pages/cliente/AgendamentosPage", () => ({ AgendamentosPage: () => <div>Agendamentos Cliente</div> }));
vi.mock("../../pages/cliente/NovoAgendamentoPage", () => ({ NovoAgendamentoPage: () => <div>Novo Agendamento</div> }));
vi.mock("../../pages/cliente/HistoricoPage", () => ({ HistoricoPage: () => <div>Historico Cliente</div> }));
vi.mock("../../pages/admin/AdminDashboard", () => ({ AdminDashboard: () => <div>Dashboard Admin</div> }));
vi.mock("../../pages/admin/ClientesPage", () => ({ ClientesPage: () => <div>Clientes Admin</div> }));
vi.mock("../../pages/admin/ClienteNovoPage", () => ({ ClienteNovoPage: () => <div>Cliente Novo</div> }));
vi.mock("../../pages/admin/ClienteDetalhesPage", () => ({ ClienteDetalhesPage: () => <div>Cliente Detalhes</div> }));
vi.mock("../../pages/admin/ClienteEditarPage", () => ({ ClienteEditarPage: () => <div>Cliente Editar</div> }));
vi.mock("../../pages/admin/AgendamentosPage", () => ({ AgendamentosPage: () => <div>Agendamentos Admin</div> }));
vi.mock("../../pages/admin/AgendamentoNovoPage", () => ({ AgendamentoNovoPage: () => <div>Agendamento Novo</div> }));
vi.mock("../../pages/admin/AgendamentoDetalhesPage", () => ({ AgendamentoDetalhesPage: () => <div>Agendamento Detalhes</div> }));
vi.mock("../../pages/admin/AgendamentoEditarPage", () => ({ AgendamentoEditarPage: () => <div>Agendamento Editar</div> }));
vi.mock("../../pages/admin/PetsPage", () => ({ PetsPage: () => <div>Pets Admin</div> }));
vi.mock("../../pages/admin/PetNovoPage", () => ({ PetNovoPage: () => <div>Pet Novo</div> }));
vi.mock("../../pages/admin/PetDetalhesPage", () => ({ PetDetalhesPage: () => <div>Pet Detalhes</div> }));
vi.mock("../../pages/admin/PetEditarPage", () => ({ PetEditarPage: () => <div>Pet Editar</div> }));
vi.mock("../../pages/admin/RelatoriosPage", () => ({ RelatoriosPage: () => <div>Relatorios</div> }));
vi.mock("../../pages/admin/FuncionariosPage", () => ({ FuncionariosPage: () => <div>Funcionarios</div> }));
vi.mock("../../pages/admin/FuncionarioNovoPage", () => ({ FuncionarioNovoPage: () => <div>Funcionario Novo</div> }));
vi.mock("../../pages/admin/FuncionarioDetalhesPage", () => ({ FuncionarioDetalhesPage: () => <div>Funcionario Detalhes</div> }));
vi.mock("../../pages/admin/FuncionarioEditarPage", () => ({ FuncionarioEditarPage: () => <div>Funcionario Editar</div> }));
vi.mock("../../pages/AccessDeniedPage", () => ({ AccessDeniedPage: () => <div>Pagina Acesso Negado</div> }));
vi.mock("../../pages/ErrorPage", () => ({ ErrorPage: () => <div>Pagina Erro</div> }));
vi.mock("../../pages/funcionario/DashboardPage", () => ({ FuncionarioDashboardPage: () => <div>Dashboard Funcionario</div> }));
vi.mock("../../pages/funcionario/Layout", () => ({ FuncionarioLayout: () => <div>Layout Funcionario</div> }));
vi.mock("../../pages/funcionario/AgendamentosPage", () => ({ FuncionarioAgendamentosPage: () => <div>Agendamentos Funcionario</div> }));
vi.mock("../../pages/funcionario/AgendamentoNovoPage", () => ({ FuncionarioAgendamentoNovoPage: () => <div>Agendamento Novo Funcionario</div> }));
vi.mock("../../pages/funcionario/ClientesPage", () => ({ FuncionarioClientesPage: () => <div>Clientes Funcionario</div> }));
vi.mock("../../pages/funcionario/PetsPage", () => ({ FuncionarioPetsPage: () => <div>Pets Funcionario</div> }));
vi.mock("../../pages/funcionario/PerfilPage", () => ({ FuncionarioPerfilPage: () => <div>Perfil Funcionario</div> }));
vi.mock("../../pages/funcionario/HistoricoPage", () => ({ FuncionarioHistoricoPage: () => <div>Historico Funcionario</div> }));
vi.mock("../../pages/admin/HistoricoPage", () => ({ AdminHistoricoPage: () => <div>Historico Admin</div> }));

import App from "../../App";

describe("App routes", () => {
  beforeEach(() => {
    authState.user = null;
    window.history.pushState({}, "", "/");
  });

  it("redireciona raiz para login", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Pagina Login")).toBeInTheDocument();
    });
  });

  it("bloqueia /admin sem usuario e envia para login", async () => {
    window.history.pushState({}, "", "/admin");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Pagina Login")).toBeInTheDocument();
    });
  });

  it("permite /admin para administrador", async () => {
    authState.user = {
      id: 1,
      nome: "Admin",
      email: "admin@site.com",
      role: "ADMINISTRADOR"
    };
    window.history.pushState({}, "", "/admin");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Layout Admin")).toBeInTheDocument();
    });
  });

  it("redireciona CLIENTE em /admin para acesso negado", async () => {
    authState.user = {
      id: 2,
      nome: "Cliente",
      email: "cliente@site.com",
      role: "CLIENTE"
    };
    window.history.pushState({}, "", "/admin");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Pagina Acesso Negado")).toBeInTheDocument();
    });
  });
});
