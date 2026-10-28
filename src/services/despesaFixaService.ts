import type { DespesaFixa } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

/**
 * ATENÇÃO: o endpoint "/despesas-fixas" é uma convenção provisória seguindo
 * o padrão de nomenclatura em português já usado em "/procedimentos" e
 * "/insumos". Confirmar com o time de backend antes de subir para produção.
 */

export type DadosDespesaFixa = Omit<DespesaFixa, "idDespesa">;

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

export async function listarDespesasFixas(): Promise<DespesaFixa[]> {
  const response = await apiFetch("/despesas-fixas");

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível carregar as despesas fixas."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function cadastrarDespesaFixa(
  dados: DadosDespesaFixa
): Promise<DespesaFixa> {
  const response = await apiFetch("/despesas-fixas", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível cadastrar a despesa fixa."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function editarDespesaFixa(
  idDespesa: number,
  dados: DadosDespesaFixa
): Promise<DespesaFixa> {
  const response = await apiFetch(`/despesas-fixas/${idDespesa}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível editar a despesa fixa."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function excluirDespesaFixa(idDespesa: number): Promise<void> {
  const response = await apiFetch(`/despesas-fixas/${idDespesa}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível excluir a despesa fixa."
    );
    throw new Error(mensagem);
  }
}
