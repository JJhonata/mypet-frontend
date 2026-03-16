import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "../../components/PrivateRoute";

const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth()
}));

function renderPrivateRoute() {
  return render(
    <MemoryRouter
      initialEntries={["/area"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/area"
          element={
            <PrivateRoute allowedRoles={["ADMINISTRADOR"]}>
              <div>Conteudo protegido</div>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<div>Tela de login</div>} />
        <Route path="/acesso-negado" element={<div>Acesso negado</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PrivateRoute", () => {
  it("redireciona para login quando não há usuário", () => {
    mockUseAuth.mockReturnValue({ user: null });
    renderPrivateRoute();

    expect(screen.getByText("Tela de login")).toBeInTheDocument();
  });

  it("redireciona para acesso negado quando role não permitida", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nome: "Ana", email: "ana@x.com", role: "CLIENTE" }
    });
    renderPrivateRoute();

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
  });

  it("renderiza conteúdo quando role é permitida", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nome: "Ana", email: "ana@x.com", role: "ADMINISTRADOR" }
    });
    renderPrivateRoute();

    expect(screen.getByText("Conteudo protegido")).toBeInTheDocument();
  });
});
