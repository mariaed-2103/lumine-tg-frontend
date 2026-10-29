import { apiPublicFetch } from "@/services/api";

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
export interface UsuarioLogin {
  email: string;
  senha: string;
}

export async function loginUsuario(
  dados: UsuarioLogin
): Promise<UsuarioResponse> {
  const response = await apiPublicFetch("/usuarios/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await response.text();
    let mensagemUsuario = "Não foi possível entrar. Confira seu e-mail e senha e tente novamente.";
    try {
      const body = JSON.parse(mensagem);
      mensagemUsuario = body.mensagem ?? body.message ?? mensagemUsuario;
    } catch { /* usa mensagem padrão */ }

    throw new Error(mensagemUsuario);
  }

  return response.json();
}
