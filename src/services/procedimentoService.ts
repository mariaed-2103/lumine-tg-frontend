import type { Procedimento } from "@/components/procedimentos/types";

const API_URL = "http://localhost:8080/procedimentos";

/**
 * Formato de dados enviado ao criar/editar um procedimento.
 *
 * ATENÇÃO: o formato de envio da Ficha Técnica aqui assume que o backend
 * aceita a lista de itens ("itensFichaTecnica") aninhada dentro do próprio
 * payload do procedimento — igual ao que já fizemos no protótipo do Google
 * AI Studio. Isso ainda não foi confirmado com o contrato real da API.
 * Se o backend esperar outro formato (ex: endpoints separados para
 * associar/desassociar insumos de um procedimento), essas funções
 * precisarão ser ajustadas.
 */
export type DadosProcedimento = Omit<
  Procedimento,
  "idProcedimento" | "dataCadastro"
>;

async function obterMensagemErro(
  response: Response,
  mensagemPadrao: string
): Promise<string> {
  try {
    const erro = await response.json();

    if (erro?.message) {
      return erro.message;
    }

    if (erro?.mensagem) {
      return erro.mensagem;
    }

    return mensagemPadrao;
  } catch {
    return mensagemPadrao;
  }
}

export async function listarProcedimentos(): Promise<Procedimento[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível carregar os procedimentos."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function buscarProcedimentoPorId(
  idProcedimento: number
): Promise<Procedimento> {
  const response = await fetch(`${API_URL}/${idProcedimento}`);

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível buscar o procedimento."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function cadastrarProcedimento(
  dados: DadosProcedimento
): Promise<Procedimento> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível cadastrar o procedimento."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function editarProcedimento(
  idProcedimento: number,
  dados: DadosProcedimento
): Promise<Procedimento> {
  const response = await fetch(`${API_URL}/${idProcedimento}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível editar o procedimento."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function excluirProcedimento(
  idProcedimento: number
): Promise<void> {
  const response = await fetch(`${API_URL}/${idProcedimento}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível excluir o procedimento."
    );

    throw new Error(mensagem);
  }
}
