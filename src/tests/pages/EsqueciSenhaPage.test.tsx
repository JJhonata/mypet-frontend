import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EsqueciSenhaPage } from "../../pages/EsqueciSenhaPage";
import { ThemeProvider } from "../../context/ThemeContext";

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const { navigateMock, solicitarRecuperacaoSenhaMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  solicitarRecuperacaoSenhaMock: vi.fn()
}));

vi.mock("../../services/api", () => ({
  api: {
    solicitarRecuperacaoSenha: solicitarRecuperacaoSenhaMock
  }
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe("EsqueciSenhaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia email e exibe mensagem de sucesso", async () => {
    const user = userEvent.setup();
    solicitarRecuperacaoSenhaMock.mockResolvedValueOnce(undefined);

    renderWithTheme(<EsqueciSenhaPage />);

    await user.type(screen.getByPlaceholderText("Seu email"), "cliente@site.com");
    await user.click(screen.getByRole("button", { name: "Enviar instruções" }));

    expect(solicitarRecuperacaoSenhaMock).toHaveBeenCalledWith("cliente@site.com");
    expect(
      await screen.findByText(
        "Se este email estiver cadastrado, enviaremos as instruções para redefinir sua senha."
      )
    ).toBeInTheDocument();
  });

  it("mostra erro da API quando solicitação falha", async () => {
    const user = userEvent.setup();
    solicitarRecuperacaoSenhaMock.mockRejectedValueOnce({
      response: { data: { detail: "Erro no servidor" } }
    });

    renderWithTheme(<EsqueciSenhaPage />);

    await user.type(screen.getByPlaceholderText("Seu email"), "cliente@site.com");
    await user.click(screen.getByRole("button", { name: "Enviar instruções" }));

    expect(await screen.findByText("Erro no servidor")).toBeInTheDocument();
  });

  it("volta para login ao clicar no botão de retorno", async () => {
    const user = userEvent.setup();

    renderWithTheme(<EsqueciSenhaPage />);

    await user.click(screen.getByRole("button", { name: "Voltar para login" }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });
});
