import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedefinirSenhaPage } from "../../pages/RedefinirSenhaPage";
import { ThemeProvider } from "../../context/ThemeContext";

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const { navigateMock, confirmarRedefinicaoSenhaMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  confirmarRedefinicaoSenhaMock: vi.fn()
}));
let searchParamsValue = new URLSearchParams("uid=uid123&token=token123");

vi.mock("../../services/api", () => ({
  api: {
    confirmarRedefinicaoSenha: confirmarRedefinicaoSenhaMock
  }
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [searchParamsValue]
  };
});

describe("RedefinirSenhaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsValue = new URLSearchParams("uid=uid123&token=token123");
  });

  it("mostra tela de link inválido quando faltam parâmetros", async () => {
    const user = userEvent.setup();
    searchParamsValue = new URLSearchParams("");

    renderWithTheme(<RedefinirSenhaPage />);

    expect(screen.getByText("Link inválido ou expirado.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Voltar para o login" }));
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("valida senhas diferentes antes de chamar API", async () => {
    const user = userEvent.setup();

    renderWithTheme(<RedefinirSenhaPage />);

    await user.type(
      screen.getByPlaceholderText("Nova senha (mínimo 8 caracteres)"),
      "12345678"
    );
    await user.type(screen.getByPlaceholderText("Confirme a nova senha"), "87654321");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(confirmarRedefinicaoSenhaMock).not.toHaveBeenCalled();
  });

  it("redefine senha com sucesso", async () => {
    const user = userEvent.setup();
    confirmarRedefinicaoSenhaMock.mockResolvedValueOnce(undefined);

    renderWithTheme(<RedefinirSenhaPage />);

    await user.type(
      screen.getByPlaceholderText("Nova senha (mínimo 8 caracteres)"),
      "senha1234"
    );
    await user.type(screen.getByPlaceholderText("Confirme a nova senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(confirmarRedefinicaoSenhaMock).toHaveBeenCalledWith({
      uid: "uid123",
      token: "token123",
      senha_nova: "senha1234",
      confirmar_senha: "senha1234"
    });
    expect(
      await screen.findByText("Senha redefinida com sucesso! Você já pode fazer login.")
    ).toBeInTheDocument();
  });

  it("mostra erro da API quando redefinição falha", async () => {
    const user = userEvent.setup();
    confirmarRedefinicaoSenhaMock.mockRejectedValueOnce({
      response: { data: { detail: "Token inválido" } }
    });

    renderWithTheme(<RedefinirSenhaPage />);

    await user.type(
      screen.getByPlaceholderText("Nova senha (mínimo 8 caracteres)"),
      "senha1234"
    );
    await user.type(screen.getByPlaceholderText("Confirme a nova senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByText("Token inválido")).toBeInTheDocument();
  });
});
