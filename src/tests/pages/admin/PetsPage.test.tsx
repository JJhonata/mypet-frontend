import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PetsPage } from "../../../pages/admin/PetsPage";

const {
  navigateMock,
  listarTodosClientesMock,
  listarTodosPetsMock,
  openMenuMock,
  useAuthMock
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  listarTodosClientesMock: vi.fn(),
  listarTodosPetsMock: vi.fn(),
  openMenuMock: vi.fn(),
  useAuthMock: vi.fn()
}));

vi.mock("../../../services/api", () => ({
  api: {
    listarTodosClientes: listarTodosClientesMock,
    listarTodosPets: listarTodosPetsMock
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

describe("PetsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user: { id: 1, role: "ADMINISTRADOR" } });
    listarTodosClientesMock.mockResolvedValue([
      { id: 1, nome: "Ana", email: "ana@site.com", telefone: "1", endereco: "Rua A" },
      { id: 2, nome: "Bruno", email: "b@site.com", telefone: "2", endereco: "Rua B" }
    ]);
    listarTodosPetsMock.mockResolvedValue([
      {
        id: 10,
        clienteId: 1,
        nome: "Rex",
        raca: "Labrador",
        idade: 4,
        peso: 20,
        especie: "Cao"
      },
      {
        id: 11,
        clienteId: 2,
        nome: "Mia",
        raca: "Siamês",
        idade: 2,
        peso: 4,
        especie: "Gato"
      }
    ]);
  });

  it("carrega e exibe lista de pets", async () => {
    render(<PetsPage />);

    expect(await screen.findByText("Gerenciar Pets")).toBeInTheDocument();
    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(screen.getByText("Mia")).toBeInTheDocument();
  });

  it("filtra pets pelo termo de busca", async () => {
    const user = userEvent.setup();
    render(<PetsPage />);

    await screen.findByText("Rex");
    await user.type(screen.getByPlaceholderText("Buscar pets..."), "mia");

    await waitFor(() => {
      expect(screen.queryByText("Rex")).not.toBeInTheDocument();
      expect(screen.getByText("Mia")).toBeInTheDocument();
    });
  });

  it("desabilita criar pet para usuário sem perfil ADMINISTRADOR", async () => {
    useAuthMock.mockReturnValue({ user: { id: 2, role: "FUNCIONARIO" } });
    render(<PetsPage />);

    const botaoNovo = await screen.findByRole("button", { name: "Novo Pet" });
    expect(botaoNovo).toBeDisabled();

    const botoesEditar = screen.queryAllByTitle("Editar pet");
    expect(botoesEditar).toHaveLength(0);
  });

  it("navega para detalhes ao clicar em Visualizar pet", async () => {
    const user = userEvent.setup();
    render(<PetsPage />);

    await screen.findByText("Rex");
    const visualizar = screen.getAllByTitle("Visualizar pet");
    await user.click(visualizar[0]);

    expect(navigateMock).toHaveBeenCalledWith("/admin/pets/10");
  });
});
