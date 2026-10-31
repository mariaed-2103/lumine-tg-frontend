import { apiFetch } from "@/services/api";
import type { Atendimento } from "@/components/atendimentos/types";
import type { DespesaFixa, DespesaVariavel, FormaPagamento } from "@/components/financeiro/types";
import type { Insumo } from "@/components/insumos/types";
import type { PerfilEmpresaResponse } from "@/services/perfilEmpresaService";
import { listarFichaTecnica } from "@/services/fichaTecnicaService";
import { mapearAtendimento } from "@/services/atendimentoService";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const arredondar = (valor: number) => Number.isFinite(valor) ? Math.round(valor * 100) / 100 : 0;
const percentual = (valor: number) => Number.isFinite(valor) ? Math.round(valor * 10) / 10 : 0;
const numero = (valor: unknown) => { const convertido = Number(valor ?? 0); return Number.isFinite(convertido) ? convertido : 0; };

export interface DashboardData {
  competencia: { ano: number; mes: number };
  perfil: { nomeProfissional: string };
  resumo: { entradasMes: number; lucroReal: number; margemMedia: number; prejuizoImprevistos: number; qtdAtendimentos: number; variacao: { entradasMes: number; lucroReal: number; margemMedia: number; prejuizoImprevistos: number; qtdAtendimentos: number } };
  configuracao: { lucroDesejado: number };
  historico: { ano: number; mes: number; entradas: number; despesas: number; lucroReal: number }[];
  composicaoCustos: { categoria: string; valor: number }[];
  procedimentos: { nome: string; idProcedimento?: number; qtdAtendimentos: number; lucroTotal: number; margem: number | null }[];
  insumosEstoqueBaixo: { nome: string; unidadeMedida: string; estoqueAtual: number; estoqueMinimo: number }[];
  ultimosAtendimentos: { data: string; nomeCliente: string; procedimento: string; valorCobrado: number; formaPagamento: string; teveImprevisto: boolean }[];
  imprevistos: { tempoAdicionalMin: number; desperdicioMateriais: number };
}

type DadosDesconhecidos = Record<string, any>;
type DadosMes = { atendimentos: Atendimento[]; fixas: DespesaFixa[]; variaveis: DespesaVariavel[]; insumos: Insumo[]; config: DadosDesconhecidos | null; perfil: PerfilEmpresaResponse | null; formas: FormaPagamento[] };

