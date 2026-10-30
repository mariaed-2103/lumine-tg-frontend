import type { Atendimento, AtendimentoInput } from "@/components/atendimentos/types";
import { apiFetch } from "@/services/api";

export interface AtendimentoRequest {
  procedimento: { idProcedimento: number };
  formaPagamento: { idFormaPagamento: number };
  idProcedimento: number;
  idFormaPagamento: number;
  data: string;
  dataAtendimento: string;
  nomeCliente: string;
  valorCobrado: number;
  tempoAdicional: number;
  desperdicioMateriais: number;
}

function montarAtendimentoRequest(dados: AtendimentoInput): AtendimentoRequest {
  return {
    procedimento: { idProcedimento: dados.idProcedimento },
    formaPagamento: { idFormaPagamento: dados.idFormaPagamento },
    idProcedimento: dados.idProcedimento,
    idFormaPagamento: dados.idFormaPagamento,
    data: dados.dataAtendimento,
    dataAtendimento: dados.dataAtendimento,
    nomeCliente: dados.nomeCliente,
    valorCobrado: dados.valorCobrado,
    tempoAdicional: dados.tempoAdicional,
    desperdicioMateriais: dados.desperdicioMateriais,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapearAtendimento(raw: any): Atendimento {
  return {
    idAtendimento: Number(raw.idAtendimento),
    dataAtendimento: String(raw.dataAtendimento ?? raw.data ?? ""),
    nomeCliente: String(raw.nomeCliente ?? ""),
    idProcedimento: Number(raw.procedimento?.idProcedimento ?? raw.idProcedimento ?? 0),
    nomeProcedimento: String(raw.procedimento?.nome ?? raw.nomeProcedimento ?? ""),
    valorCobrado: Number(raw.valorCobrado ?? 0),
    idFormaPagamento: Number(
      raw.formaPagamento?.idFormaPagamento ?? raw.idFormaPagamento ?? 0,
    ),
    nomeFormaPagamento: String(raw.formaPagamento?.nome ?? raw.nomeFormaPagamento ?? ""),
    tempoAdicional: Number(raw.tempoAdicional ?? 0),
    desperdicioMateriais: Number(raw.desperdicioMateriais ?? 0),
  };
}

async function obterMensagemErro(
  response: Response,
  mensagemPadrao: string,
): Promise<string> {
  try {
    const erro = await response.json();
    if (erro?.message) return erro.message;
    if (erro?.mensagem) return erro.mensagem;
    return mensagemPadrao;
  } catch {
    return mensagemPadrao;
  }
}

export async function listarAtendimentos(): Promise<Atendimento[]> {
  const response = await apiFetch("/atendimentos");

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(response, "Não foi possível carregar os atendimentos."),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((await response.json()) as any[]).map(mapearAtendimento);
}

export async function buscarAtendimentoPorId(
  idAtendimento: number,
): Promise<Atendimento> {
  const response = await apiFetch(`/atendimentos/${idAtendimento}`);

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(response, "Não foi possível buscar o atendimento."),
    );
  }

  return mapearAtendimento(await response.json());
}

export async function cadastrarAtendimento(
  dados: AtendimentoInput,
): Promise<Atendimento> {
  const body = montarAtendimentoRequest(dados);

  const response = await apiFetch("/atendimentos", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(response, "Não foi possível registrar o atendimento."),
    );
  }

  return mapearAtendimento(await response.json());
}

export async function editarAtendimento(
  idAtendimento: number,
  dados: AtendimentoInput,
): Promise<Atendimento> {
  const body = montarAtendimentoRequest(dados);

  const response = await apiFetch(`/atendimentos/${idAtendimento}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(response, "Não foi possível atualizar o atendimento."),
    );
  }

  return mapearAtendimento(await response.json());
}

export async function excluirAtendimento(idAtendimento: number): Promise<void> {
  const response = await apiFetch(`/atendimentos/${idAtendimento}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(response, "Não foi possível excluir o atendimento."),
    );
  }
}

export interface ImprevistoInput {
  tempoAdicional: number;
  desperdicioMateriais: number;
}

export interface ImprevistoResponse {
  idAtendimento: number;
  data: string;
  nomeCliente: string;
  nomeProcedimento: string;
  tempoAdicional: number;
  desperdicioMateriais: number;
  possuiImprevisto: boolean;
}

export async function registrarImprevistoAtendimento(
  idAtendimento: number,
  dados: ImprevistoInput,
): Promise<ImprevistoResponse> {
  const response = await apiFetch(`/atendimentos/${idAtendimento}/imprevistos`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(response, "Não foi possível registrar o imprevisto."),
    );
  }

  return response.json();
}

export async function listarImprevistosAtendimentos(): Promise<ImprevistoResponse[]> {
  const response = await apiFetch("/atendimentos/imprevistos");

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(response, "Não foi possível carregar os imprevistos."),
    );
  }

  return response.json();
}

export function calcularTaxaPagamentoAtendimento(
  valorCobrado: number,
  taxaPercentual: number | null | undefined,
): number {
  if (!valorCobrado || valorCobrado <= 0 || !taxaPercentual || taxaPercentual <= 0) {
    return 0;
  }
  return Math.round(((valorCobrado * taxaPercentual) / 100) * 100) / 100;
}
