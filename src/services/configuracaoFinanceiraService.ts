import type { ConfiguracaoFinanceira } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

export async function buscarConfiguracaoFinanceira(
  _idPerfilEmpresa?: number,
): Promise<ConfiguracaoFinanceira | null> {
  const response = await apiFetch("/configuracoes-financeiras");
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Não foi possível carregar a configuração financeira.");
  return response.json();
}

export async function salvarConfiguracaoFinanceira(
  _idPerfilEmpresa: number,
  dados: ConfiguracaoFinanceira,
): Promise<ConfiguracaoFinanceira> {
  const isEdicao = dados.idConfiguracao != null;
  const response = await apiFetch("/configuracoes-financeiras", {
    method: isEdicao ? "PUT" : "POST",
    body: JSON.stringify(dados),
  });
  if (!response.ok) {
    const texto = await response.text().catch(() => "");
    let mensagem = "Não foi possível salvar a configuração financeira.";
    try {
      const json = JSON.parse(texto);
      mensagem = json.mensagem ?? json.message ?? mensagem;
    } catch { /* mensagem padrão */ }
    throw new Error(mensagem);
  }
  return response.json();
}
