import type { Insumo } from "@/components/insumos/types";
import { apiFetch } from "@/services/api";

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
  const response = await apiFetch("/insumos");

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
  const response = await apiFetch(`/insumos/${idInsumo}`);

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
  const response = await apiFetch("/insumos", {
    method: "POST",
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
  const response = await apiFetch(`/insumos/${idInsumo}`, {
    method: "PUT",
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
  const response = await apiFetch(`/insumos/${idInsumo}`, {
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
  const response = await apiFetch(
    `/insumos/${idInsumo}/estoque?quantidade=${quantidade}`,
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
  const response = await apiFetch(
    `/insumos/${idInsumo}/estoque-minimo`
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
