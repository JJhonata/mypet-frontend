import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { FuncionariosPage } from "../../../pages/admin/FuncionariosPage";
import { ThemeProvider } from "../../../context/ThemeContext";

const { navigateMock, listarFuncionariosMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  listarFuncionariosMock: vi.fn()
}));

vi.mock("../../../services/api", () => ({
  api: {
    listarFuncionarios: listarFuncionariosMock
  }
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FuncionariosPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("FuncionariosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listarFuncionariosMock.mockResolvedValue([
      {
        id: 1,
        usuario: {
          id: 11,
          nome: "Carlos Silva",
          email: "carlos@site.com",
          telefone: "11999998888"
        },
        cargo: "VETERINARIO",
        cargo_display: "Veterinário",
        ativo: true
      },
      {
        id: 2,
        usuario: {
          id: 12,
          nome: "Bruna Lima",
          email: "bruna@site.com",
          telefone: "11977776666"
        },
        cargo: "ATENDENTE",
        cargo_display: "Atendente",
        ativo: true
      }
    ]);
  });

  it("carrega e exibe funcionários", async () => {
    renderPage();

    expect((await screen.findAllByText("Carlos Silva")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bruna Lima").length).toBeGreaterThan(0);
  });

  it("filtra funcionários por nome ou email", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findAllByText("Carlos Silva");
    await user.type(
      screen.getByPlaceholderText("Buscar veterinário ou atendente por nome/e-mail..."),
      "bruna"
    );

    await waitFor(() => {
      expect(screen.queryByText("Carlos Silva")).not.toBeInTheDocument();
      expect(screen.getAllByText("Bruna Lima").length).toBeGreaterThan(0);
    });
  });

  it("navega para tela de novo funcionário", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findAllByText("Carlos Silva");
    await user.click(screen.getByRole("button", { name: "Novo Funcionário" }));

    expect(navigateMock).toHaveBeenCalledWith("/admin/funcionarios/novo");
  });

  it("exibe estado vazio quando não há funcionários", async () => {
    listarFuncionariosMock.mockResolvedValueOnce([]);
    renderPage();

    expect(await screen.findByText("Nenhum funcionário encontrado")).toBeInTheDocument();
  });
});
