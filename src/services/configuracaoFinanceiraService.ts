import type { ConfiguracaoFinanceira } from "@/components/financeiro/types";
import { apiFetch } from "@/services/api";

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

export async function buscarConfiguracaoFinanceira(
  idPerfilEmpresa: number
): Promise<ConfiguracaoFinanceira> {
  const response = await apiFetch(
    `/configuracoes-financeiras/perfil/${idPerfilEmpresa}`
  );

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
  idPerfilEmpresa: number,
  dados: ConfiguracaoFinanceira
): Promise<ConfiguracaoFinanceira> {
  const metodo =
    dados.idConfiguracao != null ? "PUT" : "POST";

  const response = await apiFetch(
    `/configuracoes-financeiras/perfil/${idPerfilEmpresa}`,
    {
      method: metodo,
      body: JSON.stringify({
        margemSeguranca: dados.margemSeguranca,
        lucroDesejado: dados.lucroDesejado,
        provisaoFeriasAtiva: dados.provisaoFeriasAtiva,
        percentualProvisaoFerias:
          dados.percentualProvisaoFerias,
      }),
    }
  );

  if (!response.ok) {
    const mensagem = await obterMensagemErro(
      response,
      "Não foi possível salvar a configuração financeira."
    );

    throw new Error(mensagem);
  }

  return response.json();
}
