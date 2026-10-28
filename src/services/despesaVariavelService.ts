import type { DespesaVariavel } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

/**
 * ATENÇÃO: o endpoint "/despesas-variaveis" é uma convenção provisória seguindo
 * o padrão de nomenclatura em português já usado em "/procedimentos" e
 * "/insumos". Confirmar com o time de backend antes de subir para produção.
 */

export type DadosDespesaVariavel = Omit<DespesaVariavel, "idDespesaVariavel">;

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

export async function listarDespesasVariaveis(): Promise<DespesaVariavel[]> {
  const response = await apiFetch("/despesas-variaveis");

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível carregar as despesas variáveis."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function cadastrarDespesaVariavel(
  dados: DadosDespesaVariavel
): Promise<DespesaVariavel> {
  const response = await apiFetch("/despesas-variaveis", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível cadastrar a despesa variável."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function editarDespesaVariavel(
  idDespesaVariavel: number,
  dados: DadosDespesaVariavel
): Promise<DespesaVariavel> {
  const response = await apiFetch(`/despesas-variaveis/${idDespesaVariavel}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível editar a despesa variável."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function excluirDespesaVariavel(
  idDespesaVariavel: number
): Promise<void> {
  const response = await apiFetch(`/despesas-variaveis/${idDespesaVariavel}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível excluir a despesa variável."
    );
    throw new Error(mensagem);
  }
}
