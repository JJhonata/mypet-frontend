import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgendamentosPage } from "../../../pages/admin/AgendamentosPage";

const {
  navigateMock,
  listarTodosAgendamentosMock,
  listarTodosClientesMock,
  listarTodosPetsMock,
  listarFormasPagamentoMock,
  iniciarAgendamentoMock,
  cancelarAgendamentoMock,
  obterAgendamentoMock,
  concluirAgendamentoMock,
  openMenuMock,
  useAuthMock
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  listarTodosAgendamentosMock: vi.fn(),
  listarTodosClientesMock: vi.fn(),
  listarTodosPetsMock: vi.fn(),
  listarFormasPagamentoMock: vi.fn(),
  iniciarAgendamentoMock: vi.fn(),
  cancelarAgendamentoMock: vi.fn(),
  obterAgendamentoMock: vi.fn(),
  concluirAgendamentoMock: vi.fn(),
  openMenuMock: vi.fn(),
  useAuthMock: vi.fn()
}));

vi.mock("../../../services/api", () => ({
  api: {
    listarTodosAgendamentos: listarTodosAgendamentosMock,
    listarTodosClientes: listarTodosClientesMock,
    listarTodosPets: listarTodosPetsMock,
    listarFormasPagamento: listarFormasPagamentoMock,
    iniciarAgendamento: iniciarAgendamentoMock,
    cancelarAgendamento: cancelarAgendamentoMock,
    obterAgendamento: obterAgendamentoMock,
    concluirAgendamento: concluirAgendamentoMock
  }
}));

vi.mock("../../../pages/admin/AdminLayout", () => ({
  useAdminShell: () => ({ openMenu: openMenuMock })
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => useAuthMock()
}));

vi.mock("../../../components/mobile/TopBarTitle", () => ({
  TopBarTitle: ({ title }: { title: string }) => <div>{title}</div>
}));

vi.mock("../../../components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div>Carregando...</div>
}));

vi.mock("../../../components/ui/AnimatedButton", () => ({
  AnimatedButton: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe("AgendamentosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user: { id: 7, nome: "Admin Teste", role: "ADMINISTRADOR" } });

    listarTodosAgendamentosMock.mockResolvedValue([
      {
        id: 1,
        clienteId: 1,
        petId: 10,
        dataHora: "2026-03-14T10:30:00.000Z",
        tipoServico: "BANHO",
        status: "AGENDADO",
        statusPagamento: "PENDENTE",
        pagamentoMomento: "ANTES"
      },
      {
        id: 2,
        clienteId: 2,
        petId: 11,
        dataHora: "2026-03-15T11:30:00.000Z",
        tipoServico: "TOSA",
        status: "CONCLUIDO",
        statusPagamento: "PAGO",
        formaPagamento: "PIX",
        valorPago: 89.9,
        pagamentoMomento: "DEPOIS"
      }
    ]);

    listarTodosClientesMock.mockResolvedValue([
      { id: 1, nome: "Ana Souza", email: "ana@site.com", telefone: "11", endereco: "Rua A" },
      { id: 2, nome: "Bruno Lima", email: "bruno@site.com", telefone: "22", endereco: "Rua B" }
    ]);

    listarTodosPetsMock.mockResolvedValue([
      { id: 10, clienteId: 1, nome: "Rex", raca: "Labrador", idade: 3, peso: 18, especie: "Cao" },
      { id: 11, clienteId: 2, nome: "Mia", raca: "Siamês", idade: 2, peso: 4, especie: "Gato" }
    ]);

    listarFormasPagamentoMock.mockResolvedValue([
      { id: 1, nome: "Dinheiro" },
      { id: 2, nome: "PIX" }
    ]);

    iniciarAgendamentoMock.mockResolvedValue({ id: 1, status: "EM_ANDAMENTO" });
    cancelarAgendamentoMock.mockResolvedValue(undefined);
    obterAgendamentoMock.mockResolvedValue({ id: 1, status: "CANCELADO" });
    concluirAgendamentoMock.mockResolvedValue({ id: 1, status: "CONCLUIDO" });
  });

  it("carrega e exibe os agendamentos", async () => {
    render(<AgendamentosPage />);

    expect(await screen.findByText("Gerenciar Agendamentos")).toBeInTheDocument();
    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
    expect(await screen.findByText("Bruno Lima")).toBeInTheDocument();
    expect(await screen.findByText("Rex")).toBeInTheDocument();
    expect(await screen.findByText("Mia")).toBeInTheDocument();
  });

  it("filtra agendamentos por termo de busca", async () => {
    const user = userEvent.setup();
    render(<AgendamentosPage />);

    await screen.findByText("Ana Souza");
    await user.type(screen.getByPlaceholderText("Buscar agendamento..."), "mia");

    await waitFor(() => {
      expect(screen.queryByText("Rex")).not.toBeInTheDocument();
      expect(screen.getByText("Mia")).toBeInTheDocument();
    });
  });

  it("inicia atendimento ao clicar na ação de iniciar", async () => {
    const user = userEvent.setup();
    render(<AgendamentosPage />);

    await screen.findByText("Ana Souza");
    const botoesIniciar = screen.getAllByTitle("Iniciar Atendimento");
    await user.click(botoesIniciar[0]);

    await waitFor(() => {
      expect(iniciarAgendamentoMock).toHaveBeenCalledWith(1);
    });
  });

  it("abre modal e conclui atendimento", async () => {
    const user = userEvent.setup();
    render(<AgendamentosPage />);

    await screen.findByText("Ana Souza");
    const botoesConcluir = screen.getAllByTitle("Concluir");
    await user.click(botoesConcluir[0]);

    const textosModal = await screen.findAllByText("Concluir atendimento");
    expect(textosModal.length).toBeGreaterThan(0);
    await user.type(screen.getByPlaceholderText("Ex: 89.90"), "99.9");
    await user.type(screen.getByPlaceholderText("Ex: 123456"), "ABC123");
    await user.click(screen.getByRole("button", { name: "Concluir atendimento" }));

    await waitFor(() => {
      expect(concluirAgendamentoMock).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          formaPagamentoId: 2,
          valorPago: 99.9,
          codigoAutorizacao: "ABC123",
          confirmadoPor: "Admin Teste"
        })
      );
    });
  });
});
