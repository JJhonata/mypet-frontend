import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClientesPage } from "../../../pages/admin/ClientesPage";

const { navigateMock, listarTodosClientesMock, excluirClienteMock, openMenuMock, useAuthMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  listarTodosClientesMock: vi.fn(),
  excluirClienteMock: vi.fn(),
  openMenuMock: vi.fn(),
  useAuthMock: vi.fn()
}));

vi.mock("../../../services/api", () => ({
  api: {
    listarTodosClientes: listarTodosClientesMock,
    excluirCliente: excluirClienteMock
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

vi.mock("../../../components/ui/AvatarUpload", () => ({
  AvatarUpload: ({ nome }: { nome?: string }) => <div>Avatar {nome ?? "-"}</div>
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe("ClientesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user: { id: 1, role: "ADMINISTRADOR" } });
    listarTodosClientesMock.mockResolvedValue([
      {
        id: 1,
        nome: "Ana Souza",
        email: "ana@site.com",
        telefone: "11999990000",
        endereco: "Rua A"
      },
      {
        id: 2,
        nome: "Bruno Lima",
        email: "bruno@site.com",
        telefone: "11888887777",
        endereco: "Rua B"
      }
    ]);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("carrega e exibe lista de clientes", async () => {
    render(<ClientesPage />);

    expect(await screen.findByText("Gerenciar Clientes")).toBeInTheDocument();
    expect(screen.getAllByText("Ana Souza").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bruno Lima").length).toBeGreaterThan(0);
  });

  it("filtra clientes pelo termo de busca", async () => {
    const user = userEvent.setup();
    render(<ClientesPage />);

    await screen.findAllByText("Ana Souza");
    await user.type(screen.getByPlaceholderText("Buscar cliente..."), "bruno");

    await waitFor(() => {
      expect(screen.queryAllByText("Ana Souza").length).toBe(0);
      expect(screen.getAllByText("Bruno Lima").length).toBeGreaterThan(0);
    });
  });

  it("exclui cliente quando usuário é admin e confirma ação", async () => {
    const user = userEvent.setup();
    excluirClienteMock.mockResolvedValueOnce(undefined);

    render(<ClientesPage />);

    await screen.findAllByText("Ana Souza");
    const botoesExcluir = screen.getAllByTitle("Excluir");
    await user.click(botoesExcluir[0]);

    await waitFor(() => {
      expect(excluirClienteMock).toHaveBeenCalledWith(1);
    });
  });
});
