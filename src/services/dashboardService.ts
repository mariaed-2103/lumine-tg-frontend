import { apiFetch } from "@/services/api";
import type { Atendimento } from "@/components/atendimentos/types";
import type { DespesaFixa, DespesaVariavel, FormaPagamento } from "@/components/financeiro/types";
import type { Insumo } from "@/components/insumos/types";
import type { PerfilEmpresaResponse } from "@/services/perfilEmpresaService";
import { listarFichaTecnica } from "@/services/fichaTecnicaService";
import { mapearAtendimento } from "@/services/atendimentoService";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const arredondar = (valor: number) => (Number.isFinite(valor) ? Math.round(valor * 100) / 100 : 0);
const percentual = (valor: number) => (Number.isFinite(valor) ? Math.round(valor * 10) / 10 : 0);
const numero = (valor: unknown) => {
  const convertido = Number(valor ?? 0);
  return Number.isFinite(convertido) ? convertido : 0;
};

export interface DashboardData {
  competencia: { ano: number; mes: number };
  perfil: { nomeProfissional: string };
  resumo: {
    entradasMes: number;
    lucroReal: number;
    margemMedia: number;
    prejuizoImprevistos: number;
    qtdAtendimentos: number;
    variacao: {
      entradasMes: number | null;
      lucroReal: number | null;
      margemMedia: number | null;
      prejuizoImprevistos: number | null;
      qtdAtendimentos: number | null;
    };
  };
  configuracao: { lucroDesejado: number };
  historico: { ano: number; mes: number; entradas: number; despesas: number; lucroReal: number }[];
  composicaoCustos: { categoria: string; valor: number }[];
  procedimentos: {
    nome: string;
    idProcedimento?: number;
    qtdAtendimentos: number;
    lucroTotal: number;
    margem: number | null;
  }[];
  insumosEstoqueBaixo: {
    nome: string;
    unidadeMedida: string;
    estoqueAtual: number;
    estoqueMinimo: number;
  }[];
  ultimosAtendimentos: {
    idAtendimento: number;
    data: string;
    nomeCliente: string;
    procedimento: string;
    valorCobrado: number;
    formaPagamento: string;
    teveImprevisto: boolean;
  }[];
  imprevistos: { tempoAdicionalMin: number; desperdicioMateriais: number };
  avisos: string[];
}

type DadosDesconhecidos = Record<string, unknown>;
type DadosMes = {
  atendimentos: Atendimento[];
  fixas: DespesaFixa[];
  variaveis: DespesaVariavel[];
  insumos: Insumo[];
  config: DadosDesconhecidos | null;
  perfil: PerfilEmpresaResponse | null;
  formas: FormaPagamento[];
};

async function jsonDaApi<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint);
  if (!response.ok) throw new Error(`${endpoint} respondeu HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
function arrayFromApi<T>(value: unknown, endpoint: string, aviso: string, avisos: string[]): T[] {
  if (Array.isArray(value)) return value;
  console.warn(`[Dashboard] Resposta inválida de ${endpoint}; esperada uma lista.`);
  avisos.push(aviso);
  return [];
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
function somar<T>(lista: T[], obter: (item: T) => number) {
  return lista.reduce((total, item) => total + numero(obter(item)), 0);
}
function despesaDaCompetencia(item: DespesaVariavel, ano: number, mes: number) {
  const date = new Date(`${item.data}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === ano && date.getMonth() + 1 === mes;
}
function despesaFixaAtivaNaCompetencia(item: DespesaFixa, ano: number, mes: number) {
  const inicioMes = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fimMes = `${ano}-${String(mes).padStart(2, "0")}-${String(new Date(ano, mes, 0).getDate()).padStart(2, "0")}`;
  return item.dataInicio <= fimMes && (!item.dataFim || item.dataFim >= inicioMes);
}
function calcularTaxas(atendimentos: Atendimento[], taxas: Map<number, number>) {
  return somar(
    atendimentos,
    (a) => (numero(a.valorCobrado) * (taxas.get(a.idFormaPagamento) ?? 0)) / 100,
  );
}
function percentualVariacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return percentual(((atual - anterior) / Math.abs(anterior)) * 100);
}

