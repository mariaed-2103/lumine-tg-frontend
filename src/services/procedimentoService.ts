import type { Procedimento } from "@/components/procedimentos/types";

const API_URL = "http://localhost:8080/procedimentos";

export type DadosProcedimento = {
  nome: string;
  duracaoMinutos: number;
  precoPadrao: number | null;
};

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
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível carregar os procedimentos."
      )
    );
  }

  const procedimentos = await response.json();

  return procedimentos.map((procedimento: Omit<Procedimento, "itensFichaTecnica">) => ({
    ...procedimento,
    itensFichaTecnica: [],
  }));
}

export async function buscarProcedimentoPorId(
  idProcedimento: number
): Promise<Procedimento> {
  const response = await fetch(`${API_URL}/${idProcedimento}`);

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível buscar o procedimento."
      )
    );
  }

  const procedimento = await response.json();

  return {
    ...procedimento,
    itensFichaTecnica: [],
  };
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
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível cadastrar o procedimento."
      )
    );
  }

  const procedimento = await response.json();

  return {
    ...procedimento,
    itensFichaTecnica: [],
  };
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
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível editar o procedimento."
      )
    );
  }

  const procedimento = await response.json();

  return {
    ...procedimento,
    itensFichaTecnica: [],
  };
}

export async function excluirProcedimento(
  idProcedimento: number
): Promise<void> {
  const response = await fetch(`${API_URL}/${idProcedimento}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível excluir o procedimento."
      )
    );
  }
}

export async function possuiFichaTecnica(
  idProcedimento: number
): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/${idProcedimento}/possui-ficha-tecnica`
  );

  if (!response.ok) {
    throw new Error(
      await obterMensagemErro(
        response,
        "Não foi possível verificar a ficha técnica."
      )
    );
  }

  return response.json();
}