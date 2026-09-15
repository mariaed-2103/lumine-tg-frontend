import type { FichaTecnicaItem } from "@/components/procedimentos/types";

const API_URL = "http://localhost:8080/fichas-tecnicas";

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

export async function listarFichaTecnica(
  idProcedimento: number
): Promise<FichaTecnicaItem[]> {
  const response = await fetch(
    `${API_URL}/procedimento/${idProcedimento}`
  );

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível carregar a ficha técnica."
      )
    );
  }

  const dados = await response.json();

  return dados.map((item: any) => ({
    idFichaTecnica: item.idFichaTecnica,
    idInsumo: item.insumo.idInsumo,
    quantidadeUtilizada: Number(item.quantidadeUtilizada),
  }));
}

export async function cadastrarFichaTecnica(
  idProcedimento: number,
  idInsumo: number,
  quantidadeUtilizada: number
): Promise<FichaTecnicaItem> {
  const params = new URLSearchParams({
    idProcedimento: String(idProcedimento),
    idInsumo: String(idInsumo),
    quantidadeUtilizada: String(quantidadeUtilizada),
  });

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível adicionar o insumo à ficha técnica."
      )
    );
  }

  const item = await response.json();

  return {
    idFichaTecnica: item.idFichaTecnica,
    idInsumo: item.insumo.idInsumo,
    quantidadeUtilizada: Number(item.quantidadeUtilizada),
  };
}

export async function editarFichaTecnica(
  idFichaTecnica: number,
  quantidadeUtilizada: number
): Promise<FichaTecnicaItem> {
  const params = new URLSearchParams({
    quantidadeUtilizada: String(quantidadeUtilizada),
  });

  const response = await fetch(
    `${API_URL}/${idFichaTecnica}?${params.toString()}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível editar a ficha técnica."
      )
    );
  }

  const item = await response.json();

  return {
    idFichaTecnica: item.idFichaTecnica,
    idInsumo: item.insumo.idInsumo,
    quantidadeUtilizada: Number(item.quantidadeUtilizada),
  };
}

export async function excluirFichaTecnica(
  idFichaTecnica: number
): Promise<void> {
  const response = await fetch(`${API_URL}/${idFichaTecnica}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível remover o insumo da ficha técnica."
      )
    );
  }
}

export async function possuiInsumos(
  idProcedimento: number
): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/procedimento/${idProcedimento}/possui-insumos`
  );

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível verificar os insumos da ficha técnica."
      )
    );
  }

  return response.json();
}