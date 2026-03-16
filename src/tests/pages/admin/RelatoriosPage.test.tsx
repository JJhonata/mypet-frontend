import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RelatoriosPage } from "../../../pages/admin/RelatoriosPage";

const { obterDashboardAdminMock, openMenuMock } = vi.hoisted(() => ({
  obterDashboardAdminMock: vi.fn(),
  openMenuMock: vi.fn()
}));

vi.mock("../../../services/api", () => ({
  api: {
    obterDashboardAdmin: obterDashboardAdminMock
  }
}));

vi.mock("../../../pages/admin/AdminLayout", () => ({
  useAdminShell: () => ({ openMenu: openMenuMock })
}));

vi.mock("../../../components/mobile/TopBarTitle", () => ({
  TopBarTitle: ({ title }: { title: string }) => <div>{title}</div>
}));

vi.mock("../../../components/ui/StatusMessage", () => ({
  StatusMessage: ({ message }: { message: string }) => <div>{message}</div>
}));

describe("RelatoriosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carrega e exibe os principais cards e resumo", async () => {
    obterDashboardAdminMock.mockResolvedValue({
      faturamento_mes: 1234.5,
      novos_clientes_mes: 8,
      total_agendamentos_mes: 22,
      agendamentos_hoje: 4,
      servicos_top: [
        { tipo_servico: "BANHO", quantidade: 6 },
        { tipo_servico: "TOSA", quantidade: 2 }
      ],
      total_clientes: 99,
      total_pets: 140
    });

    render(<RelatoriosPage />);

    expect((await screen.findAllByText(/R\$\s*1234\.50/)).length).toBeGreaterThan(0);
    expect(screen.getByText("Novos Clientes")).toBeInTheDocument();
    expect(screen.getByText("BANHO")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("Total de Clientes")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("mostra mensagem quando nao ha servicos no periodo", async () => {
    obterDashboardAdminMock.mockResolvedValue({
      faturamento_mes: 0,
      novos_clientes_mes: 0,
      total_agendamentos_mes: 0,
      agendamentos_hoje: 0,
      servicos_top: [],
      total_clientes: 0,
      total_pets: 0
    });

    render(<RelatoriosPage />);

    expect(await screen.findByText("Nenhum serviço realizado neste período.")).toBeInTheDocument();
  });

  it("exibe erro quando falha ao carregar relatorios", async () => {
    obterDashboardAdminMock.mockRejectedValue(new Error("falhou"));

    render(<RelatoriosPage />);

    expect(
      await screen.findByText("Não foi possível carregar os dados dos relatórios.")
    ).toBeInTheDocument();
  });
});
