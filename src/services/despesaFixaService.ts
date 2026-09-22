import type { DespesaFixa } from "@/components/financeiro/types";

/**
 * ATENÇÃO: o endpoint "/despesas-fixas" é uma convenção provisória seguindo
 * o padrão de nomenclatura em português já usado em "/procedimentos" e
 * "/insumos". Confirmar com o time de backend antes de subir para produção.
 */
const API_URL = "http://localhost:8080/despesas-fixas";

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
  const response = await fetch(API_URL);

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
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  const response = await fetch(`${API_URL}/${idDespesa}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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
  const response = await fetch(`${API_URL}/${idDespesa}`, {
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
