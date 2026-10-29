const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export async function apiPublicFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

function obterToken(): string | null {
  try {
    return localStorage.getItem("tokenLumine");
  } catch {
    return null;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = obterToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resposta = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (resposta.status === 401 || (resposta.status === 403 && !token)) {
    localStorage.removeItem("tokenLumine");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("emailUsuario");
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  return resposta;
}