async function jsonDaApi<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint);
  if (!response.ok) throw new Error(`${endpoint} respondeu HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
function dataDoAtendimento(atendimento: Atendimento): Date | null {
  const localDate = atendimento.dataAtendimento || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return null;
  const date = new Date(`${localDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
function pertenceAoMes(atendimento: Atendimento, ano: number, mes: number) {
  const data = dataDoAtendimento(atendimento);
  return data !== null && data.getFullYear() === ano && data.getMonth() + 1 === mes;
}
function somar<T>(lista: T[], obter: (item: T) => number) { return lista.reduce((total, item) => total + numero(obter(item)), 0); }
function despesaDaCompetencia(item: DespesaVariavel, ano: number, mes: number) {
  const date = new Date(`${item.data}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === ano && date.getMonth() + 1 === mes;
}
function calcularTaxas(atendimentos: Atendimento[], taxas: Map<number, number>) {
  return somar(atendimentos, (a) => numero(a.valorCobrado) * (taxas.get(a.idFormaPagamento) ?? 0) / 100);
}
function percentualVariacao(atual: number, anterior: number) {
  if (!anterior) return atual === 0 ? 0 : 100;
  return percentual(((atual - anterior) / Math.abs(anterior)) * 100);
}

export async function getDashboard(ano: number, mes: number): Promise<DashboardData> {
  const idUsuario = typeof window !== "undefined" ? localStorage.getItem("idUsuario") : null;
  const endpointPerfil = idUsuario ? `/perfis-empresa/usuario/${encodeURIComponent(idUsuario)}` : "/perfil-empresa";
  const historicoCompetencias = Array.from({ length: 6 }, (_, i) => {
    const data = new Date(ano, mes - 1 - (5 - i), 1);
    return { ano: data.getFullYear(), mes: data.getMonth() + 1 };
  });
  const endpointVariavel = (comp: { ano: number; mes: number }) => `/despesas-variaveis?mes=${comp.mes}&ano=${comp.ano}`;
  const endpoints = [
    `/atendimentos?mes=${mes}&ano=${ano}`,
    "/atendimentos",
    "/despesas-fixas",
    endpointVariavel({ ano, mes }),
    "/insumos",
    "/configuracoes-financeiras",
    endpointPerfil,
    "/formas-pagamento",
    ...historicoCompetencias.filter((c) => c.ano !== ano || c.mes !== mes).map(endpointVariavel),
  ];
  const results = await Promise.allSettled(endpoints.map((endpoint) => jsonDaApi<any>(endpoint)));
  const [mensaisResult, todosResult, fixasResult, variaveisResult, insumosResult, configResult, perfilResult, formasResult, ...variaveisHistoricas] = results;
  if (mensaisResult.status === "rejected") throw mensaisResult.reason;
  const fallback = <T,>(result: PromiseSettledResult<T>, endpoint: string, defaultValue: T): T => {
    if (result.status === "fulfilled") return result.value;
    console.warn(`[Dashboard] Falha ao carregar ${endpoint}:`, result.reason);
    return defaultValue;
  };
  const atendimentoDoMes = (fallback(mensaisResult, endpoints[0], []) as any[]).map(mapearAtendimento);
  const atendimentosHistoricosApi = (fallback(todosResult, endpoints[1], []) as any[]).map(mapearAtendimento);
  const idsDoMes = new Set(atendimentoDoMes.map((a) => a.idAtendimento));
  const todosAtendimentos = [...atendimentosHistoricosApi.filter((a) => !idsDoMes.has(a.idAtendimento)), ...atendimentoDoMes];
  const despesasFixas = fallback(fixasResult, endpoints[2], []) as DespesaFixa[];
  const despesasVariaveis = fallback(variaveisResult, endpoints[3], []) as DespesaVariavel[];
  const insumos = fallback(insumosResult, endpoints[4], []) as Insumo[];
  const config = fallback(configResult, endpoints[5], null) as DadosDesconhecidos | null;
  const perfil = fallback(perfilResult, endpoints[6], null) as PerfilEmpresaResponse | null;
  const formas = fallback(formasResult, endpoints[7], []) as FormaPagamento[];
  const historicoDespesas = new Map<string, DespesaVariavel[]>();
  let historicalIndex = 0;
  for (const comp of historicoCompetencias) {
    if (comp.ano === ano && comp.mes === mes) historicoDespesas.set(`${comp.ano}-${comp.mes}`, despesasVariaveis);
    else {
      const result = variaveisHistoricas[historicalIndex];
      const endpoint = endpoints[8 + historicalIndex];
      historicoDespesas.set(`${comp.ano}-${comp.mes}`, fallback(result, endpoint, []) as DespesaVariavel[]);
      historicalIndex += 1;
    }
  }
  const taxas = new Map(formas.map((forma) => [forma.idFormaPagamento, numero(forma.taxaPercentual)]));
  const atendimentosMes = atendimentoDoMes.filter((a) => pertenceAoMes(a, ano, mes));
  const fixasMes = somar(despesasFixas, (d) => d.valor);
  const variaveisMes = somar(despesasVariaveis.filter((d) => despesaDaCompetencia(d, ano, mes)), (d) => d.valor);
  const entradasMes = somar(atendimentosMes, (a) => a.valorCobrado);
  const taxasMes = calcularTaxas(atendimentosMes, taxas);
  const tempoAdicionalMin = somar(atendimentosMes, (a) => a.tempoAdicional);
  const desperdicioMateriais = somar(atendimentosMes, (a) => a.desperdicioMateriais);
  const diasTrabalhados = numero(perfil?.diasTrabalhadosMes);
  const horasDisponiveis = numero(perfil?.horasDisponiveisDia);
  const custoFixoPorMinuto = diasTrabalhados > 0 && horasDisponiveis > 0 ? fixasMes / (diasTrabalhados * horasDisponiveis * 60) : 0;
  const imprevistosMes = arredondar(tempoAdicionalMin * custoFixoPorMinuto + desperdicioMateriais);

  const idsProcedimentos = [...new Set(todosAtendimentos.map((a) => a.idProcedimento).filter((id) => id > 0))];
  const fichasResult = await Promise.allSettled(idsProcedimentos.map((id) => listarFichaTecnica(id)));
  const custosPorProcedimento = new Map<number, number>();
  const custosConhecidos = new Set<number>();
  for (let i = 0; i < fichasResult.length; i += 1) {
    const result = fichasResult[i];
    if (result.status === "rejected") {
      console.warn(`[Dashboard] Falha ao carregar /fichas-tecnicas/procedimento/${idsProcedimentos[i]}:`, result.reason);
      continue;
    }
    const ficha = result.value as (typeof result.value[number] & { custoUnitario?: number; valorUnitario?: number })[];
    const possuiCustosUnitarios = ficha.every((item) => {
      const insumo = insumos.find((x) => x.idInsumo === item.idInsumo) as (Insumo & { custoUnitario?: number; valorUnitario?: number }) | undefined;
      return item.custoUnitario != null || item.valorUnitario != null || insumo?.custoUnitario != null || insumo?.valorUnitario != null;
    });
    const custo = ficha.reduce((total, item) => {
      const insumo = insumos.find((x) => x.idInsumo === item.idInsumo) as (Insumo & { custoUnitario?: number; valorUnitario?: number }) | undefined;
      const unitario = numero(item.custoUnitario ?? item.valorUnitario ?? insumo?.custoUnitario ?? insumo?.valorUnitario);
      return total + numero(item.quantidadeUtilizada) * unitario;
    }, 0);
    custosPorProcedimento.set(idsProcedimentos[i], custo);
    if (possuiCustosUnitarios) custosConhecidos.add(idsProcedimentos[i]);
  }
  const custoInsumos = somar(atendimentosMes, (a) => custosPorProcedimento.get(a.idProcedimento) ?? 0);
  const custoProporcionalDisponivel = atendimentosMes.every((a) => custosConhecidos.has(a.idProcedimento));

  const resumoHistorico = (comp: { ano: number; mes: number }) => {
    const atendimentos = todosAtendimentos.filter((a) => pertenceAoMes(a, comp.ano, comp.mes));
    const entradas = somar(atendimentos, (a) => a.valorCobrado);
    const despesasVariaveisDoMes = (historicoDespesas.get(`${comp.ano}-${comp.mes}`) ?? []).filter((d) => despesaDaCompetencia(d, comp.ano, comp.mes));
    const fixas = somar(despesasFixas, (d) => d.valor);
    const variaveis = somar(despesasVariaveisDoMes, (d) => d.valor);
    const tempo = somar(atendimentos, (a) => a.tempoAdicional);
    const desperdicio = somar(atendimentos, (a) => a.desperdicioMateriais);
    const imprevistos = arredondar(tempo * custoFixoPorMinuto + desperdicio);
    const taxasPagamento = calcularTaxas(atendimentos, taxas);
    const custoInsumosHistorico = somar(atendimentos, (a) => custosPorProcedimento.get(a.idProcedimento) ?? 0);
    const despesas = arredondar(fixas + variaveis + imprevistos + taxasPagamento + custoInsumosHistorico);
    return { ...comp, entradas: arredondar(entradas), despesas, lucroReal: arredondar(entradas - despesas) };
  };
  const historico = historicoCompetencias.map(resumoHistorico);
  const atual = historico.at(-1)!;
  const anterior = historico.at(-2);
  const margemMedia = entradasMes > 0 ? percentual((atual.lucroReal / entradasMes) * 100) : 0;
  const atendimentosPorProcedimento = new Map<number, Atendimento[]>();
  for (const atendimento of atendimentosMes) {
    const grupo = atendimentosPorProcedimento.get(atendimento.idProcedimento) ?? [];
    grupo.push(atendimento);
    atendimentosPorProcedimento.set(atendimento.idProcedimento, grupo);
  }
  const procedimentos = [...atendimentosPorProcedimento.entries()].map(([idProcedimento, lista]) => {
    const bruto = somar(lista, (a) => a.valorCobrado);
    const custos = somar(lista, (a) => custosPorProcedimento.get(a.idProcedimento) ?? 0);
    const lucro = arredondar(bruto - custos);
    return { idProcedimento, nome: lista[0]?.nomeProcedimento || "Procedimento", qtdAtendimentos: lista.length, lucroTotal: lucro, margem: custoProporcionalDisponivel && bruto > 0 ? percentual((lucro / bruto) * 100) : null };
  }).sort((a, b) => b.lucroTotal - a.lucroTotal);
  const atendimentosRecentes = [...atendimentosMes].sort((a, b) => (dataDoAtendimento(b)?.getTime() ?? 0) - (dataDoAtendimento(a)?.getTime() ?? 0)).slice(0, 5);
  return {
    competencia: { ano, mes }, perfil: { nomeProfissional: perfil?.nomeProfissional ?? "" },
    resumo: {
      entradasMes: arredondar(entradasMes), lucroReal: atual.lucroReal, margemMedia, prejuizoImprevistos: imprevistosMes, qtdAtendimentos: atendimentosMes.length,
      variacao: {
        entradasMes: percentualVariacao(atual.entradas, anterior?.entradas ?? 0), lucroReal: percentualVariacao(atual.lucroReal, anterior?.lucroReal ?? 0),
        margemMedia: percentual(margemMedia - (anterior && anterior.entradas > 0 ? percentual(anterior.lucroReal / anterior.entradas * 100) : 0)),
        prejuizoImprevistos: percentualVariacao(imprevistosMes, anterior ? (() => { const atendimentosAnteriores = todosAtendimentos.filter((a) => pertenceAoMes(a, anterior.ano, anterior.mes)); return arredondar(somar(atendimentosAnteriores, (a) => a.tempoAdicional) * custoFixoPorMinuto + somar(atendimentosAnteriores, (a) => a.desperdicioMateriais)); })() : 0),
        qtdAtendimentos: percentualVariacao(atendimentosMes.length, anterior ? todosAtendimentos.filter((a) => pertenceAoMes(a, anterior.ano, anterior.mes)).length : 0),
      },
    },
    configuracao: { lucroDesejado: numero(config?.lucroDesejado) },
    historico,
    composicaoCustos: [{ categoria: "Despesas fixas", valor: arredondar(fixasMes) }, { categoria: "Insumos", valor: arredondar(custoInsumos) }, { categoria: "Despesas variáveis", valor: arredondar(variaveisMes) }, { categoria: "Imprevistos", valor: imprevistosMes }, { categoria: "Taxas de pagamento", valor: arredondar(taxasMes) }],
    procedimentos,
    insumosEstoqueBaixo: insumos.filter((i) => numero(i.estoqueAtual) <= numero(i.estoqueMinimo)).map((i) => ({ nome: i.nome, unidadeMedida: i.unidadeMedida, estoqueAtual: numero(i.estoqueAtual), estoqueMinimo: numero(i.estoqueMinimo) })),
    ultimosAtendimentos: atendimentosRecentes.map((a) => ({ data: a.dataAtendimento, nomeCliente: a.nomeCliente || "Cliente", procedimento: a.nomeProcedimento || "Procedimento", valorCobrado: numero(a.valorCobrado), formaPagamento: formas.find((f) => f.idFormaPagamento === a.idFormaPagamento)?.nome ?? a.nomeFormaPagamento ?? "", teveImprevisto: numero(a.tempoAdicional) > 0 || numero(a.desperdicioMateriais) > 0 })),
    imprevistos: { tempoAdicionalMin, desperdicioMateriais: arredondar(desperdicioMateriais) },
  };
}

export { MESES as meses };
