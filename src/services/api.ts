// Camada de API real — chamadas HTTP ao backend Django REST (porta 8000).
// Substitui completamente a versão mockada anterior.

import httpClient from './httpClient';

// ─── Tipos ──────────────────────────────────────────────

export type UserRole = "CLIENTE" | "SUPER_USUARIO" | "ADMINISTRADOR" | "FUNCIONARIO";

export type Cliente = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  pontoReferencia?: string;
  cpf?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  foto?: string;
};

export type Pet = {
  id: number;
  clienteId: number;
  nomeCliente?: string;
  nome: string;
  raca: string;
  idade: number;
  peso: number;
  especie: string;
  dataNascimento?: string;
  porte?: string;
  observacoes?: string;
  foto?: string;
};

export type AgendamentoStatus = "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

export type MomentoPagamento = "ANTES" | "DEPOIS";

export type FormaPagamento = "DINHEIRO" | "PIX" | "CARTAO";

export type StatusPagamento = "PENDENTE" | "PAGO" | "FALHOU";

export type Agendamento = {
  id: number;
  clienteId: number;
  petId: number;
  tipoServico: string;
  dataHora: string;
  status: AgendamentoStatus;
  pagamentoMomento?: MomentoPagamento;
  statusPagamento?: StatusPagamento;
  formaPagamento?: FormaPagamento;
  valorPago?: number;
  pagoEm?: string;
  codigoAutorizacao?: string;
  confirmadoPor?: string;
  observacoes?: string;
  pet?: Pet;
  nomePet?: string;
  nomeCliente?: string;
  servico?: { id: number; tipo: string; tipo_display: string; preco: number; duracao_minutos: number };
};

export type FormaPagamentoOption = {
  id: number;
  nome: string;
  tipo: FormaPagamento;
};

export type HistoricoItem = {
  id: number;
  agendamentoId: number;
  petId: number;
  dataAtendimento: string;
  tipoServico: string;
  observacoes?: string;
  valorPago: number;
  nomePet?: string;
  nomeCliente?: string;
  nomeFuncionario?: string;
  status?: string;
};

export type HistoricoDetalhe = HistoricoItem & {
  formaPagamento?: string;
  dataCriacao?: string;
};

export type AuthenticatedUser = {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  clienteId?: number;
  telefone?: string;
  foto?: string;
};

export type Servico = {
  id: number;
  tipo: string;
  tipo_display: string;
  descricao: string;
  preco: number;
  duracao_minutos: number;
  duracao_medio_grande?: number | null;
  ativo: boolean;
};

export type Funcionario = {
  id: number;
  usuario: AuthenticatedUser;
  cargo: string;
  cargo_display: string;
  ativo: boolean;
};

export type CargoFuncionario = {
  id: number;
  valor: string;
  nome_display: string;
  descricao?: string;
  ativo?: boolean;
};

export type HorarioTrabalho = {
  id: number;
  funcionario: number; // ID do funcionario
  dia_semana: number;
  dia_semana_display: string;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
};

// ─── Helpers ────────────────────────────────────────────

/**
 * Extrai os resultados de uma resposta paginada do DRF.
 * Se a resposta vier como array direto (sem paginação), retorna como está.
 */
function unwrapPaginated<T>(data: { results: T[] } | T[]): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

/**
 * Mapeia os groups do backend para a role do frontend.
 */
export function mapGroupsToRole(groups: string[]): UserRole {
  if (groups.includes('SUPER_USUARIO')) return 'SUPER_USUARIO';
  if (groups.includes('ADMINISTRADOR')) return 'ADMINISTRADOR';
  if (groups.includes('FUNCIONARIO')) return 'FUNCIONARIO';
  return 'CLIENTE';
}

/**
 * Converte os dados do backend de cliente (nested) para o formato flat do frontend.
 */
