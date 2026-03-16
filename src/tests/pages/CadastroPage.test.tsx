import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CadastroPage } from "../../pages/CadastroPage";
import { ThemeProvider } from "../../context/ThemeContext";

const { mockRegister } = vi.hoisted(() => ({
  mockRegister: vi.fn()
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister
  })
}));

async function preencherFormularioBase(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Nome completo"), "Joao da Silva");
  await user.type(screen.getByPlaceholderText("Email"), "joao@site.com");
  await user.type(screen.getByPlaceholderText("(00) 00000-0000"), "11987654321");
  await user.type(screen.getByPlaceholderText("CPF (000.000.000-00)"), "12345678901");
  await user.type(screen.getByPlaceholderText("Endereço (rua, nº, bairro)"), "Rua A, 100");
  await user.type(screen.getByPlaceholderText("Ponto de referência"), "Praca");
}

function renderCadastroPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter
        initialEntries={["/cadastro"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/app" element={<div>Painel cliente</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("CadastroPage", () => {
  it("valida se senhas coincidem antes de enviar", async () => {
    const user = userEvent.setup();
    renderCadastroPage();

    await preencherFormularioBase(user);
    await user.type(screen.getByPlaceholderText("Senha (mín. 8 caracteres)"), "12345678");
    await user.type(screen.getByPlaceholderText("Confirmar senha"), "87654321");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("envia payload normalizado e navega para /app no sucesso", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);
    renderCadastroPage();

    await preencherFormularioBase(user);
    await user.type(screen.getByPlaceholderText("Senha (mín. 8 caracteres)"), "12345678");
    await user.type(screen.getByPlaceholderText("Confirmar senha"), "12345678");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        nome: "Joao da Silva",
        email: "joao@site.com",
        telefone: "(11) 98765-4321",
        endereco: "Rua A, 100",
        pontoReferencia: "Praca",
        senha: "12345678",
        confirmar_senha: "12345678",
        cpf: "12345678901",
        cidade: "Boa Viagem",
        estado: "CE",
        cep: "63870000"
      });
    });

    expect(await screen.findByText("Painel cliente")).toBeInTheDocument();
  });

  it("mostra mensagem de erro retornada pela API", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce({
      response: {
        data: {
          detail: "Email ja cadastrado"
        }
      }
    });

    renderCadastroPage();

    await preencherFormularioBase(user);
    await user.type(screen.getByPlaceholderText("Senha (mín. 8 caracteres)"), "12345678");
    await user.type(screen.getByPlaceholderText("Confirmar senha"), "12345678");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Email ja cadastrado")).toBeInTheDocument();
  });
});
