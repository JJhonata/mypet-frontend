import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ClienteNovoPage } from "../../../pages/admin/ClienteNovoPage";

const { navigateMock, criarClienteAdminMock, useAuthMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  criarClienteAdminMock: vi.fn(),
  useAuthMock: vi.fn()
}));

vi.mock("../../../services/api", () => ({
  api: {
    criarClienteAdmin: criarClienteAdminMock
  }
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => useAuthMock()
}));

vi.mock("../../../components/mobile/TopBarTitle", () => ({
  TopBarTitle: ({ title }: { title: string }) => <div>{title}</div>
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
    <MemoryRouter initialEntries={["/admin/clientes/novo"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/admin/clientes/novo" element={<ClienteNovoPage />} />
        <Route path="/acesso-negado" element={<div>Acesso negado</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ClienteNovoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { id: 1, role: "ADMINISTRADOR" }
    });
  });

  it("redireciona para acesso negado quando usuário não tem permissão", async () => {
    useAuthMock.mockReturnValue({ user: { id: 2, role: "CLIENTE" } });

    renderPage();

    expect(await screen.findByText("Acesso negado")).toBeInTheDocument();
  });

  it("submete formulário e navega para detalhes do cliente criado", async () => {
    const user = userEvent.setup();
    criarClienteAdminMock.mockResolvedValueOnce({ id: 42 });

    renderPage();

    const [nomeInput, emailInput, telefoneInput, cpfInput, enderecoInput, pontoRefInput] =
      screen.getAllByRole("textbox");
    const senhaInput = document.querySelector("input[type='password']") as HTMLInputElement;

    await user.type(nomeInput, "Carla Mendes");
    await user.type(emailInput, "carla@site.com");
    await user.type(telefoneInput, "11977776666");
    await user.type(cpfInput, "123.456.789-00");
    await user.type(enderecoInput, "Rua das Flores");
    await user.type(pontoRefInput, "Padaria");
    await user.type(senhaInput, "12345678");
    await user.click(screen.getByRole("button", { name: "Criar cliente" }));

    await waitFor(() => {
      expect(criarClienteAdminMock).toHaveBeenCalledWith({
        nome: "Carla Mendes",
        email: "carla@site.com",
        telefone: "11977776666",
        cpf: "123.456.789-00",
        endereco: "Rua das Flores",
        pontoReferencia: "Padaria",
        senha: "12345678"
      });
      expect(navigateMock).toHaveBeenCalledWith("/admin/clientes/42", {
        state: {
          flash: {
            type: "success",
            message: "Cliente criado com sucesso."
          }
        }
      });
    });
  });

  it("exibe erro quando criação falha", async () => {
    const user = userEvent.setup();
    criarClienteAdminMock.mockRejectedValueOnce(new Error("Falha ao criar"));

    renderPage();

    const [nomeInput, emailInput, telefoneInput, cpfInput, enderecoInput] = screen.getAllByRole("textbox");

    await user.type(nomeInput, "Carla Mendes");
    await user.type(emailInput, "carla@site.com");
    await user.type(telefoneInput, "11977776666");
    await user.type(cpfInput, "123.456.789-00");
    await user.type(enderecoInput, "Rua das Flores");
    await user.click(screen.getByRole("button", { name: "Criar cliente" }));

    expect(await screen.findByText("Falha ao criar")).toBeInTheDocument();
  });
});
