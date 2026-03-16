import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../services/api";

const { httpClientMock } = vi.hoisted(() => ({
  httpClientMock: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock("../../services/httpClient", () => ({
  default: httpClientMock
}));

describe("api autenticacao e cadastro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("login salva tokens e retorna usuario mapeado", async () => {
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        access: "access-token",
        refresh: "refresh-token"
      }
    });

    httpClientMock.get.mockResolvedValueOnce({
      data: {
        id: 12,
        nome: "Ana",
        email: "ana@site.com",
        groups: ["ADMINISTRADOR"],
        cliente_id: 99,
        telefone: "11999999999",
        foto: "foto.png"
      }
    });

    const result = await api.login("ana@site.com", "12345678");

    expect(httpClientMock.post).toHaveBeenCalledWith("/auth/login/", {
      email: "ana@site.com",
      password: "12345678"
    });
    expect(httpClientMock.get).toHaveBeenCalledWith("/me/profile/", {
      headers: { Authorization: "Bearer access-token" }
    });
    expect(localStorage.getItem("mypet:access_token")).toBe("access-token");
    expect(localStorage.getItem("mypet:refresh_token")).toBe("refresh-token");
    expect(result).toEqual({
      id: 12,
      nome: "Ana",
      email: "ana@site.com",
      role: "ADMINISTRADOR",
      clienteId: 99,
      telefone: "11999999999",
      foto: "foto.png",
      access: "access-token",
      refresh: "refresh-token"
    });
  });

  it("solicitarRecuperacaoSenha envia email para endpoint correto", async () => {
    httpClientMock.post.mockResolvedValueOnce({ data: {} });

    await api.solicitarRecuperacaoSenha("cliente@site.com");

    expect(httpClientMock.post).toHaveBeenCalledWith("/auth/password-reset/", {
      email: "cliente@site.com"
    });
  });

  it("confirmarRedefinicaoSenha envia payload recebido", async () => {
    httpClientMock.post.mockResolvedValueOnce({ data: {} });

    const payload = {
      uid: "uid123",
      token: "token123",
      senha_nova: "nova-senha",
      confirmar_senha: "nova-senha"
    };

    await api.confirmarRedefinicaoSenha(payload);

    expect(httpClientMock.post).toHaveBeenCalledWith(
      "/auth/password-reset-confirm/",
      payload
    );
  });

  it("criarCliente envia payload esperado e mapeia resposta do backend", async () => {
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        id: 77,
        usuario: {
          nome: "Joao",
          email: "joao@site.com",
          telefone: "(11) 98765-4321",
          foto: "perfil.jpg"
        },
        endereco: "Rua A",
        ponto_referencia: "Praca",
        cpf: "12345678901",
        cidade: "Fortaleza",
        estado: "CE",
        cep: "60000000"
      }
    });

    const result = await api.criarCliente({
      nome: "Joao",
      email: "joao@site.com",
      telefone: "(11) 98765-4321",
      endereco: "Rua A",
      pontoReferencia: "Praca",
      senha: "12345678",
      confirmar_senha: "12345678",
      cpf: "12345678901",
      cidade: "Fortaleza",
      estado: "CE",
      cep: "60000000"
    });

    expect(httpClientMock.post).toHaveBeenCalledWith("/auth/register/", {
      nome: "Joao",
      email: "joao@site.com",
      telefone: "(11) 98765-4321",
      senha: "12345678",
      confirmar_senha: "12345678",
      cpf: "12345678901",
      endereco: "Rua A",
      ponto_referencia: "Praca",
      cidade: "Fortaleza",
      estado: "CE",
      cep: "60000000"
    });

    expect(result).toEqual({
      id: 77,
      nome: "Joao",
      email: "joao@site.com",
      telefone: "(11) 98765-4321",
      endereco: "Rua A",
      pontoReferencia: "Praca",
      cpf: "12345678901",
      cidade: "Fortaleza",
      estado: "CE",
      cep: "60000000",
      foto: "perfil.jpg"
    });
  });
});
