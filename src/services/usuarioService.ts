export interface UsuarioCadastro {
  email: string;
  senha: string;
}

export interface UsuarioResponse {
  idUsuario: number;
  email: string;
}

export async function cadastrarUsuario(
  dados: UsuarioCadastro
): Promise<UsuarioResponse> {
  const response = await fetch("http://localhost:8080/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await response.text();
    throw new Error(mensagem || "Erro ao cadastrar usuário.");
  }

  return response.json();
}