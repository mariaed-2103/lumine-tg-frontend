import { apiFetch } from "@/services/api";
import type { Atendimento } from "@/components/atendimentos/types";
import type { DespesaFixa, DespesaVariavel, FormaPagamento } from "@/components/financeiro/types";
import type { Insumo } from "@/components/insumos/types";
import type { PerfilEmpresaResponse } from "@/services/perfilEmpresaService";
import { listarFichaTecnica } from "@/services/fichaTecnicaService";
import { mapearAtendimento } from "@/services/atendimentoService";
import { listarCustosUnitariosInsumos } from "@/services/custoInsumoService";

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
    lucroReal: number | null;
    margemMedia: number | null;
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
  historico: {
    ano: number;
    mes: number;
    entradas: number;
    despesas: number | null;
    lucroReal: number | null;
  }[];
  composicaoCustos: { categoria: string; valor: number | null }[];
  procedimentos: {
    nome: string;
    idProcedimento?: number;
    qtdAtendimentos: number;
    lucroTotal: number | null;
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
  let total = 0;
  let completo = true;
  for (const atendimento of atendimentos) {
    const taxa =
      taxas.get(atendimento.idFormaPagamento) ?? atendimento.taxaFormaPagamento;
    if (taxa == null || !Number.isFinite(taxa)) {
      completo = false;
      continue;
    }
    total += (numero(atendimento.valorCobrado) * taxa) / 100;
  }
  return { valor: arredondar(total), completo };
}
function percentualVariacao(
  atual: number | null,
  anterior: number | null,
): number | null {
  if (atual === null || anterior === null || anterior === 0) return null;
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
  const taxas = new Map(formas.map((forma) => [forma.idFormaPagamento, numero(forma.taxaPercentual)]));
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
  const [fichasResult, custosResult] = await Promise.all([
    Promise.allSettled(idsProcedimentos.map((id) => listarFichaTecnica(id))),
    Promise.allSettled(
      historicoCompetencias.map((competencia) => {
        const ultimoDia = new Date(competencia.ano, competencia.mes, 0).getDate();
        const dataLimite = `${competencia.ano}-${String(competencia.mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
        return listarCustosUnitariosInsumos(dataLimite);
      }),
    ),
  ]);
  const fichasPorProcedimento = new Map<
    number,
    Awaited<ReturnType<typeof listarFichaTecnica>>
  >();
  const custosPorCompetencia = new Map<string, Map<number, number | null>>();
  const competenciasSemCustos = new Set<string>();
  const avisosDeCustos = new Set<string>();
  const fimCompetencia = (competencia: { ano: number; mes: number }) => {
    const ultimoDia = new Date(competencia.ano, competencia.mes, 0).getDate();
    return `${competencia.ano}-${String(competencia.mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  };
  for (let i = 0; i < fichasResult.length; i += 1) {
    const idProcedimento = idsProcedimentos[i];
    const result = fichasResult[i];
    if (idProcedimento === undefined || !result) continue;
    if (result.status === "fulfilled") {
      fichasPorProcedimento.set(idProcedimento, result.value);
    } else {
      console.warn(
        `[Dashboard] Falha ao carregar ficha técnica do procedimento ${idProcedimento}:`,
        result.reason,
      );
      avisos.push("fichas técnicas");
    }
  }
  for (let i = 0; i < custosResult.length; i += 1) {
    const competencia = historicoCompetencias[i];
    const result = custosResult[i];
    if (!competencia || !result) continue;
    const chave = `${competencia.ano}-${competencia.mes}`;
    if (result.status === "rejected") {
      console.warn(
        `[Dashboard] Falha ao carregar custos dos insumos até ${fimCompetencia(competencia)}:`,
        result.reason,
      );
      competenciasSemCustos.add(chave);
      avisos.push("custos dos insumos");
      continue;
    }
    custosPorCompetencia.set(
      chave,
      new Map(result.value.map((item) => [item.idInsumo, item.custoUnitario])),
    );
  }

  const custosDosAtendimentos = (
    atendimentos: Atendimento[],
    competencia: { ano: number; mes: number },
  ) => {
    if (atendimentos.length === 0) return { valor: 0, faltantes: [] as string[] };
    const custos = custosPorCompetencia.get(`${competencia.ano}-${competencia.mes}`);
    const faltantes = new Set<string>();
    let total = 0;
    if (competenciasSemCustos.has(`${competencia.ano}-${competencia.mes}`) || !custos) {
      return { valor: null, faltantes: ["custos dos insumos indisponíveis"] };
    }
    for (const atendimento of atendimentos) {
      const ficha = fichasPorProcedimento.get(atendimento.idProcedimento);
      if (!ficha || ficha.length === 0) {
        faltantes.add(
          `ficha técnica de ${atendimento.nomeProcedimento || "procedimento"}`,
        );
        continue;
      }
      for (const item of ficha) {
        const custoUnitario = custos.get(item.idInsumo);
        if (custoUnitario == null || !Number.isFinite(custoUnitario)) {
          faltantes.add(`compra válida de ${insumos.find((i) => i.idInsumo === item.idInsumo)?.nome ?? "insumo"}`);
          continue;
        }
        total += numero(item.quantidadeUtilizada) * custoUnitario;
      }
    }
    return {
      valor: faltantes.size > 0 ? null : arredondar(total),
      faltantes: [...faltantes],
    };
  };

  const avisarFaltantes = (
    competencia: { ano: number; mes: number },
    faltantes: string[],
  ) => {
    if (faltantes.length === 0) return;
    avisosDeCustos.add(
      `Custo dos insumos indisponível em ${String(competencia.mes).padStart(2, "0")}/${competencia.ano}: ${faltantes.join(", ")}.`,
    );
  };

  const custoInsumosAtual = custosDosAtendimentos(atendimentosMes, { ano, mes });
  avisarFaltantes({ ano, mes }, custoInsumosAtual.faltantes);
  if (!taxasMes.completo) {
    avisos.push("taxas de pagamento de atendimentos antigos");
  }

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
    const custoInsumosHistorico = custosDosAtendimentos(atendimentos, comp);
    avisarFaltantes(comp, custoInsumosHistorico.faltantes);
    if (!taxasPagamento.completo) {
      avisos.push(
        `taxas de pagamento de atendimentos em ${String(comp.mes).padStart(2, "0")}/${comp.ano}`,
      );
    }
    const despesas =
      custoInsumosHistorico.valor === null || !taxasPagamento.completo
        ? null
        : arredondar(
            fixas +
              variaveis +
              imprevistos +
              taxasPagamento.valor +
              custoInsumosHistorico.valor,
          );
    return {
      ...comp,
      entradas: arredondar(entradas),
      despesas,
      lucroReal: despesas === null ? null : arredondar(entradas - despesas),
    };
  };
  const historico = historicoCompetencias.map(resumoHistorico);
  const atual = historico.at(-1)!;
  const anterior = historico.at(-2);
  const margemMedia =
    entradasMes > 0 && atual.lucroReal !== null
      ? percentual((atual.lucroReal / entradasMes) * 100)
      : null;
  const atendimentosPorProcedimento = new Map<number, Atendimento[]>();
  for (const atendimento of atendimentosMes) {
    const grupo = atendimentosPorProcedimento.get(atendimento.idProcedimento) ?? [];
    grupo.push(atendimento);
    atendimentosPorProcedimento.set(atendimento.idProcedimento, grupo);
  }
  const procedimentos = [...atendimentosPorProcedimento.entries()]
    .map(([idProcedimento, lista]) => {
      const bruto = somar(lista, (a) => a.valorCobrado);
      const custos = custosDosAtendimentos(lista, { ano, mes });
      const taxasProcedimento = calcularTaxas(lista, taxas);
      avisarFaltantes({ ano, mes }, custos.faltantes);
      const lucro =
        custos.valor === null || !taxasProcedimento.completo
          ? null
          : arredondar(bruto - custos.valor - taxasProcedimento.valor);
      return {
        idProcedimento,
        nome: lista[0]?.nomeProcedimento || "Procedimento",
        qtdAtendimentos: lista.length,
        lucroTotal: lucro,
        margem:
          lucro !== null && bruto > 0 ? percentual((lucro / bruto) * 100) : null,
      };
    })
    .sort((a, b) => (b.lucroTotal ?? -Infinity) - (a.lucroTotal ?? -Infinity));
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
          anterior &&
          anterior.entradas > 0 &&
          anterior.lucroReal !== null &&
          margemMedia !== null
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
      { categoria: "Insumos", valor: custoInsumosAtual.valor },
      { categoria: "Despesas variáveis", valor: arredondar(variaveisMes) },
      { categoria: "Imprevistos", valor: imprevistosMes },
      {
        categoria: "Taxas de pagamento",
        valor: taxasMes.completo ? taxasMes.valor : null,
      },
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
    avisos: [...avisos, ...avisosDeCustos],
  };
}

export { MESES as meses };