function mapClienteFromBackend(data: any): Cliente {
  return {
    id: data.id,
    nome: data.usuario?.nome ?? data.nome ?? '',
    email: data.usuario?.email ?? data.email ?? '',
    telefone: data.usuario?.telefone ?? data.telefone ?? '',
    endereco: data.endereco ?? '',
    pontoReferencia: data.ponto_referencia ?? '',
    cpf: data.cpf,
    cidade: data.cidade,
    estado: data.estado,
    cep: data.cep,
    foto: data.usuario?.foto ?? data.foto,
  };
}

/**
 * Converte os dados do backend de pet para o formato do frontend.
 */
function mapPetFromBackend(data: any): Pet {
  return {
    id: data.id,
    clienteId: data.cliente?.id ?? data.cliente ?? 0,
    nomeCliente: data.nome_cliente ?? data.cliente?.nome ?? undefined,
    nome: data.nome ?? '',
    raca: data.raca ?? '',
    idade: data.idade ?? 0,
    peso: data.peso ?? 0,
    especie: data.especie_display ?? data.especie ?? '',
    porte: data.porte_display ?? data.porte,
    observacoes: data.observacoes,
    foto: data.foto,
  };
}

/**
 * Converte os dados do backend de agendamento para o formato do frontend.
 */
function mapAgendamentoFromBackend(data: any): Agendamento {
  return {
    id: data.id,
    clienteId: data.cliente?.id ?? data.cliente ?? 0,
    petId: data.pet?.id ?? data.pet ?? 0,
    tipoServico: data.servico?.tipo_display ?? data.servico?.tipo ?? data.servico_tipo ?? data.tipo_servico ?? '',
    dataHora: data.data_hora ?? '',
    status: data.status ?? 'AGENDADO',
    observacoes: data.observacoes,
    pet: data.pet && typeof data.pet === 'object' ? mapPetFromBackend(data.pet) : undefined,
    nomePet: data.pet?.nome ?? data.pet_nome ?? data.nome_pet,
    nomeCliente: data.cliente_nome ?? data.nome_cliente ?? data.cliente?.nome,
    servico: typeof data.servico === 'object' ? data.servico : undefined,
    statusPagamento: data.status_pagamento,
    formaPagamento: data.forma_pagamento?.tipo ?? data.forma_pagamento,
    valorPago: data.valor_pago != null ? Number(data.valor_pago) : undefined,
  };
}

/**
 * Converte os dados do backend de histórico para o formato do frontend.
 */
function mapHistoricoFromBackend(data: any): HistoricoItem {
  return {
    id: data.id,
    agendamentoId: data.agendamento ?? 0,
    petId: data.pet ?? 0,
    dataAtendimento: data.data_atendimento ?? '',
    tipoServico: data.tipo_servico ?? '',
    observacoes: data.observacoes,
    valorPago: Number(data.valor_pago) || 0,
    nomePet: data.nome_pet,
    nomeCliente: data.nome_cliente,
    nomeFuncionario: data.nome_funcionario,
    status: data.status,
  };
}

// ─── API ────────────────────────────────────────────────

