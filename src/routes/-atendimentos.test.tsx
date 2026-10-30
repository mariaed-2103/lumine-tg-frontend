import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AtendimentosPage } from "./atendimentos";
import { buscarPerfilEmpresa } from "@/services/perfilEmpresaService";
import { listarProcedimentos } from "@/services/procedimentoService";
import { listarFormasPagamento } from "@/services/formaPagamentoService";
import {
  listarAtendimentos,
  cadastrarAtendimento,
  editarAtendimento,
  excluirAtendimento,
} from "@/services/atendimentoService";

const historyBackMock = vi.fn();

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useRouter: () => ({
      history: { back: historyBackMock },
    }),
  };
});

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/layout/SemPerfilBanner", () => ({
  SemPerfilBanner: () => null,
}));
vi.mock("@/services/perfilEmpresaService", () => ({
  buscarPerfilEmpresa: vi.fn(),
}));
vi.mock("@/services/procedimentoService", () => ({
  listarProcedimentos: vi.fn(),
}));
vi.mock("@/services/formaPagamentoService", () => ({
  listarFormasPagamento: vi.fn(),
}));
vi.mock("@/services/atendimentoService", () => ({
  listarAtendimentos: vi.fn(),
  cadastrarAtendimento: vi.fn(),
  editarAtendimento: vi.fn(),
  excluirAtendimento: vi.fn(),
}));

afterEach(cleanup);

