import { apiFetch } from "@/services/api";

// Campos mapeados a partir do SimulacaoPrecoResponseDTO real do backend.
export interface SimulacaoPrecoResponse {
  idProcedimento: number;
  nomeProcedimento: string;
  duracaoMinutos: number;
  custoInsumos: number;
  custoFixoPorMinuto: number;
  custoFixoProcedimento: number;
  custoProcedimento: number;
  margemSeguranca: number;
  lucroDesejado: number;
  precoSugerido: number;
}

export async function simularPreco(idProcedimento: number, mes: number, ano: number): Promise<SimulacaoPrecoResponse> {
  const response = await apiFetch(`/simulacoes-preco/procedimento/${idProcedimento}?mes=${mes}&ano=${ano}`);
  if (!response.ok) {
    const texto = await response.text().catch(() => "");
    let mensagem = "Não foi possível calcular a simulação de preço.";
    try {
      const json = JSON.parse(texto);
      mensagem = json.mensagem ?? json.message ?? mensagem;
    } catch { /* mensagem padrão */ }
    throw new Error(mensagem);
  }
  const raw = await response.json();
  return {
    idProcedimento: raw.idProcedimento,
    nomeProcedimento: raw.nomeProcedimento,
    duracaoMinutos: Number(raw.duracaoMinutos ?? 0),
    custoInsumos: Number(raw.custoTotalInsumos ?? 0),
    custoFixoPorMinuto: Number(raw.custoFixoPorMinuto ?? 0),
    custoFixoProcedimento: Number(raw.custoDoTempo ?? 0),
    custoProcedimento: Number(raw.custoTotal ?? 0),
    margemSeguranca: Number(raw.margemSeguranca ?? 0),
    lucroDesejado: Number(raw.lucroDesejado ?? 0),
    precoSugerido: Number(raw.precoSugerido ?? 0),
  };
}

export async function definirPrecoPadrao(idProcedimento: number, precoSugerido: number): Promise<void> {
  const response = await apiFetch(`/simulacoes-preco/procedimento/${idProcedimento}/preco-padrao`, {
    method: "PUT",
    body: JSON.stringify({ precoSugerido }),
  });
  if (!response.ok) {
    const texto = await response.text().catch(() => "");
    let mensagem = "Não foi possível definir o preço padrão.";
    try {
      const json = JSON.parse(texto);
      mensagem = json.mensagem ?? json.message ?? mensagem;
    } catch { /* mensagem padrão */ }
    throw new Error(mensagem);
  }
}
