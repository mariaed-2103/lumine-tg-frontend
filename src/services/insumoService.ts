import type { Insumo } from "@/components/insumos/types";

const API_URL = "http://localhost:8080/insumos";

export type DadosInsumo = Omit<Insumo, "idInsumo" | "dataCadastro">;

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

export async function listarInsumos(): Promise<Insumo[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível carregar os insumos."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function buscarInsumoPorId(
  idInsumo: number
): Promise<Insumo> {
  const response = await fetch(`${API_URL}/${idInsumo}`);

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível buscar o insumo."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function cadastrarInsumo(
  dados: DadosInsumo
): Promise<Insumo> {
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
      "Não foi possível cadastrar o insumo."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function editarInsumo(
  idInsumo: number,
  dados: DadosInsumo
): Promise<Insumo> {
  const response = await fetch(`${API_URL}/${idInsumo}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível editar o insumo."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function excluirInsumo(
  idInsumo: number
): Promise<void> {
  const response = await fetch(`${API_URL}/${idInsumo}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível excluir o insumo."
    );

    throw new Error(mensagem);
  }
}

export async function adicionarEstoque(
  idInsumo: number,
  quantidade: number
): Promise<Insumo> {
  const response = await fetch(
    `${API_URL}/${idInsumo}/estoque?quantidade=${quantidade}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível adicionar estoque."
    );

    throw new Error(mensagem);
  }

  return response.json();
}

export async function verificarEstoqueMinimo(
  idInsumo: number
): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/${idInsumo}/estoque-minimo`
  );

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível verificar o estoque mínimo."
    );

    throw new Error(mensagem);
  }

  return response.json();
}