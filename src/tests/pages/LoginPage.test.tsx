import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "../../pages/LoginPage";
import { ThemeProvider } from "../../context/ThemeContext";

const mockLogin = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

function renderLoginPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter
        initialEntries={["/login"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div>Painel admin</div>} />
          <Route path="/funcionario" element={<div>Painel funcionario</div>} />
          <Route path="/app" element={<div>Painel cliente</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("LoginPage", () => {
  it("redireciona ADMINISTRADOR para /admin", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      id: 1,
      nome: "Admin",
      email: "admin@site.com",
      role: "ADMINISTRADOR"
    });

    renderLoginPage();

    await user.type(screen.getByPlaceholderText("Email"), "admin@site.com");
    await user.type(screen.getByPlaceholderText("Senha"), "12345678");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Painel admin")).toBeInTheDocument();
  });

  it("redireciona CLIENTE para /app", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      id: 2,
      nome: "Cliente",
      email: "cliente@site.com",
      role: "CLIENTE"
    });

    renderLoginPage();

    await user.type(screen.getByPlaceholderText("Email"), "cliente@site.com");
    await user.type(screen.getByPlaceholderText("Senha"), "12345678");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Painel cliente")).toBeInTheDocument();
  });

  it("exibe erro retornado pelo backend", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          detail: "Credenciais inválidas"
        }
      }
    });

    renderLoginPage();

    await user.type(screen.getByPlaceholderText("Email"), "erro@site.com");
    await user.type(screen.getByPlaceholderText("Senha"), "12345678");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    });
  });
});
