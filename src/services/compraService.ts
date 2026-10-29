import type { CompraInsumo } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

/**
 * ATENÇÃO: o endpoint "/compras" é uma convenção provisória seguindo
 * o padrão de nomenclatura em português já usado em "/procedimentos" e
 * "/insumos". Confirmar com o time de backend antes de subir para produção.
 */

export type DadosCompra = Omit<CompraInsumo, "idCompra">;

// Formato que o backend espera no body do POST/PUT /compras
interface CompraRequest {
  insumo: { idInsumo: number };
  dataCompra: string;
  quantidadeComprada: number;
  valorTotalCompra: number;
  descricao?: string | undefined;
}

function montarCompraRequest(dados: DadosCompra): CompraRequest {
  return {
    insumo: { idInsumo: dados.idInsumo },
    dataCompra: dados.dataCompra,
    quantidadeComprada: dados.quantidadeComprada,
    valorTotalCompra: dados.valorTotalCompra,
    descricao: dados.descricao,
  };
}

// O backend retorna a entidade Compra com o insumo aninhado
// ({ insumo: { idInsumo } }); o frontend usa idInsumo na raiz.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapearCompra(raw: any): CompraInsumo {
  return {
    idCompra: raw.idCompra,
    idInsumo: raw.insumo?.idInsumo ?? raw.idInsumo,
    dataCompra: raw.dataCompra,
    quantidadeComprada: raw.quantidadeComprada,
    valorTotalCompra: raw.valorTotalCompra,
    descricao: raw.descricao,
  };
}

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((await response.json()) as any[]).map(mapearCompra);
}

export async function cadastrarCompra(dados: DadosCompra): Promise<CompraInsumo> {
  const body: CompraRequest = montarCompraRequest(dados);

  const response = await apiFetch("/compras", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível registrar a compra."
    );
    throw new Error(mensagem);
  }

  return mapearCompra(await response.json());
}

export async function editarCompra(
  idCompra: number,
  dados: DadosCompra
): Promise<CompraInsumo> {
  const body: CompraRequest = montarCompraRequest(dados);

  const response = await apiFetch(`/compras/${idCompra}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível editar a compra."
    );
    throw new Error(mensagem);
  }

  return mapearCompra(await response.json());
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