export async function getDashboard(ano: number, mes: number): Promise<DashboardData> {
  const idUsuario = typeof window !== "undefined" ? localStorage.getItem("idUsuario") : null;
  const endpointPerfil = idUsuario
    ? `/perfis-empresa/usuario/${encodeURIComponent(idUsuario)}`
    : "/perfil-empresa";
  const historicoCompetencias = Array.from({ length: 6 }, (_, i) => {
    const data = new Date(ano, mes - 1 - (5 - i), 1);
    return { ano: data.getFullYear(), mes: data.getMonth() + 1 };
  });
  const endpointVariavel = (comp: { ano: number; mes: number }) =>
    `/despesas-variaveis?mes=${comp.mes}&ano=${comp.ano}`;
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
  const endpointAt = (index: number) => {
    const endpoint = endpoints[index];
    if (!endpoint) throw new Error(`Endpoint do dashboard ausente na posição ${index}.`);
    return endpoint;
  };
  const results = await Promise.allSettled(
    endpoints.map((endpoint) => jsonDaApi<unknown>(endpoint)),
  );
  const [
    mensaisResult,
    todosResult,
    fixasResult,
    variaveisResult,
    insumosResult,
    configResult,
    perfilResult,
    formasResult,
    ...variaveisHistoricas
  ] = results;
  if (!mensaisResult) throw new Error("A resposta do endpoint mensal está ausente.");
  if (mensaisResult.status === "rejected") throw mensaisResult.reason;
  const avisos: string[] = [];
  const fallback = <T>(
    result: PromiseSettledResult<T> | undefined,
    endpoint: string,
    defaultValue: T,
    aviso = endpoint,
  ): T => {
    if (!result) throw new Error(`A resposta de ${endpoint} está ausente.`);
    if (result.status === "fulfilled") return result.value;
    console.warn(`[Dashboard] Falha ao carregar ${endpoint}:`, result.reason);
    avisos.push(aviso);
    return defaultValue;
  };
  const atendimentoDoMes = arrayFromApi<unknown>(
    fallback(mensaisResult, endpointAt(0), []),
    endpointAt(0),
    "atendimentos do mês",
    avisos,
  ).map(mapearAtendimento);
  const atendimentosHistoricosApi = arrayFromApi<unknown>(
    fallback(todosResult, endpointAt(1), []),
    endpointAt(1),
    "histórico de atendimentos",
    avisos,
  ).map(mapearAtendimento);
  const idsDoMes = new Set(atendimentoDoMes.map((a) => a.idAtendimento));
  const todosAtendimentos = [
    ...atendimentosHistoricosApi.filter((a) => !idsDoMes.has(a.idAtendimento)),
    ...atendimentoDoMes,
  ];
  const despesasFixas = fallback(fixasResult, endpointAt(2), [], "despesas fixas") as DespesaFixa[];
  const despesasVariaveis = fallback(
    variaveisResult,
    endpointAt(3),
    [],
    "despesas variáveis",
  ) as DespesaVariavel[];
  const insumos = fallback(insumosResult, endpointAt(4), [], "insumos") as Insumo[];
  const config = fallback(
    configResult,
    endpointAt(5),
    null,
    "configuração financeira",
  ) as DadosDesconhecidos | null;
  const perfil = fallback(
    perfilResult,
    endpointAt(6),
    null,
    "perfil da empresa",
  ) as PerfilEmpresaResponse | null;
  const formas = fallback(
    formasResult,
    endpointAt(7),
    [],
    "formas de pagamento",
  ) as FormaPagamento[];
  const historicoDespesas = new Map<string, DespesaVariavel[]>();
  let historicalIndex = 0;
  for (const comp of historicoCompetencias) {
    if (comp.ano === ano && comp.mes === mes)
      historicoDespesas.set(`${comp.ano}-${comp.mes}`, despesasVariaveis);
    else {
      const result = variaveisHistoricas[historicalIndex];
      const endpoint = endpointAt(8 + historicalIndex);
      historicoDespesas.set(
        `${comp.ano}-${comp.mes}`,
        fallback(result, endpoint, [], "histórico de despesas variáveis") as DespesaVariavel[],
      );
      historicalIndex += 1;
    }
  }
  const taxas = new Map(
    formas.map((forma) => [forma.idFormaPagamento, numero(forma.taxaPercentual)]),
  );
  const atendimentosMes = atendimentoDoMes.filter((a) => pertenceAoMes(a, ano, mes));
  const fixasNaCompetencia = (competencia: { ano: number; mes: number }) =>
    somar(
      despesasFixas.filter((despesa) =>
        despesaFixaAtivaNaCompetencia(despesa, competencia.ano, competencia.mes),
      ),
      (despesa) => despesa.valor,
    );
  const fixasMes = fixasNaCompetencia({ ano, mes });
  const variaveisMes = somar(
    despesasVariaveis.filter((d) => despesaDaCompetencia(d, ano, mes)),
    (d) => d.valor,
  );
  const entradasMes = somar(atendimentosMes, (a) => a.valorCobrado);
  const taxasMes = calcularTaxas(atendimentosMes, taxas);
  const tempoAdicionalMin = somar(atendimentosMes, (a) => a.tempoAdicional);
  const desperdicioMateriais = somar(atendimentosMes, (a) => a.desperdicioMateriais);
  const diasTrabalhados = numero(perfil?.diasTrabalhadosMes);
  const horasDisponiveis = numero(perfil?.horasDisponiveisDia);
  const imprevistosDaCompetencia = (
    competencia: { ano: number; mes: number },
    tempoAdicional: number,
    desperdicio: number,
  ) => {
    const fixas = fixasNaCompetencia(competencia);
    const custoFixoPorMinuto =
      diasTrabalhados > 0 && horasDisponiveis > 0
        ? fixas / (diasTrabalhados * horasDisponiveis * 60)
        : 0;
    return arredondar(tempoAdicional * custoFixoPorMinuto + desperdicio);
  };
  const imprevistosMes = imprevistosDaCompetencia(
    { ano, mes },
    tempoAdicionalMin,
    desperdicioMateriais,
  );

  const idsProcedimentos = [
    ...new Set(todosAtendimentos.map((a) => a.idProcedimento).filter((id) => id > 0)),
  ];
  const fichasResult = await Promise.allSettled(
    idsProcedimentos.map((id) => listarFichaTecnica(id)),
  );
  const custosPorProcedimento = new Map<number, number>();
  const custosConhecidos = new Set<number>();
  for (let i = 0; i < fichasResult.length; i += 1) {
    const idProcedimento = idsProcedimentos[i];
    if (idProcedimento === undefined) continue;
    const result = fichasResult[i];
    if (!result) {
      console.warn(
        `[Dashboard] Resposta ausente para /fichas-tecnicas/procedimento/${idProcedimento}.`,
      );
      avisos.push("fichas técnicas");
      continue;
    }
    if (result.status === "rejected") {
      console.warn(
        `[Dashboard] Falha ao carregar /fichas-tecnicas/procedimento/${idProcedimento}:`,
        result.reason,
      );
      avisos.push("fichas técnicas");
      continue;
    }
    const ficha = result.value as ((typeof result.value)[number] & {
      custoUnitario?: number;
      valorUnitario?: number;
    })[];
    const possuiCustosUnitarios = ficha.every((item) => {
      const insumo = insumos.find((x) => x.idInsumo === item.idInsumo) as
        (Insumo & { custoUnitario?: number; valorUnitario?: number }) | undefined;
      return (
        item.custoUnitario != null ||
        item.valorUnitario != null ||
        insumo?.custoUnitario != null ||
        insumo?.valorUnitario != null
      );
    });
    const custo = ficha.reduce((total, item) => {
      const insumo = insumos.find((x) => x.idInsumo === item.idInsumo) as
        (Insumo & { custoUnitario?: number; valorUnitario?: number }) | undefined;
      const unitario = numero(
        item.custoUnitario ?? item.valorUnitario ?? insumo?.custoUnitario ?? insumo?.valorUnitario,
      );
      return total + numero(item.quantidadeUtilizada) * unitario;
    }, 0);
    custosPorProcedimento.set(idProcedimento, custo);
    if (possuiCustosUnitarios) custosConhecidos.add(idProcedimento);
  }
  const custoInsumos = somar(
    atendimentosMes,
    (a) => custosPorProcedimento.get(a.idProcedimento) ?? 0,
  );
  const custoProporcionalDisponivel = atendimentosMes.every((a) =>
    custosConhecidos.has(a.idProcedimento),
  );

  const resumoHistorico = (comp: { ano: number; mes: number }) => {
    const atendimentos = todosAtendimentos.filter((a) => pertenceAoMes(a, comp.ano, comp.mes));
    const entradas = somar(atendimentos, (a) => a.valorCobrado);
    const despesasVariaveisDoMes = (historicoDespesas.get(`${comp.ano}-${comp.mes}`) ?? []).filter(
      (d) => despesaDaCompetencia(d, comp.ano, comp.mes),
    );
    const fixas = fixasNaCompetencia(comp);
    const variaveis = somar(despesasVariaveisDoMes, (d) => d.valor);
    const tempo = somar(atendimentos, (a) => a.tempoAdicional);
    const desperdicio = somar(atendimentos, (a) => a.desperdicioMateriais);
    const imprevistos = imprevistosDaCompetencia(comp, tempo, desperdicio);
    const taxasPagamento = calcularTaxas(atendimentos, taxas);
    const custoInsumosHistorico = somar(
      atendimentos,
      (a) => custosPorProcedimento.get(a.idProcedimento) ?? 0,
    );
    const despesas = arredondar(
      fixas + variaveis + imprevistos + taxasPagamento + custoInsumosHistorico,
    );
    return {
      ...comp,
      entradas: arredondar(entradas),
      despesas,
      lucroReal: arredondar(entradas - despesas),
    };
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
  const procedimentos = [...atendimentosPorProcedimento.entries()]
    .map(([idProcedimento, lista]) => {
      const bruto = somar(lista, (a) => a.valorCobrado);
      const custos = somar(lista, (a) => custosPorProcedimento.get(a.idProcedimento) ?? 0);
      const lucro = arredondar(bruto - custos);
      return {
        idProcedimento,
        nome: lista[0]?.nomeProcedimento || "Procedimento",
        qtdAtendimentos: lista.length,
        lucroTotal: lucro,
        margem: custoProporcionalDisponivel && bruto > 0 ? percentual((lucro / bruto) * 100) : null,
      };
    })
    .sort((a, b) => b.lucroTotal - a.lucroTotal);
  const atendimentosRecentes = [...atendimentosMes]
    .sort((a, b) => (dataDoAtendimento(b)?.getTime() ?? 0) - (dataDoAtendimento(a)?.getTime() ?? 0))
    .slice(0, 5);
  return {
    competencia: { ano, mes },
    perfil: { nomeProfissional: perfil?.nomeProfissional ?? "" },
    resumo: {
      entradasMes: arredondar(entradasMes),
      lucroReal: atual.lucroReal,
      margemMedia,
      prejuizoImprevistos: imprevistosMes,
      qtdAtendimentos: atendimentosMes.length,
      variacao: {
        entradasMes: percentualVariacao(atual.entradas, anterior?.entradas ?? 0),
        lucroReal: percentualVariacao(atual.lucroReal, anterior?.lucroReal ?? 0),
        margemMedia:
          anterior && anterior.entradas > 0
            ? percentual(margemMedia - percentual((anterior.lucroReal / anterior.entradas) * 100))
            : null,
        prejuizoImprevistos: percentualVariacao(
          imprevistosMes,
          anterior
            ? (() => {
                const atendimentosAnteriores = todosAtendimentos.filter((a) =>
                  pertenceAoMes(a, anterior.ano, anterior.mes),
                );
                return imprevistosDaCompetencia(
                  anterior,
                  somar(atendimentosAnteriores, (a) => a.tempoAdicional),
                  somar(atendimentosAnteriores, (a) => a.desperdicioMateriais),
                );
              })()
            : 0,
        ),
        qtdAtendimentos: percentualVariacao(
          atendimentosMes.length,
          anterior
            ? todosAtendimentos.filter((a) => pertenceAoMes(a, anterior.ano, anterior.mes)).length
            : 0,
        ),
      },
    },
    configuracao: { lucroDesejado: numero(config?.["lucroDesejado"]) },
    historico,
    composicaoCustos: [
      { categoria: "Despesas fixas", valor: arredondar(fixasMes) },
      { categoria: "Insumos", valor: arredondar(custoInsumos) },
      { categoria: "Despesas variáveis", valor: arredondar(variaveisMes) },
      { categoria: "Imprevistos", valor: imprevistosMes },
      { categoria: "Taxas de pagamento", valor: arredondar(taxasMes) },
    ],
    procedimentos,
    insumosEstoqueBaixo: insumos
      .filter((i) => numero(i.estoqueAtual) <= numero(i.estoqueMinimo))
      .map((i) => ({
        nome: i.nome,
        unidadeMedida: i.unidadeMedida,
        estoqueAtual: numero(i.estoqueAtual),
        estoqueMinimo: numero(i.estoqueMinimo),
      })),
    ultimosAtendimentos: atendimentosRecentes.map((a) => ({
      idAtendimento: a.idAtendimento,
      data: a.dataAtendimento,
      nomeCliente: a.nomeCliente || "Cliente",
      procedimento: a.nomeProcedimento || "Procedimento",
      valorCobrado: numero(a.valorCobrado),
      formaPagamento:
        formas.find((f) => f.idFormaPagamento === a.idFormaPagamento)?.nome ??
        a.nomeFormaPagamento ??
        "",
      teveImprevisto: numero(a.tempoAdicional) > 0 || numero(a.desperdicioMateriais) > 0,
    })),
    imprevistos: { tempoAdicionalMin, desperdicioMateriais: arredondar(desperdicioMateriais) },
    avisos,
  };
}

export { MESES as meses };