export const api = {
  // ─── Autenticação ──────────────────────────────────

  /**
   * Login via JWT. Retorna access/refresh tokens e dados do usuário.
   */
  async login(email: string, senha: string): Promise<AuthenticatedUser & { access: string; refresh: string }> {
    // 1. Obter tokens JWT
    const tokenRes = await httpClient.post('/auth/login/', { email, password: senha });
    const { access, refresh } = tokenRes.data;

    // Salvar tokens
    localStorage.setItem('mypet:access_token', access);
    localStorage.setItem('mypet:refresh_token', refresh);

    // 2. Buscar perfil do usuário com o token
    const profileRes = await httpClient.get('/me/profile/', {
      headers: { Authorization: `Bearer ${access}` },
    });
    const profile = profileRes.data;

    const role = mapGroupsToRole(profile.groups ?? []);

    // cliente_id agora vem direto do /me/profile/ (via UsuarioSerializer)
    const clienteId: number | undefined = profile.cliente_id ?? undefined;

    const user: AuthenticatedUser = {
      id: profile.id,
      nome: profile.nome,
      email: profile.email,
      role,
      clienteId,
      telefone: profile.telefone,
      foto: profile.foto,
    };

    return { ...user, access, refresh };
  },

  /**
   * Solicita envio de email de recuperação de senha.
   */
  async solicitarRecuperacaoSenha(email: string): Promise<void> {
    await httpClient.post('/auth/password-reset/', { email });
  },

  /**
   * Confirma a redefinição de senha usando uid + token recebidos por email.
   */
  async confirmarRedefinicaoSenha(dados: {
    uid: string;
    token: string;
    senha_nova: string;
    confirmar_senha: string;
  }): Promise<void> {
    await httpClient.post('/auth/password-reset-confirm/', dados);
  },


  // ─── Clientes ──────────────────────────────────────

  async uploadFotoUsuario(file: File): Promise<{ message: string; fotoUrl?: string }> {
    const formData = new FormData();
    formData.append('foto', file);
    const res = await httpClient.post('/me/profile/photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      message: res.data.message,
      fotoUrl: res.data.usuario?.foto,
    };
  },

  async uploadFotoPet(petId: number, file: File): Promise<{ message: string; fotoUrl?: string }> {
    const formData = new FormData();
    formData.append('foto', file);
    const res = await httpClient.post(`/pets/${petId}/foto/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      message: res.data.message,
      fotoUrl: res.data.foto_url,
    };
  },

  async listarTodosClientes(): Promise<Cliente[]> {
    const res = await httpClient.get('/clientes/');
    return unwrapPaginated(res.data).map(mapClienteFromBackend);
  },

  async obterCliente(id: number): Promise<Cliente | undefined> {
    try {
      const res = await httpClient.get(`/clientes/${id}/`);
      return mapClienteFromBackend(res.data);
    } catch {
      return undefined;
    }
  },

  async criarClienteAdmin(
    dados: Omit<Cliente, "id"> & { senha?: string; confirmar_senha?: string }
  ): Promise<Cliente> {
    const res = await httpClient.post('/clientes/', {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      cpf: dados.cpf ?? '',
      endereco: dados.endereco,
      ponto_referencia: dados.pontoReferencia ?? '',
      cidade: dados.cidade ?? '',
      estado: dados.estado ?? '',
      cep: dados.cep ?? '',
      senha: dados.senha,
      confirmar_senha: dados.confirmar_senha ?? dados.senha,
    });
    return mapClienteFromBackend(res.data);
  },

  async atualizarCliente(id: number, dados: Partial<Cliente>): Promise<Cliente> {
    const payload: any = {};
    if (dados.nome) payload.nome = dados.nome;
    if (dados.telefone) payload.telefone = dados.telefone;
    if (dados.endereco) payload.endereco = dados.endereco;
    if (dados.pontoReferencia !== undefined) payload.ponto_referencia = dados.pontoReferencia;
    if (dados.cidade) payload.cidade = dados.cidade;
    if (dados.estado) payload.estado = dados.estado;
    if (dados.cep) payload.cep = dados.cep;

    const res = await httpClient.patch(`/clientes/${id}/`, payload);
    return mapClienteFromBackend(res.data);
  },

  async excluirCliente(id: number): Promise<void> {
    await httpClient.delete(`/clientes/${id}/`);
  },

  /**
   * Registro público de novo cliente (via auth/register/).
   */
  async criarCliente(
    dados: {
      nome: string;
      email: string;
      telefone: string;
      endereco: string;
      pontoReferencia?: string;
      senha: string;
      confirmar_senha: string;
      cpf: string;
      cidade: string;
      estado: string;
      cep: string;
    }
  ): Promise<Cliente> {
    const res = await httpClient.post('/auth/register/', {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      senha: dados.senha,
      confirmar_senha: dados.confirmar_senha,
      cpf: dados.cpf,
      endereco: dados.endereco,
      ponto_referencia: dados.pontoReferencia ?? '',
      cidade: dados.cidade,
      estado: dados.estado,
      cep: dados.cep,
    });
    return mapClienteFromBackend(res.data);
  },

  // ─── Pets ──────────────────────────────────────────

  async listarPets(clienteId: number): Promise<Pet[]> {
    const res = await httpClient.get('/pets/', {
      params: { cliente: clienteId },
    });
    return unwrapPaginated(res.data).map(mapPetFromBackend);
  },

  async listarTodosPets(): Promise<Pet[]> {
    const res = await httpClient.get('/pets/');
    return unwrapPaginated(res.data).map(mapPetFromBackend);
  },

  async obterPet(id: number): Promise<Pet | undefined> {
    try {
      const res = await httpClient.get(`/pets/${id}/`);
      return mapPetFromBackend(res.data);
    } catch {
      return undefined;
    }
  },

  async atualizarPet(id: number, dados: Partial<Pet>): Promise<Pet> {
    const payload: any = {};
    if (dados.nome !== undefined) payload.nome = dados.nome;
    if (dados.raca !== undefined) payload.raca = dados.raca;
    if (dados.idade !== undefined) payload.idade = dados.idade;
    if (dados.peso !== undefined) payload.peso = dados.peso;
    if (dados.porte !== undefined) payload.porte = dados.porte;
    if (dados.dataNascimento !== undefined) payload.data_nascimento = dados.dataNascimento;
    if (dados.observacoes !== undefined) payload.observacoes = dados.observacoes;

    const res = await httpClient.patch(`/pets/${id}/`, payload);
    return mapPetFromBackend(res.data);
  },

  async criarPet(
    clienteId: number,
    payload: Omit<Pet, "id" | "clienteId">
  ): Promise<Pet> {
    const res = await httpClient.post('/pets/', {
      cliente: clienteId,
      nome: payload.nome,
      especie: payload.especie,
      raca: payload.raca,
      idade: payload.idade,
      peso: payload.peso,
      observacoes: payload.observacoes,
      // #7: enviar data_nascimento se disponível
      ...(payload.dataNascimento ? { data_nascimento: payload.dataNascimento } : {}),
    });
    return mapPetFromBackend(res.data);
  },

  // ─── Pet Choices (espécie e porte via API) ─────────

  async obterPetChoices(): Promise<{ especies: { value: string; label: string }[]; portes: { value: string; label: string }[] }> {
    // Tenta buscar da API; se falhar, retorna valores hardcoded como fallback
    try {
      const res = await httpClient.get('/pets/choices/');
      return res.data;
    } catch {
      return {
        especies: [
          { value: 'CAO', label: 'Cão' },
          { value: 'GATO', label: 'Gato' },
          { value: 'PASSARO', label: 'Pássaro' },
          { value: 'COELHO', label: 'Coelho' },
          { value: 'OUTROS', label: 'Outros' },
        ],
        portes: [
          { value: 'MINI', label: 'Mini (até 5kg)' },
          { value: 'PEQUENO', label: 'Pequeno (5-10kg)' },
          { value: 'MEDIO', label: 'Médio (10-20kg)' },
          { value: 'GRANDE', label: 'Grande (20-40kg)' },
          { value: 'GIGANTE', label: 'Gigante (acima de 40kg)' },
        ],
      };
    }
  },

  // ─── Agendamentos ─────────────────────────────────

  async listarAgendamentos(clienteId: number): Promise<Agendamento[]> {
    // O backend filtra automaticamente pelo tipo de usuário
    const res = await httpClient.get('/agendamentos/');
    return unwrapPaginated(res.data).map(mapAgendamentoFromBackend);
  },

  async listarTodosAgendamentos(): Promise<Agendamento[]> {
    const res = await httpClient.get('/agendamentos/');
    return unwrapPaginated(res.data).map(mapAgendamentoFromBackend);
  },

  async obterAgendamento(id: number): Promise<Agendamento | null> {
    try {
      const res = await httpClient.get(`/agendamentos/${id}/`);
      return mapAgendamentoFromBackend(res.data);
    } catch {
      return null;
    }
  },

  async criarAgendamento(
    clienteId: number,
    payload: { petId: number; tipoServico?: string; dataHora: string; servicoId?: number; formaPagamentoId?: number; observacoes?: string }
  ): Promise<Agendamento> {
    const res = await httpClient.post('/agendamentos/', {
      cliente_id: clienteId,
      pet: payload.petId,
      servico: payload.servicoId,
      data_hora: payload.dataHora,
      forma_pagamento: payload.formaPagamentoId,
      observacoes: payload.observacoes,
    });
    return mapAgendamentoFromBackend(res.data);
  },

  async atualizarAgendamento(
    id: number,
    dados: Partial<{ dataHora: string; observacoes: string; servico: number; funcionario: number }>
  ): Promise<Agendamento> {
    const payload: any = {};
    if (dados.dataHora) payload.data_hora = dados.dataHora;
    if (dados.observacoes !== undefined) payload.observacoes = dados.observacoes;
    if (dados.servico) payload.servico = dados.servico;
    if (dados.funcionario) payload.funcionario = dados.funcionario;

    const res = await httpClient.patch(`/agendamentos/${id}/`, payload);
    return mapAgendamentoFromBackend(res.data);
  },

  async iniciarAgendamento(id: number): Promise<Agendamento> {
    const res = await httpClient.post(`/agendamentos/${id}/iniciar/`);
    return mapAgendamentoFromBackend(res.data);
  },

  async cancelarAgendamento(id: number, motivo: string): Promise<void> {
    await httpClient.post(`/agendamentos/${id}/cancelar/`, { motivo });
  },

  async reagendarAgendamento(id: number, dados: { novaDataHora: string; motivo: string; formaPagamentoId?: number }): Promise<Agendamento> {
    const res = await httpClient.post(`/agendamentos/${id}/reagendar/`, {
      data_hora: dados.novaDataHora,
      forma_pagamento_id: dados.formaPagamentoId,
    });
    return mapAgendamentoFromBackend(res.data);
  },

  async concluirAgendamento(
    id: number,
    dados: {
      formaPagamentoId: number;
      valorPago: number;
      observacoes?: string;
    }
  ): Promise<Agendamento> {
    const res = await httpClient.post(`/agendamentos/${id}/concluir/`, {
      valor_pago: dados.valorPago,
      observacoes: dados.observacoes,
    });
    return mapAgendamentoFromBackend(res.data);
  },

  // ─── Horários Disponíveis ─────────────────────────

  async listarHorariosDisponiveis(
    data: string,
    servicoId?: number | string,
    petId?: number | string
  ): Promise<{ hora: string; data_hora: string; disponivel: boolean }[]> {
    try {
      // #1: backend exige servico_id obrigatório além de data
      const params: Record<string, string> = { data };
      if (servicoId) params['servico_id'] = String(servicoId);
      if (petId) params['pet_id'] = String(petId);

      const res = await httpClient.get('/agendamentos/disponibilidade/', { params });
      // Backend retorna { data, servico_id, horarios: [{hora, data_hora, disponivel}] }
      const horarios: { hora: string; data_hora: string; disponivel: boolean }[] = res.data.horarios ?? res.data ?? [];
      return horarios;
    } catch {
      return [];
    }
  },

  // ─── Formas de Pagamento ──────────────────────────

  async listarFormasPagamento(): Promise<FormaPagamentoOption[]> {
    try {
      // #6: usar /pagamentos/formas/ (IsAuthenticated) em vez de /admin/formas-pagamento/ (IsAdministrador)
      const res = await httpClient.get('/pagamentos/formas/');
      const items = unwrapPaginated(res.data);
      return items.map((item: any) => ({
        id: item.id,
        nome: item.nome,
        tipo: item.tipo,
      }));
    } catch {
      // Fallback para valores padrão se a rota retornar erro
      return [
        { id: 1, nome: 'Dinheiro', tipo: 'DINHEIRO' as FormaPagamento },
        { id: 2, nome: 'PIX', tipo: 'PIX' as FormaPagamento },
        { id: 3, nome: 'Cartão', tipo: 'CARTAO' as FormaPagamento },
      ];
    }
  },

  // ─── Histórico ────────────────────────────────────

  async listarHistorico(clienteId: number): Promise<HistoricoItem[]> {
    const res = await httpClient.get('/historico/');
    return unwrapPaginated(res.data).map(mapHistoricoFromBackend);
  },

  async buscarHistoricoDetalhe(id: number): Promise<HistoricoDetalhe> {
    const res = await httpClient.get(`/historico/${id}/`);
    const data = res.data;
    return {
      ...mapHistoricoFromBackend(data),
      formaPagamento: data.forma_pagamento_display ?? undefined,
      dataCriacao: data.data_criacao ?? undefined,
    };
  },

  // ─── Serviços ─────────────────────────────────────

  async listarServicos(): Promise<Servico[]> {
    const res = await httpClient.get('/servicos/');
    return unwrapPaginated(res.data);
  },

  async criarServico(dados: { tipo: string; descricao: string; preco: number; duracao_minutos: number; duracao_medio_grande?: number | null }): Promise<Servico> {
    const res = await httpClient.post('/servicos/', dados);
    return res.data;
  },

  async atualizarServico(id: number, dados: Partial<{ tipo: string; descricao: string; preco: number; duracao_minutos: number; duracao_medio_grande: number | null }>): Promise<Servico> {
    const res = await httpClient.patch(`/servicos/${id}/`, dados);
    return res.data;
  },

  async excluirServico(id: number): Promise<void> {
    await httpClient.delete(`/servicos/${id}/`);
  },

  // ─── Perfil (Me) ──────────────────────────────────

  async obterPerfil(): Promise<AuthenticatedUser> {
    const res = await httpClient.get('/me/profile/');
    const profile = res.data;
    return {
      id: profile.id,
      nome: profile.nome,
      email: profile.email,
      role: mapGroupsToRole(profile.groups ?? []),
      telefone: profile.telefone,
    };
  },

  async atualizarPerfil(dados: { nome: string; telefone?: string }): Promise<void> {
    await httpClient.patch('/me/profile/', dados);
  },

  async alterarSenha(dados: { senha_atual: string; senha_nova: string; confirmar_senha_nova: string }): Promise<void> {
    await httpClient.post('/me/change-password/', dados);
  },

  // ─── Admin Dashboard ──────────────────────────────

  async obterDashboardAdmin(): Promise<{
    total_agendamentos_mes: number;
    faturamento_mes: number;
    novos_clientes_mes: number;
    servicos_top: { tipo_servico: string; quantidade: number }[];
    agendamentos_hoje: number;
    total_clientes: number;
    total_pets: number;
  }> {
    const dashRes = await httpClient.get('/admin/dashboard/');
    const dash = dashRes.data;

    // Buscar totais gerais que o dashboard não retorna
    let totalClientes = dash.total_clientes ?? 0;
    let totalPets = dash.total_pets ?? 0;

    try {
      const clientesRes = await httpClient.get('/clientes/', { params: { page_size: 1 } });
      totalClientes = clientesRes.data.count ?? unwrapPaginated(clientesRes.data).length;
    } catch { /* ignora */ }

    try {
      const petsRes = await httpClient.get('/pets/', { params: { page_size: 1 } });
      totalPets = petsRes.data.count ?? unwrapPaginated(petsRes.data).length;
    } catch { /* ignora */ }

    return {
      ...dash,
      total_clientes: totalClientes,
      total_pets: totalPets,
    };
  },

  // ─── Admin Relatórios ─────────────────────────────

  async gerarRelatorio(dados: { tipo: string; formato: string; data_inicio?: string; data_fim?: string }): Promise<any> {
    // #8: URL corrigida de /admin/relatorio/ para /admin/relatorios/gerar/
    const res = await httpClient.post('/admin/relatorios/gerar/', dados);
    return res.data;
  },

  // ─── Funcionarios ───────────────────────────────────

  async listarFuncionarios(): Promise<Funcionario[]> {
    const res = await httpClient.get('/funcionarios/');
    return unwrapPaginated(res.data);
  },

  async obterFuncionario(id: number): Promise<Funcionario | undefined> {
    try {
      const res = await httpClient.get(`/funcionarios/${id}/`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async criarFuncionario(
    dados: { usuario: { nome: string; email: string; telefone: string; senha?: string; confirmar_senha?: string }; cargo: string; }
  ): Promise<Funcionario> {
    const payload = {
      nome: dados.usuario.nome,
      email: dados.usuario.email,
      telefone: dados.usuario.telefone,
      senha: dados.usuario.senha,
      confirmar_senha: dados.usuario.confirmar_senha,
      cargo: dados.cargo
    };
    const res = await httpClient.post('/funcionarios/', payload);
    return res.data;
  },

  async atualizarFuncionario(id: number, dados: any): Promise<Funcionario> {
    const payload: any = { cargo: dados.cargo };
    if (dados.usuario) {
      if (dados.usuario.nome !== undefined) payload.nome = dados.usuario.nome;
      if (dados.usuario.email !== undefined) payload.email = dados.usuario.email;
      if (dados.usuario.telefone !== undefined) payload.telefone = dados.usuario.telefone;
    }
    const res = await httpClient.patch(`/funcionarios/${id}/`, payload);
    return res.data;
  },

  async excluirFuncionario(id: number): Promise<void> {
    await httpClient.delete(`/funcionarios/${id}/`);
  },

  // ─── Horário Trabalho ───────────────────────────────

  async listarHorariosTrabalhoFuncionario(funcionarioId: number): Promise<HorarioTrabalho[]> {
    const res = await httpClient.get('/funcionarios/horarios/', {
      params: { funcionario: funcionarioId }
    });
    return unwrapPaginated(res.data);
  },

  async criarHorarioTrabalho(dados: Omit<HorarioTrabalho, "id" | "dia_semana_display" | "ativo">): Promise<HorarioTrabalho> {
    const res = await httpClient.post('/funcionarios/horarios/', dados);
    return res.data;
  },

  async excluirHorarioTrabalho(id: number): Promise<void> {
    await httpClient.delete(`/funcionarios/horarios/${id}/`);
  },

  // ─── Cargos de Funcionário ────────────────────────

  async listarCargos(): Promise<CargoFuncionario[]> {
    const res = await httpClient.get('/funcionarios/cargos/');
    return unwrapPaginated(res.data);
  },

  async criarCargo(dados: { valor: string; nome_display: string; descricao?: string }): Promise<CargoFuncionario> {
    const res = await httpClient.post('/funcionarios/cargos/', dados);
    return res.data;
  },

  async atualizarCargo(id: number, dados: Partial<{ valor: string; nome_display: string; descricao: string }>): Promise<CargoFuncionario> {
    const res = await httpClient.patch(`/funcionarios/cargos/${id}/`, dados);
    return res.data;
  },

  async excluirCargo(id: number): Promise<void> {
    await httpClient.delete(`/funcionarios/cargos/${id}/`);
  }
};