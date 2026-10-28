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
