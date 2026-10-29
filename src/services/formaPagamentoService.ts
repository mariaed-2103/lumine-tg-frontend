import type { FormaPagamento } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

export type DadosFormaPagamento = Omit<FormaPagamento, "idFormaPagamento">;

async function mensagemErro(response: Response, padrao: string): Promise<string> {
  const texto = await response.text().catch(() => "");
  try {
    const json = JSON.parse(texto);
    return json.mensagem ?? json.message ?? padrao;
  } catch { return padrao; }
}

export async function listarFormasPagamento(): Promise<FormaPagamento[]> {
  const response = await apiFetch("/formas-pagamento");
  if (!response.ok) throw new Error(await mensagemErro(response, "Não foi possível carregar as formas de pagamento."));
  return response.json();
}

export async function cadastrarFormaPagamento(dados: DadosFormaPagamento): Promise<FormaPagamento> {
  const response = await apiFetch("/formas-pagamento", { method: "POST", body: JSON.stringify(dados) });
  if (!response.ok) throw new Error(await mensagemErro(response, "Não foi possível cadastrar a forma de pagamento."));
  return response.json();
}

export async function editarFormaPagamento(idFormaPagamento: number, dados: DadosFormaPagamento): Promise<FormaPagamento> {
  const response = await apiFetch(`/formas-pagamento/${idFormaPagamento}`, { method: "PUT", body: JSON.stringify(dados) });
  if (!response.ok) throw new Error(await mensagemErro(response, "Não foi possível editar a forma de pagamento."));
  return response.json();
}

export async function excluirFormaPagamento(idFormaPagamento: number): Promise<void> {
  const response = await apiFetch(`/formas-pagamento/${idFormaPagamento}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await mensagemErro(response, "Não foi possível excluir a forma de pagamento."));
}
