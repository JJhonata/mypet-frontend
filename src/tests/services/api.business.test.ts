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

describe("api pets, agendamentos e gestao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listarPets envia filtro de cliente e mapeia resposta paginada", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 10,
            cliente: { id: 5, nome: "Joao" },
            nome: "Rex",
            raca: "Vira-lata",
            idade: 3,
            peso: 12.5,
            especie: "CAO",
            especie_display: "Cao",
            porte: "MEDIO",
            porte_display: "Medio",
            observacoes: "Docil",
            foto: "rex.jpg"
          }
        ]
      }
    });

    const result = await api.listarPets(5);

    expect(httpClientMock.get).toHaveBeenCalledWith("/pets/", {
      params: { cliente: 5 }
    });
    expect(result).toEqual([
      {
        id: 10,
        clienteId: 5,
        nomeCliente: "Joao",
        nome: "Rex",
        raca: "Vira-lata",
        idade: 3,
        peso: 12.5,
        especie: "Cao",
        porte: "Medio",
        observacoes: "Docil",
        foto: "rex.jpg"
      }
    ]);
  });

  it("criarPet envia data_nascimento quando informado", async () => {
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        id: 20,
        cliente: 5,
        nome: "Mel",
        raca: "Poodle",
        idade: 2,
        peso: 6,
        especie: "CAO",
        observacoes: "Sem alergias"
      }
    });

    await api.criarPet(5, {
      nome: "Mel",
      raca: "Poodle",
      idade: 2,
      peso: 6,
      especie: "CAO",
      dataNascimento: "2024-03-01",
      observacoes: "Sem alergias"
    });

    expect(httpClientMock.post).toHaveBeenCalledWith("/pets/", {
      cliente: 5,
      nome: "Mel",
      especie: "CAO",
      raca: "Poodle",
      idade: 2,
      peso: 6,
      observacoes: "Sem alergias",
      data_nascimento: "2024-03-01"
    });
  });

  it("atualizarPet envia porte e data_nascimento quando informados", async () => {
    httpClientMock.patch.mockResolvedValueOnce({
      data: {
        id: 20,
        cliente: 5,
        nome: "Mel",
        raca: "Poodle",
        idade: 2,
        peso: 6,
        especie: "CAO",
        porte: "MEDIO",
        data_nascimento: "2024-03-01"
      }
    });

    await api.atualizarPet(20, {
      porte: "MEDIO",
      dataNascimento: "2024-03-01"
    });

    expect(httpClientMock.patch).toHaveBeenCalledWith("/pets/20/", {
      porte: "MEDIO",
      data_nascimento: "2024-03-01"
    });
  });

  it("listarHorariosDisponiveis retorna horarios e envia params esperados", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        horarios: [
          { hora: "09:00", data_hora: "2026-03-20T09:00:00", disponivel: true }
        ]
      }
    });

    const result = await api.listarHorariosDisponiveis("2026-03-20", 2, 9);

    expect(httpClientMock.get).toHaveBeenCalledWith("/agendamentos/disponibilidade/", {
      params: { data: "2026-03-20", servico_id: "2", pet_id: "9" }
    });
    expect(result).toEqual([
      { hora: "09:00", data_hora: "2026-03-20T09:00:00", disponivel: true }
    ]);
  });

  it("listarHorariosDisponiveis retorna array vazio quando endpoint falha", async () => {
    httpClientMock.get.mockRejectedValueOnce(new Error("falha"));

    const result = await api.listarHorariosDisponiveis("2026-03-20", 2);

    expect(result).toEqual([]);
  });

  it("listarFormasPagamento mapeia lista paginada e aplica fallback em erro", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        results: [
          { id: 1, nome: "Dinheiro", tipo: "DINHEIRO" },
          { id: 2, nome: "PIX", tipo: "PIX" }
        ]
      }
    });

    const sucesso = await api.listarFormasPagamento();

    expect(sucesso).toEqual([
      { id: 1, nome: "Dinheiro", tipo: "DINHEIRO" },
      { id: 2, nome: "PIX", tipo: "PIX" }
    ]);

    httpClientMock.get.mockRejectedValueOnce(new Error("sem permissao"));

    const fallback = await api.listarFormasPagamento();

    expect(fallback).toEqual([
      { id: 1, nome: "Dinheiro", tipo: "DINHEIRO" },
      { id: 2, nome: "PIX", tipo: "PIX" },
      { id: 3, nome: "Cartão", tipo: "CARTAO" }
    ]);
  });

  it("criarAgendamento envia payload esperado e mapeia retorno", async () => {
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        id: 300,
        cliente: { id: 5, nome: "Joao" },
        pet: { id: 20, cliente: 5, nome: "Mel", raca: "Poodle", idade: 2, peso: 6, especie: "CAO" },
        servico: { id: 2, nome: "Banho", preco: 80, duracao_minutos: 60 },
        data_hora: "2026-03-20T10:00:00",
        status: "AGENDADO",
        observacoes: "Cuidado com orelha",
        status_pagamento: "PENDENTE",
        forma_pagamento: { tipo: "PIX" },
        valor_pago: 0
      }
    });

    const result = await api.criarAgendamento(5, {
      petId: 20,
      servicoId: 2,
      dataHora: "2026-03-20T10:00:00",
      formaPagamentoId: 2,
      observacoes: "Cuidado com orelha"
    });

    expect(httpClientMock.post).toHaveBeenCalledWith("/agendamentos/", {
      cliente_id: 5,
      pet: 20,
      servico: 2,
      data_hora: "2026-03-20T10:00:00",
      forma_pagamento: 2,
      observacoes: "Cuidado com orelha"
    });

    expect(result.id).toBe(300);
    expect(result.clienteId).toBe(5);
    expect(result.petId).toBe(20);
    expect(result.tipoServico).toBe("Banho");
    expect(result.formaPagamento).toBe("PIX");
  });

  it("obterAgendamento retorna null quando a requisicao falha", async () => {
    httpClientMock.get.mockRejectedValueOnce(new Error("404"));

    const result = await api.obterAgendamento(999);

    expect(result).toBeNull();
  });

  it("listarHistorico mapeia resposta paginada", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            agendamento: 300,
            pet: 20,
            data_atendimento: "2026-03-20T10:00:00",
            tipo_servico: "Banho",
            observacoes: "Concluido",
            valor_pago: "80.00",
            nome_pet: "Mel",
            nome_cliente: "Joao",
            nome_funcionario: "Carlos",
            status: "CONCLUIDO"
          }
        ]
      }
    });

    const result = await api.listarHistorico(5);

    expect(httpClientMock.get).toHaveBeenCalledWith("/historico/");
    expect(result).toEqual([
      {
        id: 1,
        agendamentoId: 300,
        petId: 20,
        dataAtendimento: "2026-03-20T10:00:00",
        tipoServico: "Banho",
        observacoes: "Concluido",
        valorPago: 80,
        nomePet: "Mel",
        nomeCliente: "Joao",
        nomeFuncionario: "Carlos",
        status: "CONCLUIDO"
      }
    ]);
  });

  it("obterDashboardAdmin usa contadores de clientes e pets quando disponiveis", async () => {
    httpClientMock.get
      .mockResolvedValueOnce({
        data: {
          total_agendamentos_mes: 15,
          faturamento_mes: 1250,
          novos_clientes_mes: 3,
          servicos_top: [{ tipo_servico: "Banho", quantidade: 10 }],
          agendamentos_hoje: 2
        }
      })
      .mockResolvedValueOnce({ data: { count: 40, results: [] } })
      .mockResolvedValueOnce({ data: { count: 80, results: [] } });

    const result = await api.obterDashboardAdmin();

    expect(httpClientMock.get).toHaveBeenNthCalledWith(1, "/admin/dashboard/");
    expect(httpClientMock.get).toHaveBeenNthCalledWith(2, "/clientes/", {
      params: { page_size: 1 }
    });
    expect(httpClientMock.get).toHaveBeenNthCalledWith(3, "/pets/", {
      params: { page_size: 1 }
    });
    expect(result.total_clientes).toBe(40);
    expect(result.total_pets).toBe(80);
  });

  it("obterDashboardAdmin mantem fallback quando consultas auxiliares falham", async () => {
    httpClientMock.get
      .mockResolvedValueOnce({
        data: {
          total_agendamentos_mes: 8,
          faturamento_mes: 700,
          novos_clientes_mes: 1,
          servicos_top: [],
          agendamentos_hoje: 1,
          total_clientes: 11,
          total_pets: 22
        }
      })
      .mockRejectedValueOnce(new Error("erro clientes"))
      .mockRejectedValueOnce(new Error("erro pets"));

    const result = await api.obterDashboardAdmin();

    expect(result.total_clientes).toBe(11);
    expect(result.total_pets).toBe(22);
  });

  it("listarFuncionarios retorna lista paginada", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            usuario: { id: 10, nome: "Carlos", email: "c@site.com", role: "FUNCIONARIO" },
            cargo: "BANHISTA",
            cargo_display: "Banhista",
            ativo: true
          }
        ]
      }
    });

    const result = await api.listarFuncionarios();

    expect(httpClientMock.get).toHaveBeenCalledWith("/funcionarios/");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("obterFuncionario retorna undefined quando endpoint falha", async () => {
    httpClientMock.get.mockRejectedValueOnce(new Error("404"));

    const result = await api.obterFuncionario(999);

    expect(result).toBeUndefined();
  });

  it("criarFuncionario envia payload flatten correto", async () => {
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        id: 2,
        usuario: { id: 11, nome: "Bruna", email: "b@site.com", role: "FUNCIONARIO" },
        cargo: "TOSADOR",
        cargo_display: "Tosador",
        ativo: true
      }
    });

    const result = await api.criarFuncionario({
      usuario: {
        nome: "Bruna",
        email: "b@site.com",
        telefone: "11988887777",
        senha: "12345678",
        confirmar_senha: "12345678"
      },
      cargo: "TOSADOR"
    });

    expect(httpClientMock.post).toHaveBeenCalledWith("/funcionarios/", {
      nome: "Bruna",
      email: "b@site.com",
      telefone: "11988887777",
      senha: "12345678",
      confirmar_senha: "12345678",
      cargo: "TOSADOR"
    });
    expect(result.id).toBe(2);
  });

  it("atualizarFuncionario envia campos permitidos", async () => {
    httpClientMock.patch.mockResolvedValueOnce({
      data: {
        id: 2,
        usuario: { id: 11, nome: "Bruna", email: "novo@site.com", role: "FUNCIONARIO" },
        cargo: "ATENDENTE",
        cargo_display: "Atendente",
        ativo: true
      }
    });

    await api.atualizarFuncionario(2, {
      cargo: "ATENDENTE",
      usuario: { nome: "Bruna", email: "novo@site.com", telefone: "11977776666" }
    });

    expect(httpClientMock.patch).toHaveBeenCalledWith("/funcionarios/2/", {
      cargo: "ATENDENTE",
      nome: "Bruna",
      email: "novo@site.com",
      telefone: "11977776666"
    });
  });

  it("gerencia horarios de trabalho e exclusoes de funcionarios", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 9,
            funcionario: 2,
            dia_semana: 1,
            dia_semana_display: "Segunda",
            hora_inicio: "08:00",
            hora_fim: "17:00",
            ativo: true
          }
        ]
      }
    });
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        id: 10,
        funcionario: 2,
        dia_semana: 2,
        dia_semana_display: "Terca",
        hora_inicio: "08:00",
        hora_fim: "12:00",
        ativo: true
      }
    });
    httpClientMock.delete.mockResolvedValue({ data: {} });

    const horarios = await api.listarHorariosTrabalhoFuncionario(2);
    const novo = await api.criarHorarioTrabalho({
      funcionario: 2,
      dia_semana: 2,
      hora_inicio: "08:00",
      hora_fim: "12:00"
    });
    await api.excluirHorarioTrabalho(10);
    await api.excluirFuncionario(2);

    expect(httpClientMock.get).toHaveBeenCalledWith("/funcionarios/horarios/", {
      params: { funcionario: 2 }
    });
    expect(httpClientMock.post).toHaveBeenCalledWith("/funcionarios/horarios/", {
      funcionario: 2,
      dia_semana: 2,
      hora_inicio: "08:00",
      hora_fim: "12:00"
    });
    expect(httpClientMock.delete).toHaveBeenCalledWith("/funcionarios/horarios/10/");
    expect(httpClientMock.delete).toHaveBeenCalledWith("/funcionarios/2/");
    expect(horarios).toHaveLength(1);
    expect(novo.id).toBe(10);
  });

  it("obterPerfil mapeia grupos para role do frontend", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        id: 55,
        nome: "Marina",
        email: "marina@site.com",
        groups: ["SUPER_USUARIO"],
        telefone: "11911112222"
      }
    });

    const result = await api.obterPerfil();

    expect(httpClientMock.get).toHaveBeenCalledWith("/me/profile/");
    expect(result).toEqual({
      id: 55,
      nome: "Marina",
      email: "marina@site.com",
      role: "SUPER_USUARIO",
      telefone: "11911112222"
    });
  });

  it("atualizarPerfil envia payload para endpoint correto", async () => {
    httpClientMock.patch.mockResolvedValueOnce({ data: {} });

    await api.atualizarPerfil({
      nome: "Marina Souza",
      telefone: "11933334444"
    });

    expect(httpClientMock.patch).toHaveBeenCalledWith("/me/profile/", {
      nome: "Marina Souza",
      telefone: "11933334444"
    });
  });

  it("alterarSenha envia payload completo para endpoint de troca", async () => {
    httpClientMock.post.mockResolvedValueOnce({ data: {} });

    await api.alterarSenha({
      senha_atual: "senha-antiga",
      senha_nova: "senha-nova-segura",
      confirmar_senha_nova: "senha-nova-segura"
    });

    expect(httpClientMock.post).toHaveBeenCalledWith("/me/change-password/", {
      senha_atual: "senha-antiga",
      senha_nova: "senha-nova-segura",
      confirmar_senha_nova: "senha-nova-segura"
    });
  });

  it("listarTodosClientes e obterCliente mapeiam payload de cliente", async () => {
    httpClientMock.get
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              id: 21,
              usuario: {
                nome: "Paulo",
                email: "paulo@site.com",
                telefone: "11955556666",
                foto: "paulo.jpg"
              },
              endereco: "Rua B",
              ponto_referencia: "Escola",
              cpf: "12312312312",
              cidade: "Fortaleza",
              estado: "CE",
              cep: "60000000"
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: 22,
          usuario: {
            nome: "Lia",
            email: "lia@site.com",
            telefone: "11911112222"
          },
          endereco: "Rua C"
        }
      });

    const todos = await api.listarTodosClientes();
    const um = await api.obterCliente(22);

    expect(httpClientMock.get).toHaveBeenNthCalledWith(1, "/clientes/");
    expect(httpClientMock.get).toHaveBeenNthCalledWith(2, "/clientes/22/");
    expect(todos[0].nome).toBe("Paulo");
    expect(um?.nome).toBe("Lia");
  });

  it("obterCliente retorna undefined quando endpoint falha", async () => {
    httpClientMock.get.mockRejectedValueOnce(new Error("404"));

    const result = await api.obterCliente(999);

    expect(result).toBeUndefined();
  });

  it("atualizarCliente monta payload parcial corretamente", async () => {
    httpClientMock.patch.mockResolvedValueOnce({
      data: {
        id: 21,
        usuario: {
          nome: "Paulo Atualizado",
          email: "paulo@site.com",
          telefone: "11900001111"
        },
        endereco: "Rua Nova",
        ponto_referencia: "Praca"
      }
    });

    const result = await api.atualizarCliente(21, {
      nome: "Paulo Atualizado",
      telefone: "11900001111",
      endereco: "Rua Nova",
      pontoReferencia: "Praca"
    });

    expect(httpClientMock.patch).toHaveBeenCalledWith("/clientes/21/", {
      nome: "Paulo Atualizado",
      telefone: "11900001111",
      endereco: "Rua Nova",
      ponto_referencia: "Praca"
    });
    expect(result.nome).toBe("Paulo Atualizado");
  });

  it("obterPet e atualizarPet cobrem sucesso e fallback de erro", async () => {
    httpClientMock.get
      .mockResolvedValueOnce({
        data: {
          id: 30,
          cliente: 21,
          nome: "Thor",
          raca: "Labrador",
          idade: 4,
          peso: 22,
          especie: "CAO"
        }
      })
      .mockRejectedValueOnce(new Error("404"));
    httpClientMock.patch.mockResolvedValueOnce({
      data: {
        id: 30,
        cliente: 21,
        nome: "Thor",
        raca: "Labrador",
        idade: 5,
        peso: 23,
        especie: "CAO",
        observacoes: "Atualizado"
      }
    });

    const sucesso = await api.obterPet(30);
    const fallback = await api.obterPet(999);
    const atualizado = await api.atualizarPet(30, {
      idade: 5,
      peso: 23,
      observacoes: "Atualizado"
    });

    expect(httpClientMock.patch).toHaveBeenCalledWith("/pets/30/", {
      idade: 5,
      peso: 23,
      observacoes: "Atualizado"
    });
    expect(sucesso?.id).toBe(30);
    expect(fallback).toBeUndefined();
    expect(atualizado.idade).toBe(5);
  });

  it("obterPetChoices usa api no sucesso e fallback local em erro", async () => {
    httpClientMock.get
      .mockResolvedValueOnce({
        data: {
          especies: [{ value: "CAO", label: "Cao" }],
          portes: [{ value: "MEDIO", label: "Medio" }]
        }
      })
      .mockRejectedValueOnce(new Error("erro"));

    const sucesso = await api.obterPetChoices();
    const fallback = await api.obterPetChoices();

    expect(httpClientMock.get).toHaveBeenNthCalledWith(1, "/pets/choices/");
    expect(httpClientMock.get).toHaveBeenNthCalledWith(2, "/pets/choices/");
    expect(sucesso.especies[0].value).toBe("CAO");
    expect(fallback.especies.length).toBeGreaterThan(0);
    expect(fallback.portes.length).toBeGreaterThan(0);
  });

  it("listarAgendamentos e listarTodosAgendamentos mapeiam retorno", async () => {
    const resposta = {
      data: {
        results: [
          {
            id: 400,
            cliente: 21,
            pet: 30,
            servico: { id: 2, nome: "Banho", preco: 80, duracao_minutos: 60 },
            data_hora: "2026-03-22T11:00:00",
            status: "AGENDADO"
          }
        ]
      }
    };

    httpClientMock.get.mockResolvedValueOnce(resposta).mockResolvedValueOnce(resposta);

    const cliente = await api.listarAgendamentos(21);
    const todos = await api.listarTodosAgendamentos();

    expect(httpClientMock.get).toHaveBeenNthCalledWith(1, "/agendamentos/");
    expect(httpClientMock.get).toHaveBeenNthCalledWith(2, "/agendamentos/");
    expect(cliente[0].id).toBe(400);
    expect(todos[0].tipoServico).toBe("Banho");
  });

  it("atualizar/iniciar/cancelar/reagendar/concluir agendamento usam endpoints corretos", async () => {
    httpClientMock.patch.mockResolvedValueOnce({
      data: {
        id: 400,
        cliente: 21,
        pet: 30,
        data_hora: "2026-03-22T12:00:00",
        status: "AGENDADO"
      }
    });
    httpClientMock.post
      .mockResolvedValueOnce({
        data: {
          id: 400,
          cliente: 21,
          pet: 30,
          data_hora: "2026-03-22T12:00:00",
          status: "EM_ANDAMENTO"
        }
      })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({
        data: {
          id: 400,
          cliente: 21,
          pet: 30,
          data_hora: "2026-03-22T12:00:00",
          status: "CONCLUIDO"
        }
      });

    await api.atualizarAgendamento(400, {
      dataHora: "2026-03-22T12:00:00",
      observacoes: "Atualizado",
      servico: 3,
      funcionario: 9
    });
    const iniciado = await api.iniciarAgendamento(400);
    await api.cancelarAgendamento(400, "Imprevisto");
    await api.reagendarAgendamento(400, {
      novaDataHora: "2026-03-25T09:00:00",
      motivo: "Novo horario",
      formaPagamentoId: 2
    });
    const concluido = await api.concluirAgendamento(400, {
      formaPagamentoId: 2,
      valorPago: 90,
      observacoes: "Finalizado"
    });

    expect(httpClientMock.patch).toHaveBeenCalledWith("/agendamentos/400/", {
      data_hora: "2026-03-22T12:00:00",
      observacoes: "Atualizado",
      servico: 3,
      funcionario: 9
    });
    expect(httpClientMock.post).toHaveBeenCalledWith("/agendamentos/400/iniciar/");
    expect(httpClientMock.post).toHaveBeenCalledWith("/agendamentos/400/cancelar/", {
      motivo: "Imprevisto"
    });
    expect(httpClientMock.post).toHaveBeenCalledWith("/agendamentos/400/reagendar/", {
      data_hora: "2026-03-25T09:00:00",
      forma_pagamento_id: 2
    });
    expect(httpClientMock.post).toHaveBeenCalledWith("/agendamentos/400/concluir/", {
      valor_pago: 90,
      observacoes: "Finalizado"
    });
    expect(iniciado.status).toBe("EM_ANDAMENTO");
    expect(concluido.status).toBe("CONCLUIDO");
  });

  it("listarServicos e gerarRelatorio usam endpoints corretos", async () => {
    httpClientMock.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 3,
            nome: "Tosa",
            descricao: "Tosa completa",
            preco: 100,
            duracao_minutos: 90,
            ativo: true
          }
        ]
      }
    });
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        sucesso: true,
        arquivo_url: "/media/relatorio.pdf"
      }
    });

    const servicos = await api.listarServicos();
    const relatorio = await api.gerarRelatorio({
      tipo: "financeiro",
      formato: "pdf",
      data_inicio: "2026-03-01",
      data_fim: "2026-03-31"
    });

    expect(httpClientMock.get).toHaveBeenCalledWith("/servicos/");
    expect(httpClientMock.post).toHaveBeenCalledWith("/admin/relatorios/gerar/", {
      tipo: "financeiro",
      formato: "pdf",
      data_inicio: "2026-03-01",
      data_fim: "2026-03-31"
    });
    expect(servicos[0].nome).toBe("Tosa");
    expect(relatorio.sucesso).toBe(true);
  });
});
