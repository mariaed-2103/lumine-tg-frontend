export interface PerfilEmpresaCadastro {
  idUsuario: number;
  nomeProfissional: string;
  nomeClinica: string;
  logotipo: string;
  telefone: string;
  cnpj: string;
  diasTrabalhadosMes: number;
  horasDisponiveisDia: number;
}

export interface PerfilEmpresaResponse {
  idPerfilEmpresa: number;
  idUsuario: number;
  nomeProfissional: string;
  nomeClinica: string;
  logotipo: string;
  telefone: string;
  cnpj: string;
  diasTrabalhadosMes: number;
  horasDisponiveisDia: number;
}

import { apiFetch } from "@/services/api";

export async function cadastrarPerfilEmpresa(
  dados: PerfilEmpresaCadastro
): Promise<PerfilEmpresaResponse> {
  const response = await apiFetch("/perfis-empresa", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await response.text();
    throw new Error(
      mensagem || "Erro ao cadastrar perfil da empresa."
    );
  }

  return response.json();
}

/**
 * Busca o perfil da empresa do usuário logado.
 * Retorna null quando o perfil não existe (404) ou em caso de falha.
 *
 * O backend expõe apenas GET /perfis-empresa/usuario/{idUsuario}
 * (validado contra o usuário do token JWT).
 */
export async function buscarPerfilEmpresa(): Promise<PerfilEmpresaResponse | null> {
  try {
    const idUsuario = localStorage.getItem("idUsuario");
    if (!idUsuario) return null;

    const response = await apiFetch(`/perfis-empresa/usuario/${idUsuario}`);
    if (response.status === 404) return null;
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
