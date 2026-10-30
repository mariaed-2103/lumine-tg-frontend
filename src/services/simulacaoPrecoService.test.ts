import { beforeEach, describe, expect, it, vi } from "vitest";

import { definirPrecoPadrao, simularPreco } from "./simulacaoPrecoService";

describe("integração HTTP da simulação de preço", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tokenLumine", "token-teste");
  });

  it("consulta a simulação e mapeia o DTO do backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        idProcedimento: 2,
        nomeProcedimento: "Limpeza de pele",
        duracaoMinutos: 60,
        custoTotalInsumos: 5,
        custoFixoPorMinuto: 0.15,
        custoDoTempo: 9,
        custoTotal: 14,
        margemSeguranca: 10,
        lucroDesejado: 20,
        precoSugerido: 20,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await simularPreco(2, 10, 2026);

    expect(fetchMock.mock.calls[0][0]).toContain(
      "/simulacoes-preco/procedimento/2?mes=10&ano=2026",
    );
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-teste");
    expect(resultado.custoInsumos).toBe(5);
    expect(resultado.custoFixoProcedimento).toBe(9);
    expect(resultado.precoSugerido).toBe(20);
  });

  it("envia o preço sugerido ao endpoint para atualizar o preço padrão", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);

    await definirPrecoPadrao(2, 20);

    expect(fetchMock.mock.calls[0][0]).toContain("/simulacoes-preco/procedimento/2/preco-padrao");
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ precoSugerido: 20 }));
  });

  it("mostra a mensagem de validação enviada pelo backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ mensagem: "Preço inválido." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(definirPrecoPadrao(2, 0)).rejects.toThrow("Preço inválido.");
  });
});
