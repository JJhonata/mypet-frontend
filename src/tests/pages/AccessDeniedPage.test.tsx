import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccessDeniedPage } from "../../pages/AccessDeniedPage";
import { ThemeProvider } from "../../context/ThemeContext";

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe("AccessDeniedPage", () => {
  it("renderiza mensagem de acesso negado", () => {
    renderWithTheme(<AccessDeniedPage />);

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
    expect(
      screen.getByText("Seu perfil não possui permissão para acessar esta área.")
    ).toBeInTheDocument();
  });

  it("navega para login ao clicar no botão correspondente", async () => {
    const user = userEvent.setup();
    renderWithTheme(<AccessDeniedPage />);

    await user.click(screen.getByRole("button", { name: "Ir para login" }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("volta para rota anterior ao clicar em Voltar", async () => {
    const user = userEvent.setup();
    renderWithTheme(<AccessDeniedPage />);

    await user.click(screen.getByRole("button", { name: "Voltar" }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
