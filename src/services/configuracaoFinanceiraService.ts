import type { ConfiguracaoFinanceira } from "@/components/financeiro/types";

const API_URL = "http://localhost:8080/configuracoes-financeiras";

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
const response = await fetch(
`${API_URL}/perfil/${idPerfilEmpresa}`
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

const response = await fetch(
`${API_URL}/perfil/${idPerfilEmpresa}`,
{
method: metodo,
headers: {
"Content-Type": "application/json",
},
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
