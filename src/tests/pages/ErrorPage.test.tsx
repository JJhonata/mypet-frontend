import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorPage } from "../../pages/ErrorPage";
import { ThemeProvider } from "../../context/ThemeContext";

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const mockUseRouteError = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useRouteError: () => mockUseRouteError()
  };
});

describe("ErrorPage", () => {
  it("renderiza texto padrão e detalhes do erro", () => {
    mockUseRouteError.mockReturnValue(new Error("Falha interna"));
    renderWithTheme(<ErrorPage />);

    expect(screen.getByText("Ops! Algo deu errado")).toBeInTheDocument();
    expect(screen.getByText("Falha interna")).toBeInTheDocument();
  });

  it("renderiza botão para recarregar página", () => {
    mockUseRouteError.mockReturnValue(new Error("Erro"));

    renderWithTheme(<ErrorPage />);

    expect(screen.getByRole("button", { name: "Recarregar página" })).toBeInTheDocument();
  });
});
