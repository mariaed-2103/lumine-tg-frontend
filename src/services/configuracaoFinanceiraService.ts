import type { ConfiguracaoFinanceira } from "@/components/financeiro/types";

/**
 * ATENÇÃO: o endpoint "/configuracao-financeira" é uma convenção provisória
 * seguindo o padrão de nomenclatura em português já usado em "/procedimentos"
 * e "/insumos". Confirmar com o time de backend antes de subir para produção.
 *
 * Esta entidade é 1:1 por empresa — não há lista nem exclusão.
 * O backend deve retornar 404 caso a configuração ainda não exista,
 * e criar o registro automaticamente no primeiro PUT, ou aceitar POST.
 */
const API_URL = "http://localhost:8080/configuracao-financeira";

async function obterMensagemErro(
  response: Response,
  mensagemPadrao: string
): Promise<string> {
  try {
    const erro = await response.json();
    if (erro?.message) return erro.message;
    if (erro?.mensagem) return erro.mensagem;
    return mensagemPadrao;
  } catch {
    return mensagemPadrao;
  }
}

export async function buscarConfiguracaoFinanceira(): Promise<ConfiguracaoFinanceira> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível carregar a configuração financeira."
    );
    throw new Error(mensagem);
  }

  return response.json();
}

export async function salvarConfiguracaoFinanceira(
  dados: ConfiguracaoFinanceira
): Promise<ConfiguracaoFinanceira> {
  // Usa PUT se já tiver ID (atualização), POST se for criação inicial
  const method = dados.idConfiguracao !== undefined ? "PUT" : "POST";
  const url =
    dados.idConfiguracao !== undefined
      ? `${API_URL}/${dados.idConfiguracao}`
      : API_URL;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível salvar a configuração financeira."
    );
    throw new Error(mensagem);
  }

  return response.json();
}
