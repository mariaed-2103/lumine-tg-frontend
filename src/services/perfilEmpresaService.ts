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

export async function cadastrarPerfilEmpresa(
  dados: PerfilEmpresaCadastro
): Promise<PerfilEmpresaResponse> {
  const response = await fetch("http://localhost:8080/perfis-empresa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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