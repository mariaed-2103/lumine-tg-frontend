import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buscarAtendimentoPorId,
  cadastrarAtendimento,
  calcularTaxaPagamentoAtendimento,
  editarAtendimento,
  excluirAtendimento,
  listarAtendimentos,
  listarImprevistosAtendimentos,
  registrarImprevistoAtendimento,
} from "./atendimentoService";

describe("integração HTTP de atendimentos", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tokenLumine", "token-teste");
  });

  it("lista os atendimentos e mapeia entidades aninhadas do backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          idAtendimento: 10,
          data: "2026-10-29",
          nomeCliente: "Ana Clara",
          procedimento: { idProcedimento: 2, nome: "Limpeza de Pele" },
          formaPagamento: { idFormaPagamento: 3, nome: "Pix" },
          valorCobrado: 180.5,
          tempoAdicional: 15,
          desperdicioMateriais: 12.0,
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const lista = await listarAtendimentos();

    expect(lista).toHaveLength(1);
    expect(lista[0]).toEqual({
      idAtendimento: 10,
      dataAtendimento: "2026-10-29",
      nomeCliente: "Ana Clara",
      idProcedimento: 2,
      nomeProcedimento: "Limpeza de Pele",
      valorCobrado: 180.5,
      idFormaPagamento: 3,
      nomeFormaPagamento: "Pix",
      tempoAdicional: 15,
      desperdicioMateriais: 12,
    });
  });

  it("cadastra, edita e exclui um atendimento", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          idAtendimento: 11,
          data: "2026-10-29",
          nomeCliente: "Beatriz Souza",
          procedimento: { idProcedimento: 2, nome: "Limpeza de Pele" },
          formaPagamento: { idFormaPagamento: 3, nome: "Pix" },
          valorCobrado: 150,
          tempoAdicional: 0,
          desperdicioMateriais: 0,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          idAtendimento: 11,
          data: "2026-10-29",
          nomeCliente: "Beatriz Souza",
          procedimento: { idProcedimento: 2, nome: "Limpeza de Pele" },
          formaPagamento: { idFormaPagamento: 3, nome: "Pix" },
          valorCobrado: 165,
          tempoAdicional: 10,
          desperdicioMateriais: 5,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      });
    vi.stubGlobal("fetch", fetchMock);

    const criado = await cadastrarAtendimento({
      dataAtendimento: "2026-10-29",
      nomeCliente: "Beatriz Souza",
      idProcedimento: 2,
      valorCobrado: 150,
      idFormaPagamento: 3,
      tempoAdicional: 0,
      desperdicioMateriais: 0,
    });
    expect(criado.idAtendimento).toBe(11);

    const editado = await editarAtendimento(11, {
      dataAtendimento: "2026-10-29",
      nomeCliente: "Beatriz Souza",
      idProcedimento: 2,
      valorCobrado: 165,
      idFormaPagamento: 3,
      tempoAdicional: 10,
      desperdicioMateriais: 5,
    });
    expect(editado.valorCobrado).toBe(165);
    expect(editado.tempoAdicional).toBe(10);

    await excluirAtendimento(11);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("registra e consulta imprevistos e calcula a taxa da forma de pagamento", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          idAtendimento: 11,
          data: "2026-10-29",
          nomeCliente: "Beatriz Souza",
          nomeProcedimento: "Limpeza de Pele",
          tempoAdicional: 20,
          desperdicioMateriais: 15,
          possuiImprevisto: true,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          {
            idAtendimento: 11,
            data: "2026-10-29",
            nomeCliente: "Beatriz Souza",
            nomeProcedimento: "Limpeza de Pele",
            tempoAdicional: 20,
            desperdicioMateriais: 15,
            possuiImprevisto: true,
          },
        ],
      });
    vi.stubGlobal("fetch", fetchMock);

    const registrado = await registrarImprevistoAtendimento(11, {
      tempoAdicional: 20,
      desperdicioMateriais: 15,
    });
    expect(registrado.possuiImprevisto).toBe(true);
    expect(registrado.tempoAdicional).toBe(20);

    const imprevistos = await listarImprevistosAtendimentos();
    expect(imprevistos).toHaveLength(1);

    expect(calcularTaxaPagamentoAtendimento(200, 3.5)).toBe(7);
    expect(calcularTaxaPagamentoAtendimento(180, 0)).toBe(0);
    expect(calcularTaxaPagamentoAtendimento(180, null)).toBe(0);
  });

  it("trata erros retornados pelo backend (estoque insuficiente e 404)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          status: 400,
          mensagem: 'Estoque insuficiente para o insumo "Sabonete Facial".',
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          status: 404,
          mensagem: "Atendimento não encontrado.",
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      cadastrarAtendimento({
        dataAtendimento: "2026-10-29",
        nomeCliente: "Beatriz Souza",
        idProcedimento: 2,
        valorCobrado: 150,
        idFormaPagamento: 3,
        tempoAdicional: 0,
        desperdicioMateriais: 0,
      }),
    ).rejects.toThrow('Estoque insuficiente para o insumo "Sabonete Facial".');

    await expect(buscarAtendimentoPorId(999)).rejects.toThrow(
      "Atendimento não encontrado.",
    );
  });
});
