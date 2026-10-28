import type { FormaPagamento } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

/**
 * ATENÇÃO: o endpoint "/formas-pagamento" é uma convenção provisória seguindo
 * o padrão de nomenclatura em português já usado em "/procedimentos" e
 * "/insumos". Confirmar com o time de backend antes de subir para produção.
 */

export type DadosFormaPagamento = Omit<FormaPagamento, "idFormaPagamento">;

async function obterMensagemErro(
  response: Response,
  mensagemPadrao: string
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

export async function listarFormasPagamento(): Promise<FormaPagamento[]> {
  const response = await apiFetch("/formas-pagamento");

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível carregar as formas de pagamento."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function cadastrarFormaPagamento(
  dados: DadosFormaPagamento
): Promise<FormaPagamento> {
  const response = await apiFetch("/formas-pagamento", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível cadastrar a forma de pagamento."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function editarFormaPagamento(
  idFormaPagamento: number,
  dados: DadosFormaPagamento
): Promise<FormaPagamento> {
  const response = await apiFetch(`/formas-pagamento/${idFormaPagamento}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível editar a forma de pagamento."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function excluirFormaPagamento(
  idFormaPagamento: number
): Promise<void> {
  const response = await apiFetch(`/formas-pagamento/${idFormaPagamento}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível excluir a forma de pagamento."
    );
    throw new Error(mensagem);
  }
}
