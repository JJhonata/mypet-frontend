import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../../context/AuthContext";

const { loginMock, criarClienteMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  criarClienteMock: vi.fn()
}));

vi.mock("../../services/api", async () => {
  const actual = await vi.importActual<typeof import("../../services/api")>("../../services/api");

  return {
    ...actual,
    api: {
      ...actual.api,
      login: loginMock,
      criarCliente: criarClienteMock
    }
  };
});

function AuthConsumer() {
  const { user, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user-name">{user?.nome ?? "sem-user"}</div>
      <div data-testid="user-role">{user?.role ?? "sem-role"}</div>
      <button type="button" onClick={() => login("user@site.com", "12345678")}>fazer-login</button>
      <button type="button" onClick={() => logout()}>fazer-logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  it("restaura sessão válida do localStorage", async () => {
    localStorage.setItem(
      "mypet:user",
      JSON.stringify({ id: 7, nome: "Joao", email: "joao@site.com", role: "CLIENTE" })
    );
    localStorage.setItem("mypet:access_token", "token-valido");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(await screen.findByTestId("user-name")).toHaveTextContent("Joao");
    expect(screen.getByTestId("user-role")).toHaveTextContent("CLIENTE");
  });

  it("login atualiza estado e persiste usuário", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({
      id: 10,
      nome: "Maria",
      email: "maria@site.com",
      role: "FUNCIONARIO",
      clienteId: undefined,
      telefone: "",
      foto: ""
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: "fazer-login" }));

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Maria");
      expect(screen.getByTestId("user-role")).toHaveTextContent("FUNCIONARIO");
    });

    const stored = localStorage.getItem("mypet:user");
    expect(stored).toBeTruthy();
    expect(stored).toContain("Maria");
  });

  it("logout limpa estado e tokens", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({
      id: 11,
      nome: "Carla",
      email: "carla@site.com",
      role: "CLIENTE"
    });

    localStorage.setItem("mypet:access_token", "token-antigo");
    localStorage.setItem("mypet:refresh_token", "refresh-antigo");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: "fazer-login" }));
    await screen.findByText("Carla");

    await user.click(screen.getByRole("button", { name: "fazer-logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("sem-user");
    });

    expect(localStorage.getItem("mypet:user")).toBeNull();
    expect(localStorage.getItem("mypet:access_token")).toBeNull();
    expect(localStorage.getItem("mypet:refresh_token")).toBeNull();
  });
});
