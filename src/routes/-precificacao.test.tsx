import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PrecificacaoPage } from "./precificacao";
import { buscarPerfilEmpresa } from "@/services/perfilEmpresaService";
import { buscarConfiguracaoFinanceira } from "@/services/configuracaoFinanceiraService";
import { listarFormasPagamento } from "@/services/formaPagamentoService";
import { listarProcedimentos } from "@/services/procedimentoService";
import { listarFichaTecnica } from "@/services/fichaTecnicaService";
import { listarInsumos } from "@/services/insumoService";
import { listarCompras } from "@/services/compraService";
import { listarDespesasFixas } from "@/services/despesaFixaService";
import { apiFetch } from "@/services/api";
import { definirPrecoPadrao, simularPreco } from "@/services/simulacaoPrecoService";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/layout/SemPerfilBanner", () => ({
  SemPerfilBanner: () => null,
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/services/perfilEmpresaService", () => ({ buscarPerfilEmpresa: vi.fn() }));
vi.mock("@/services/configuracaoFinanceiraService", () => ({
  buscarConfiguracaoFinanceira: vi.fn(),
  salvarConfiguracaoFinanceira: vi.fn(),
}));
vi.mock("@/services/formaPagamentoService", () => ({
  listarFormasPagamento: vi.fn(),
  cadastrarFormaPagamento: vi.fn(),
  editarFormaPagamento: vi.fn(),
  excluirFormaPagamento: vi.fn(),
}));
vi.mock("@/services/procedimentoService", () => ({ listarProcedimentos: vi.fn() }));
vi.mock("@/services/fichaTecnicaService", () => ({ listarFichaTecnica: vi.fn() }));
vi.mock("@/services/insumoService", () => ({ listarInsumos: vi.fn() }));
vi.mock("@/services/compraService", () => ({ listarCompras: vi.fn() }));
vi.mock("@/services/despesaFixaService", () => ({ listarDespesasFixas: vi.fn() }));
vi.mock("@/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("@/services/simulacaoPrecoService", () => ({
  definirPrecoPadrao: vi.fn(),
  simularPreco: vi.fn(),
}));

afterEach(cleanup);

describe("atualização dos dados na tela de precificação", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("idUsuario", "7");

    vi.mocked(buscarPerfilEmpresa).mockResolvedValue({ idPerfilEmpresa: 1 } as never);
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        idPerfilEmpresa: 1,
        diasTrabalhadosMes: 20,
        horasDisponiveisDia: 5,
      }),
    } as Response);
    vi.mocked(buscarConfiguracaoFinanceira).mockResolvedValue({
      idConfiguracao: 1,
      margemSeguranca: 10,
      lucroDesejado: 20,
      provisaoFeriasAtiva: false,
      percentualProvisaoFerias: null,
    });
    vi.mocked(listarProcedimentos).mockResolvedValue([
      {
        idProcedimento: 2,
        nome: "Limpeza de pele",
        duracaoMinutos: 60,
        precoPadrao: 5,
        itensFichaTecnica: [],
      },
    ]);
    vi.mocked(listarFormasPagamento).mockResolvedValue([]);
    vi.mocked(listarCompras).mockResolvedValue([]);
    vi.mocked(listarDespesasFixas).mockResolvedValue([]);
    vi.mocked(listarInsumos).mockResolvedValue([]);
    vi.mocked(listarFichaTecnica).mockResolvedValue([]);
    vi.mocked(simularPreco).mockResolvedValue({
      idProcedimento: 2,
      nomeProcedimento: "Limpeza de pele",
      duracaoMinutos: 60,
      custoInsumos: 5,
      custoFixoPorMinuto: 0.15,
      custoFixoProcedimento: 9,
      custoProcedimento: 14,
      margemSeguranca: 10,
      lucroDesejado: 20,
      precoSugerido: 42.75,
    });
    vi.mocked(definirPrecoPadrao).mockResolvedValue(undefined);
  });

  it("mostra o novo preço padrão após salvar a sugestão", async () => {
    const user = userEvent.setup();
    render(<PrecificacaoPage />);

    await user.click(await screen.findByRole("tab", { name: "Simulação de preço" }));
    await user.selectOptions(screen.getByLabelText("Procedimento para Simulação"), "2");
    await user.click(await screen.findByRole("button", { name: "Definir como preço padrão" }));
    await user.click(screen.getByRole("button", { name: "Confirmar Preço" }));

    await waitFor(() => expect(definirPrecoPadrao).toHaveBeenCalledWith(2, 42.75));
    await waitFor(() => {
      const precoPadraoAtual = screen.getByText("Preço padrão atual:").parentElement;
      expect(precoPadraoAtual?.textContent).toContain("42,75");
    });
  });
});
