import type { CompraInsumo } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

/**
 * ATENÇÃO: o endpoint "/compras" é uma convenção provisória seguindo
 * o padrão de nomenclatura em português já usado em "/procedimentos" e
 * "/insumos". Confirmar com o time de backend antes de subir para produção.
 */

export type DadosCompra = Omit<CompraInsumo, "idCompra">;

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

export async function listarCompras(): Promise<CompraInsumo[]> {
  const response = await apiFetch("/compras");

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível carregar as compras de insumos."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function cadastrarCompra(dados: DadosCompra): Promise<CompraInsumo> {
  const response = await apiFetch("/compras", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível registrar a compra."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function editarCompra(
  idCompra: number,
  dados: DadosCompra
): Promise<CompraInsumo> {
  const response = await apiFetch(`/compras/${idCompra}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível editar a compra."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function excluirCompra(idCompra: number): Promise<void> {
  const response = await apiFetch(`/compras/${idCompra}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível excluir a compra."
    );
    throw new Error(mensagem);
  }
}