describe("Tela de Atendimentos (RF019 / RF020)", () => {
  beforeEach(() => {
    historyBackMock.mockReset();

    vi.mocked(buscarPerfilEmpresa).mockResolvedValue({ idPerfilEmpresa: 1 } as never);
    vi.mocked(listarProcedimentos).mockResolvedValue([
      {
        idProcedimento: 1,
        nome: "Limpeza de Pele",
        duracaoMinutos: 60,
        precoPadrao: 180,
        itensFichaTecnica: [],
      },
      {
        idProcedimento: 2,
        nome: "Drenagem Linfática",
        duracaoMinutos: 50,
        precoPadrao: 140,
        itensFichaTecnica: [],
      },
    ]);
    vi.mocked(listarFormasPagamento).mockResolvedValue([
      { idFormaPagamento: 1, nome: "Pix", taxaPercentual: 0 },
      { idFormaPagamento: 2, nome: "Cartão de Crédito", taxaPercentual: 3.5 },
    ]);
    vi.mocked(listarAtendimentos).mockResolvedValue([]);
  });

  it("exibe estado vazio inicial e testa navegação pelo botão Voltar", async () => {
    const user = userEvent.setup();
    render(<AtendimentosPage />);

    expect(await screen.findByText("Nenhum atendimento registrado")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /Voltar/i }));
    expect(historyBackMock).toHaveBeenCalledTimes(1);
  });

  it("exibe mensagens de validação quando os campos obrigatórios estão vazios", async () => {
    const user = userEvent.setup();
    render(<AtendimentosPage />);

    await user.click(await screen.findByRole("button", { name: /Novo Atendimento/i }));
    await user.click(screen.getByRole("button", { name: /Salvar Atendimento/i }));

    expect(await screen.findByText("Nome da cliente é obrigatório")).toBeTruthy();
    expect(screen.getByText("Selecione um procedimento")).toBeTruthy();
    expect(screen.getByText("Informe o valor cobrado")).toBeTruthy();
    expect(screen.getByText("Selecione uma forma de pagamento")).toBeTruthy();
    expect(cadastrarAtendimento).not.toHaveBeenCalled();
  });

  it("preenche preço padrão automaticamente, permite alterar valor cobrado, cadastra, edita e exibe imprevistos", async () => {
    const user = userEvent.setup();

    vi.mocked(cadastrarAtendimento).mockImplementation(async (dados) => ({
      ...dados,
      idAtendimento: 100,
      nomeProcedimento: "Limpeza de Pele",
      nomeFormaPagamento: "Pix",
    }));

    vi.mocked(editarAtendimento).mockImplementation(async (id, dados) => ({
      ...dados,
      idAtendimento: id,
      nomeProcedimento: "Limpeza de Pele",
      nomeFormaPagamento: "Pix",
    }));

    vi.mocked(excluirAtendimento).mockResolvedValue(undefined);

    render(<AtendimentosPage />);

    await waitFor(() => expect(listarProcedimentos).toHaveBeenCalled());

    // Abre modal de cadastro
    await user.click(screen.getByRole("button", { name: /Novo Atendimento/i }));

    // Preenche cliente
    const inputCliente = screen.getByLabelText(/Nome da Cliente/i);
    await user.type(inputCliente, "Mariana Alves");

    // Seleciona procedimento e verifica auto-preenchimento do valorCobrado (180)
    const selectProcedimento = screen.getByLabelText(/Procedimento/i);
    await user.selectOptions(selectProcedimento, "1");

    const inputValor = screen.getByLabelText(/Valor Cobrado/i) as HTMLInputElement;
    expect(inputValor.value).toBe("180");

    // Altera o valor cobrado manualmente para 195.50
    await user.clear(inputValor);
    await user.type(inputValor, "195.50");

    // Seleciona forma de pagamento
    await user.selectOptions(screen.getByLabelText(/Forma de Pagamento/i), "1");

    // Preenche imprevistos (tempo adicional e desperdício)
    await user.type(screen.getByLabelText(/Tempo adicional/i), "20");
    await user.type(screen.getByLabelText(/Desperdício de materiais/i), "15.00");

    // Salva atendimento
    await user.click(screen.getByRole("button", { name: /Salvar Atendimento/i }));

    await waitFor(() => expect(cadastrarAtendimento).toHaveBeenCalledTimes(1));

    // Verifica exibição na listagem (tabela desktop)
    const tabela = await screen.findByRole("table");
    expect(within(tabela).getByText("Mariana Alves")).toBeTruthy();
    expect(within(tabela).getByText("Limpeza de Pele")).toBeTruthy();
    expect(within(tabela).getByText("Pix")).toBeTruthy();
    expect(within(tabela).getByText("Imprevisto")).toBeTruthy();

    // Edita o atendimento removendo os imprevistos
    await user.click(
      within(tabela).getByRole("button", { name: /Editar atendimento de Mariana Alves/i }),
    );

    const inputTempoEdit = screen.getByLabelText(/Tempo adicional/i);
    const inputDesperdicioEdit = screen.getByLabelText(/Desperdício de materiais/i);
    await user.clear(inputTempoEdit);
    await user.clear(inputDesperdicioEdit);

    await user.click(screen.getByRole("button", { name: /Atualizar Atendimento/i }));

    await waitFor(() => expect(editarAtendimento).toHaveBeenCalledTimes(1));
    expect(within(tabela).getByLabelText("Sem imprevistos")).toBeTruthy();

    // Exclui o atendimento
    await user.click(
      within(tabela).getByRole("button", { name: /Excluir atendimento de Mariana Alves/i }),
    );
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(excluirAtendimento).toHaveBeenCalledWith(100));
    expect(await screen.findByText("Nenhum atendimento registrado")).toBeTruthy();
  });

  it("exibe toast de erro quando o backend rejeita o cadastro (ex.: estoque insuficiente)", async () => {
    const user = userEvent.setup();

    vi.mocked(cadastrarAtendimento).mockRejectedValueOnce(
      new Error('Estoque insuficiente para o insumo "Sabonete Facial".'),
    );

    render(<AtendimentosPage />);

    await waitFor(() => expect(listarProcedimentos).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /Novo Atendimento/i }));
    await user.type(screen.getByLabelText(/Nome da Cliente/i), "Clara Nunes");
    await user.selectOptions(screen.getByLabelText(/Procedimento/i), "1");
    await user.selectOptions(screen.getByLabelText(/Forma de Pagamento/i), "2");
    await user.click(screen.getByRole("button", { name: /Salvar Atendimento/i }));

    expect(
      await screen.findByText('Estoque insuficiente para o insumo "Sabonete Facial".'),
    ).toBeTruthy();
  });
});
