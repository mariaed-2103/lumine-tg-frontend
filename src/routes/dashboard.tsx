import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DashboardData } from "@/services/dashboardService";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeInfo,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  FileSpreadsheet,
  Package,
  Plus,
  TrendingUp,
  Wallet,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { getDashboard, meses } from "@/services/dashboardService";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Financeiro | Lumine" }] }),
  component: DashboardPage,
});
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compact = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const palette = ["#6B1530", "#C5325A", "#E8698A", "#F5A8BC", "#FCE1E8"];
const descriptions = [
  "O que sobra depois de descontar insumos, taxas de pagamento, despesas e imprevistos.",
  "Tudo o que você recebeu pelos atendimentos no mês.",
  "De cada R$ 100 recebidos, quanto vira lucro.",
  "Dinheiro perdido com tempo extra e desperdício de material.",
  "Quantidade de atendimentos registrados no mês.",
] as const;
function exportarExcel(dados: DashboardData) {
  const sheets: [string, (string | number)[][]][] = [
    [
      "Resumo",
      [
        ["Indicador", "Valor"],
        ["Competência", `${meses[dados.competencia.mes - 1]} ${dados.competencia.ano}`],
        ["Profissional", dados.perfil.nomeProfissional],
        ["Lucro real", dados.resumo.lucroReal],
        ["Entradas do mês", dados.resumo.entradasMes],
        ["Margem do mês (%)", dados.resumo.margemMedia],
        ["Prejuízo por imprevistos", dados.resumo.prejuizoImprevistos],
        ["Atendimentos realizados", dados.resumo.qtdAtendimentos],
        ["Meta de lucro (%)", dados.configuracao.lucroDesejado],
      ],
    ],
    [
      "Histórico",
      [
        ["Mês", "Ano", "Entradas (R$)", "Despesas (R$)", "Lucro real (R$)"],
        ...dados.historico.map((x) => [
          meses[x.mes - 1] ?? "Mês desconhecido",
          x.ano,
          x.entradas,
          x.despesas,
          x.lucroReal,
        ]),
      ],
    ],
    [
      "Custos",
      [
        ["Categoria", "Valor (R$)", "Participação (%)"],
        ...dados.composicaoCustos.map((x) => [
          x.categoria,
          x.valor,
          dados.composicaoCustos.reduce((s, c) => s + c.valor, 0)
            ? (x.valor / dados.composicaoCustos.reduce((s, c) => s + c.valor, 0)) * 100
            : 0,
        ]),
      ],
    ],
    [
      "Procedimentos",
      [
        ["Procedimento", "Atendimentos", "Lucro total (R$)", "Margem (%)"],
        ...dados.procedimentos.map((x) => [
          x.nome,
          x.qtdAtendimentos,
          x.lucroTotal,
          x.margem ?? "",
        ]),
      ],
    ],
    [
      "Estoque baixo",
      [
        ["Insumo", "Estoque atual", "Estoque mínimo", "Unidade"],
        ...dados.insumosEstoqueBaixo.map((x) => [
          x.nome,
          x.estoqueAtual,
          x.estoqueMinimo,
          x.unidadeMedida,
        ]),
      ],
    ],
    [
      "Atendimentos",
      [
        ["Data", "Cliente", "Procedimento", "Valor (R$)", "Pagamento", "Imprevisto"],
        ...dados.ultimosAtendimentos.map((x) => [
          x.data,
          x.nomeCliente,
          x.procedimento,
          x.valorCobrado,
          x.formaPagamento,
          x.teveImprevisto ? "Sim" : "Não",
        ]),
      ],
    ],
    [
      "Imprevistos",
      [
        ["Indicador", "Valor"],
        ["Tempo adicional (minutos)", dados.imprevistos.tempoAdicionalMin],
        ["Desperdício de materiais (R$)", dados.imprevistos.desperdicioMateriais],
        ["Prejuízo total (R$)", dados.resumo.prejuizoImprevistos],
      ],
    ],
  ];
  const escape = (value: string | number) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6B1530" ss:Pattern="Solid"/></Style></Styles>${sheets.map(([name, rows]) => `<Worksheet ss:Name="${name}"><Table>${rows.map((row, i) => `<Row>${row.map((cell) => `<Cell${i === 0 ? ' ss:StyleID="header"' : ""}><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${escape(cell)}</Data></Cell>`).join("")}</Row>`).join("")}</Table></Worksheet>`).join("")}</Workbook>`;
  const blob = new Blob(["\uFEFF", xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Lumine-dashboard-${dados.competencia.ano}-${String(dados.competencia.mes).padStart(2, "0")}.xls`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
function Tip({ text }: { text: string }) {
  return (
    <span className="group/tip relative inline-flex">
      <BadgeInfo className="h-3.5 w-3.5 cursor-help text-wine/35" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-52 -translate-x-1/2 rounded-xl bg-wine px-3 py-2 text-[10px] font-medium leading-relaxed text-white opacity-0 shadow-lg transition group-hover/tip:opacity-100 group-focus-within/tip:opacity-100">
        {text}
      </span>
    </span>
  );
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[24px] border border-petal/30 bg-white/90 p-5 shadow-[0_3px_16px_-8px_rgba(107,21,48,0.14)] ${className}`}
    >
      {children}
    </section>
  );
}
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gradient-to-r from-pale via-cream to-pale ${className}`}
    />
  );
}
function CountUp({ value, format }: { value: number; format: (value: number) => string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 600, 1);
      setShown(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span className="whitespace-nowrap">{format(shown)}</span>;
}
function DashboardPage() {
  const navigate = useNavigate();
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const [competencia, setCompetencia] = useState(() => ({ ano: anoAtual, mes: mesAtual }));
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [popover, setPopover] = useState(false);
  const [anoPopover, setAnoPopover] = useState(anoAtual);
  const [aba, setAba] = useState<"duplo" | "lucro">("duplo");
  const [ordem, setOrdem] = useState<"lucro" | "margem" | "qtd">("lucro");
  const [categoriaCustoSelecionada, setCategoriaCustoSelecionada] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      const result = await getDashboard(competencia.ano, competencia.mes);
      setDados(result);
    } catch {
      setErro(true);
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }, [competencia]);
  useEffect(() => {
    void carregar();
  }, [carregar, retry]);
  const mudarMes = (mes: number, ano = competencia.ano) => {
    setCompetencia({ ano, mes });
    setPopover(false);
  };
  const anoMinimo = Math.min(2020, anoAtual);
  const mudarSeta = (delta: number) => {
    const date = new Date(competencia.ano, competencia.mes - 1 + delta, 1);
    if (date > new Date(anoAtual, mesAtual - 1, 1) || date < new Date(anoMinimo, 0, 1)) return;
    mudarMes(date.getMonth() + 1, date.getFullYear());
  };
  const nomeMes = meses[competencia.mes - 1] ?? "Mês";
  const ordenados = useMemo(
    () =>
      dados
        ? [...dados.procedimentos].sort((a, b) =>
            ordem === "margem"
              ? a.margem === null
                ? b.margem === null
                  ? 0
                  : 1
                : b.margem === null
                  ? -1
                  : b.margem - a.margem
              : ordem === "qtd"
                ? b.qtdAtendimentos - a.qtdAtendimentos
                : b.lucroTotal - a.lucroTotal,
          )
        : [],
    [dados, ordem],
  );
  const totalCustos = dados?.composicaoCustos.reduce((sum, item) => sum + item.valor, 0) || 0;
  const metaOk =
    !!dados &&
    dados.resumo.entradasMes > 0 &&
    dados.resumo.margemMedia >= dados.configuracao.lucroDesejado;
  const variacaoTexto = (variacao: number | null, sufixo = "%") =>
    variacao === null
      ? "Sem comparação"
      : `${variacao > 0 ? "+" : ""}${variacao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}${sufixo} vs. mês anterior`;
  const indicadores: {
    label: string;
    value: number;
    format: (value: number) => string;
    delta: number | null;
    kind: "good" | "inverse";
    icon: LucideIcon;
    route: "/gestao-financeira" | "/precificacao" | "/atendimentos";
    suffix?: string;
    description: string;
  }[] = [
    {
      label: "Entradas do mês",
      value: dados?.resumo.entradasMes ?? 0,
      format: money.format,
      delta: dados?.resumo.variacao.entradasMes ?? null,
      kind: "good",
      icon: Wallet,
      route: "/gestao-financeira",
      description: descriptions[1],
    },
    {
      label: "Margem do mês",
      value: dados?.resumo.margemMedia ?? 0,
      format: (value) =>
        `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
      delta: dados?.resumo.variacao.margemMedia ?? null,
      kind: "good",
      icon: TrendingUp,
      route: "/precificacao",
      suffix: " pp",
      description: descriptions[2],
    },
    {
      label: "Prejuízo por imprevistos",
      value: dados?.resumo.prejuizoImprevistos ?? 0,
      format: money.format,
      delta: dados?.resumo.variacao.prejuizoImprevistos ?? null,
      kind: "inverse",
      icon: WandSparkles,
      route: "/atendimentos",
      description: descriptions[3],
    },
    {
      label: "Atendimentos",
      value: dados?.resumo.qtdAtendimentos ?? 0,
      format: (value) => compact.format(Math.round(value)),
      delta: dados?.resumo.variacao.qtdAtendimentos ?? null,
      kind: "good",
      icon: CreditCard,
      route: "/atendimentos",
      description: descriptions[4],
    },
  ];
  return (
    <AppShell mobileTitle="Dashboard">
      <div className="mx-auto w-full max-w-[1440px] space-y-5 pb-8">
        <header className="flex flex-col justify-between gap-4 px-1 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-2xl font-semibold text-wine sm:text-[30px]">
              {dados?.perfil.nomeProfissional
                ? `Olá, ${dados.perfil.nomeProfissional}`
                : "Dashboard"}
            </h1>
            <p className="mt-1 text-sm text-wine/55">
              Entradas, despesas e resultados do seu negócio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => dados && exportarExcel(dados)}
              disabled={!dados}
              title="Exportar Excel"
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-full px-3 text-xs font-medium text-wine/70 transition hover:bg-white hover:text-wine disabled:opacity-40"
            >
              <FileSpreadsheet size={15} /> Exportar
            </button>
            <div className="relative flex h-10 items-center gap-1 rounded-full border border-petal/50 bg-white/80 px-1">
              <button
                onClick={() => mudarSeta(-1)}
                disabled={competencia.ano === anoMinimo && competencia.mes === 1}
                className="focus-ring grid h-8 w-8 place-items-center rounded-full text-wine/60 hover:bg-cream hover:text-wine disabled:opacity-30"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => {
                  setAnoPopover(competencia.ano);
                  setPopover(!popover);
                }}
                className="focus-ring flex min-w-32 items-center justify-center gap-2 rounded-full px-2 py-2 text-xs font-semibold text-wine hover:bg-cream"
              >
                {nomeMes} {competencia.ano}
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => mudarSeta(1)}
                disabled={competencia.ano === anoAtual && competencia.mes === mesAtual}
                className="focus-ring grid h-8 w-8 place-items-center rounded-full text-wine/60 hover:bg-cream hover:text-wine disabled:opacity-30"
                aria-label="Próximo mês"
              >
                <ChevronRight size={15} />
              </button>
              {popover && (
                <div className="absolute right-0 top-12 z-40 w-[min(300px,90vw)] rounded-[22px] border border-petal/50 bg-white p-4 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      disabled={anoPopover <= anoMinimo}
                      onClick={() => setAnoPopover(anoPopover - 1)}
                      className="focus-ring rounded-full p-2 hover:bg-pale disabled:opacity-30"
                      aria-label="Ano anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <b className="font-display text-lg text-wine">{anoPopover}</b>
                    <button
                      disabled={anoPopover >= anoAtual}
                      onClick={() => setAnoPopover(anoPopover + 1)}
                      className="focus-ring rounded-full p-2 hover:bg-pale disabled:opacity-30"
                      aria-label="Próximo ano"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {meses.map((m, i) => {
                      const future =
                        anoPopover > anoAtual || (anoPopover === anoAtual && i + 1 > mesAtual);
                      const old = anoPopover < anoMinimo;
                      const active = anoPopover === competencia.ano && i + 1 === competencia.mes;
                      return (
                        <button
                          disabled={future || old}
                          key={m}
                          onClick={() => mudarMes(i + 1, anoPopover)}
                          className={`focus-ring rounded-xl px-2 py-2.5 text-xs font-semibold transition ${active ? "bg-berry text-white" : future || old ? "text-wine/20" : "bg-cream text-wine hover:bg-pale"}`}
                        >
                          {m.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate({ to: "/atendimentos" })}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-berry px-4 text-xs font-semibold text-white transition hover:bg-wine"
            >
              <Plus size={15} /> Registrar atendimento
            </button>
            <button
              onClick={() => navigate({ to: "/precificacao" })}
              className="focus-ring h-10 rounded-full px-3 text-xs font-medium text-wine/70 transition hover:bg-white hover:text-wine"
            >
              Simular preço
            </button>
          </div>
        </header>
        {carregando ? (
          <div className="space-y-5">
            <Skeleton className="h-16" />
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Skeleton key={n} className={`h-36 ${n === 1 ? "col-span-2 xl:col-span-1" : ""}`} />
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-12">
              <Skeleton className="h-72 lg:col-span-8" />
              <Skeleton className="h-72 lg:col-span-4" />
              <Skeleton className="h-80 lg:col-span-5" />
              <Skeleton className="h-80 lg:col-span-7" />
            </div>
          </div>
        ) : erro ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-petal/40 bg-white p-8 text-center shadow-lg shadow-wine/5">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-pale text-berry">
              <AlertTriangle size={29} />
            </div>
            <h2 className="font-display text-2xl font-semibold text-wine">
              Não foi possível carregar seus indicadores
            </h2>
            <p className="mt-2 max-w-sm text-sm text-wine/60">
              Tivemos um probleminha ao buscar os dados. Tente novamente em instantes.
            </p>
            <button
              onClick={() => setRetry((value) => value + 1)}
              className="focus-ring mt-6 rounded-full bg-berry px-5 py-3 text-sm font-bold text-white hover:bg-wine"
            >
              Tentar novamente
            </button>
          </div>
        ) : !dados ? (
          <div className="flex min-h-[440px] flex-col items-center justify-center rounded-[28px] border border-petal/40 bg-white p-8 text-center">
            <TrendingUp className="mb-4 text-petal" size={30} />
            <h2 className="font-display text-2xl font-semibold text-wine">
              Nenhum dado disponível para {nomeMes}/{competencia.ano}
            </h2>
            <button
              onClick={() => navigate({ to: "/atendimentos" })}
              className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-berry px-5 py-3 text-sm font-bold text-white hover:bg-wine"
            >
              <Plus size={16} /> Registrar atendimento
            </button>
          </div>
        ) : (
          <>
            {dados.resumo.lucroReal < 0 && (
              <p className="flex items-center gap-2 px-1 text-xs text-amber-800" role="status">
                <AlertTriangle className="shrink-0" size={14} />
                <span>
                  As despesas superaram as entradas em{" "}
                  <b>{money.format(Math.abs(dados.resumo.lucroReal))}</b> neste mês.
                </span>
              </p>
            )}
            {dados.avisos.length > 0 && (
              <div
                className="border-l-2 border-amber-300 pl-3 text-xs leading-relaxed text-amber-800"
                role="alert"
              >
                Alguns dados não puderam ser carregados (
                {Array.from(new Set(dados.avisos)).join(", ")}). Os valores podem estar incompletos;
                tente atualizar a página.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
              <div className="relative col-span-2 overflow-hidden rounded-[24px] bg-gradient-to-br from-wine to-berry p-5 text-white shadow-[0_6px_20px_rgba(107,21,48,.16)] xl:col-span-1">
                <div className="relative flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80">
                    Lucro real <Tip text={descriptions[0]} />
                  </span>
                  <button
                    onClick={() => navigate({ to: "/gestao-financeira" })}
                    aria-label="Ver detalhes de lucro real"
                    className="focus-ring grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="relative mt-4">
                  <div className="min-w-0">
                    <div className="font-display text-[clamp(1.125rem,1.9vw,1.5rem)] font-semibold leading-tight tracking-tight">
                      <CountUp value={dados.resumo.lucroReal} format={money.format} />
                    </div>
                    <span className="mt-2 block text-[10px] font-semibold text-white/75">
                      {variacaoTexto(dados.resumo.variacao.lucroReal)}
                    </span>
                  </div>
                </div>
              </div>
              {indicadores.map((indicator) => {
                const positive =
                  indicator.delta !== null &&
                  (indicator.kind === "inverse" ? indicator.delta < 0 : indicator.delta > 0);
                const neutral = indicator.delta === null || indicator.delta === 0;
                const Icon = indicator.icon;
                return (
                  <Card key={indicator.label} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-pale text-berry">
                        <Icon size={17} />
                      </div>
                      <button
                        onClick={() => navigate({ to: indicator.route })}
                        aria-label={`Ver detalhes: ${indicator.label}`}
                        className="focus-ring grid h-7 w-7 place-items-center rounded-full text-wine/45 hover:bg-cream hover:text-wine"
                      >
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-wine/65">
                      {indicator.label}
                      <Tip text={indicator.description} />
                    </div>
                    <div className="mt-1 font-display text-[25px] font-semibold leading-tight text-ink">
                      <CountUp value={indicator.value} format={indicator.format} />
                    </div>
                    <span
                      className={`mt-2 inline-flex text-[9px] font-semibold ${neutral ? "text-wine/45" : positive ? "text-[#2F9E74]" : "text-berry"}`}
                    >
                      {variacaoTexto(indicator.delta, indicator.suffix)}
                    </span>
                  </Card>
                );
              })}
            </div>
            <div className="grid gap-5 lg:grid-cols-12">
              <Card className="lg:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-berry">
                      Visão do período
                    </p>
                    <h2 className="font-display text-xl font-semibold text-wine">
                      Entradas e despesas
                    </h2>
                  </div>
                  <div className="flex rounded-full bg-cream p-1">
                    {(
                      [
                        ["duplo", "Entradas × Despesas"],
                        ["lucro", "Lucro real"],
                      ] as const
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setAba(v)}
                        className={`focus-ring rounded-full px-3 py-2 text-[10px] font-bold transition ${aba === v ? "bg-berry text-white shadow-sm" : "text-wine/65 hover:bg-pale"}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-5 text-[11px] font-semibold text-wine/70">
                    <span>
                      <i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-berry" />
                      {aba === "duplo" ? "Entradas" : "Lucro real"}
                    </span>
                    {aba === "duplo" && (
                      <span>
                        <i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-petal" />
                        Despesas
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span>
                      <b className="text-wine">Entradas</b> {money.format(dados.resumo.entradasMes)}{" "}
                      <em className="text-wine/55">
                        {variacaoTexto(dados.resumo.variacao.entradasMes)}
                      </em>
                    </span>
                    <span className="text-wine/60">
                      Despesas {money.format(dados.historico.at(-1)?.despesas || 0)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {aba === "duplo" ? (
                      <BarChart
                        data={dados.historico}
                        barGap={6}
                        onClick={(state) => {
                          const active = state?.activePayload?.[0]?.payload;
                          if (
                            active &&
                            typeof active.mes === "number" &&
                            typeof active.ano === "number"
                          ) {
                            mudarMes(active.mes, active.ano);
                          }
                        }}
                      >
                        <CartesianGrid vertical={false} stroke="#f5e7eb" />
                        <XAxis
                          dataKey="mes"
                          tickFormatter={(m) => meses[m - 1]?.slice(0, 3) ?? "—"}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#8a6672", fontSize: 10 }}
                        />
                        <YAxis hide />
                        <Tooltip
                          content={({ active, payload }: TooltipProps<number, string>) => {
                            const firstPayload = payload?.[0];
                            if (!active || !firstPayload) return null;
                            const competenciaAtiva = firstPayload.payload as
                              DashboardData["historico"][number] | undefined;
                            if (!competenciaAtiva) return null;
                            return (
                              <div className="rounded-xl bg-wine px-3 py-2 text-[11px] text-white shadow-lg">
                                <b>{meses[competenciaAtiva.mes - 1] ?? "Mês desconhecido"}</b>
                                {payload?.map((item) => (
                                  <div key={item.name}>
                                    {item.name}: {money.format(Number(item.value))}
                                  </div>
                                ))}
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="entradas"
                          name="Entradas"
                          fill="#C5325A"
                          radius={[8, 8, 8, 8]}
                          maxBarSize={16}
                          opacity={0.82}
                        />
                        <Bar
                          dataKey="despesas"
                          name="Despesas"
                          fill="#F5A8BC"
                          radius={[8, 8, 8, 8]}
                          maxBarSize={16}
                        />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={dados.historico}
                        onClick={(state) => {
                          const active = state?.activePayload?.[0]?.payload;
                          if (
                            active &&
                            typeof active.mes === "number" &&
                            typeof active.ano === "number"
                          ) {
                            mudarMes(active.mes, active.ano);
                          }
                        }}
                      >
                        <CartesianGrid vertical={false} stroke="#f5e7eb" />
                        <XAxis
                          dataKey="mes"
                          tickFormatter={(m) => meses[m - 1]?.slice(0, 3) ?? "—"}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#8a6672", fontSize: 10 }}
                        />
                        <YAxis hide />
                        <Tooltip
                          content={({ active, payload }: TooltipProps<number, string>) => {
                            const firstPayload = payload?.[0];
                            if (!active || !firstPayload) return null;
                            return (
                              <div className="rounded-xl bg-wine px-3 py-2 text-[11px] text-white">
                                Lucro: {money.format(Number(firstPayload.value))}
                              </div>
                            );
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="lucroReal"
                          name="Lucro real"
                          stroke="#6B1530"
                          strokeWidth={3}
                          dot={{ fill: "#C5325A", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
                <p className="mt-1 text-center text-[10px] text-wine/45">
                  Toque em um mês para ver seus resultados
                </p>
              </Card>
              <Card className="flex flex-col lg:col-span-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.15em] text-berry">
                    Seu objetivo
                  </p>
                  <h2 className="font-display text-xl font-semibold text-wine">Meta de margem</h2>
                </div>
                <div className="relative mx-auto mt-2 h-40 w-64 max-w-full">
                  <svg viewBox="0 0 240 140" className="h-full w-full">
                    <defs>
                      <pattern
                        id="hatch"
                        width="7"
                        height="7"
                        patternTransform="rotate(45)"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect width="7" height="7" fill="#FCE1E8" />
                        <line x1="0" y1="0" x2="0" y2="7" stroke="#F5A8BC" strokeWidth="2" />
                      </pattern>
                    </defs>
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      stroke="url(#hatch)"
                      strokeWidth="24"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      stroke="#C5325A"
                      strokeWidth="24"
                      strokeLinecap="round"
                      pathLength="100"
                      strokeDasharray={`${Math.max(0, Math.min(dados.resumo.margemMedia, 100))} 100`}
                    />
                  </svg>
                  <div className="absolute inset-x-0 bottom-1 text-center">
                    <div className="font-display text-4xl font-semibold text-wine">
                      {dados.resumo.margemMedia.toLocaleString("pt-BR")}%
                    </div>
                    <div className="text-[11px] font-semibold text-wine/55">
                      Margem do mês · Meta: {dados.configuracao.lucroDesejado}%
                    </div>
                  </div>
                </div>
                <div
                  className={`mx-auto rounded-full px-4 py-2 text-center text-xs font-bold ${metaOk ? "bg-[#E3F5EC] text-[#2F9E74]" : "bg-pale text-berry"}`}
                >
                  {metaOk
                    ? "Meta atingida"
                    : dados.resumo.entradasMes <= 0
                      ? "Sem entradas para comparar com a meta"
                      : dados.resumo.margemMedia < 0
                        ? "Sua margem ficou negativa neste período"
                        : `Faltam ${(dados.configuracao.lucroDesejado - dados.resumo.margemMedia).toLocaleString("pt-BR")} pontos para sua meta`}
                </div>
                <div className="mt-auto flex justify-center gap-4 pt-4 text-[10px] text-wine/60">
                  <span>● Margem atual</span>
                  <span>▨ Até a meta</span>
                </div>
              </Card>
            </div>
            <div className="grid gap-5 lg:grid-cols-12">
              <Card className="lg:col-span-5">
                <p className="text-[10px] font-bold uppercase tracking-[.15em] text-berry">
                  Composição dos custos
                </p>
                <h2 className="font-display text-xl font-semibold text-wine">
                  Para onde foi seu dinheiro
                </h2>
                <div className="mt-4 flex min-h-32 flex-wrap items-center justify-center gap-3">
                  {dados.composicaoCustos.map((c, i) => {
                    const percentualCusto = totalCustos > 0 ? (c.valor / totalCustos) * 100 : 0;
                    const tamanho = percentualCusto > 0 ? 56 + Math.sqrt(percentualCusto) * 5 : 56;
                    const selecionada = categoriaCustoSelecionada === c.categoria;
                    return (
                      <button
                        key={c.categoria}
                        type="button"
                        aria-pressed={selecionada}
                        aria-label={`${c.categoria}: ${percentualCusto.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}% dos custos, ${money.format(c.valor)}`}
                        onClick={() =>
                          setCategoriaCustoSelecionada(selecionada ? null : c.categoria)
                        }
                        className={`group flex flex-col items-center gap-1.5 rounded-2xl p-1.5 transition focus-ring ${
                          selecionada ? "bg-cream" : "hover:bg-cream/70"
                        }`}
                      >
                        <span
                          className="grid place-items-center rounded-full text-[11px] font-bold text-white transition group-hover:scale-105"
                          style={{
                            width: tamanho,
                            height: tamanho,
                            background: palette[i % palette.length],
                          }}
                        >
                          {percentualCusto.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
                        </span>
                        <span className="max-w-20 text-center text-[9px] leading-tight text-wine/65">
                          {c.categoria}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 space-y-3">
                  {dados.composicaoCustos
                    .filter(
                      (c) =>
                        categoriaCustoSelecionada === null ||
                        categoriaCustoSelecionada === c.categoria,
                    )
                    .map((c) => {
                      const percentualCusto = totalCustos > 0 ? (c.valor / totalCustos) * 100 : 0;
                      const colorIndex = dados.composicaoCustos.findIndex(
                        (item) => item.categoria === c.categoria,
                      );
                      return (
                        <div key={c.categoria}>
                          <div className="flex justify-between gap-3 text-xs">
                            <span className="font-medium text-wine/75">{c.categoria}</span>
                            <span className="whitespace-nowrap font-semibold text-wine">
                              {money.format(c.valor)}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-pale">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${percentualCusto}%`,
                                  background: palette[colorIndex % palette.length],
                                }}
                              />
                            </div>
                            <span className="w-9 text-right text-[10px] text-wine/50">
                              {percentualCusto.toLocaleString("pt-BR", {
                                maximumFractionDigits: 0,
                              })}
                              %
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  {categoriaCustoSelecionada && (
                    <button
                      type="button"
                      onClick={() => setCategoriaCustoSelecionada(null)}
                      className="text-[10px] font-medium text-berry hover:underline"
                    >
                      Limpar filtro
                    </button>
                  )}
                </div>
              </Card>
              <Card className="lg:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-berry">
                      Destaques do mês
                    </p>
                    <h2 className="font-display text-xl font-semibold text-wine">
                      Resultado por procedimento
                    </h2>
                    <p className="mt-1 text-[10px] text-wine/50">
                      Após custo dos insumos; despesas gerais não são rateadas por procedimento.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 rounded-full bg-cream p-1">
                    {(
                      [
                        ["lucro", "Maior lucro"],
                        ["margem", "Maior margem"],
                        ["qtd", "Mais atendimentos"],
                      ] as const
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setOrdem(v)}
                        className={`focus-ring rounded-full px-2.5 py-2 text-[9px] font-bold ${ordem === v ? "bg-berry text-white" : "text-wine/65 hover:bg-pale"}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {ordenados.map((p, i: number) => (
                    <div
                      key={p.idProcedimento ?? `${p.nome}-${i}`}
                      className="rounded-2xl bg-cream p-3 transition hover:translate-x-0.5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pale font-display text-sm font-bold text-berry">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-2">
                            <b className="truncate text-xs text-wine">{p.nome}</b>
                            <span className="text-[10px] font-bold text-wine">
                              {money.format(p.lucroTotal)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[9px] text-wine/55">
                            <span>{p.qtdAtendimentos} atendimentos</span>
                            {p.margem !== null && p.margem < dados.configuracao.lucroDesejado && (
                              <span className="rounded-full bg-pale px-2 py-1 font-bold text-berry">
                                Abaixo da meta
                              </span>
                            )}
                          </div>
                          {p.margem === null ? (
                            <span className="mt-2 block text-[9px] text-wine/45">
                              Margem indisponível
                            </span>
                          ) : (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                                <div
                                  className="h-full rounded-full bg-berry"
                                  style={{ width: `${Math.max(0, Math.min(p.margem, 100))}%` }}
                                />
                              </div>
                              <b className="text-[10px] text-wine">{p.margem}% após insumos</b>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!ordenados.length && (
                    <p className="py-8 text-center text-sm text-wine/50">
                      Sem procedimentos registrados neste mês.
                    </p>
                  )}
                </div>
              </Card>
            </div>
            <div className="grid gap-5 lg:grid-cols-12">
              <Card className="lg:col-span-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-berry">
                      Hora de repor
                    </p>
                    <h2 className="font-display text-xl font-semibold text-wine">Estoque baixo</h2>
                  </div>
                  <Package className="text-petal" size={21} />
                </div>
                {dados.insumosEstoqueBaixo.length ? (
                  <>
                    <div className="mt-4 space-y-3">
                      {dados.insumosEstoqueBaixo.map((item) => (
                        <div key={item.nome} className="rounded-2xl bg-cream p-3">
                          <div className="flex justify-between gap-2">
                            <b className="text-xs text-wine">{item.nome}</b>
                            <span className="rounded-full bg-pale px-2 py-1 text-[9px] font-bold text-berry">
                              Estoque baixo
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] text-wine/60">
                            {item.estoqueAtual} {item.unidadeMedida} de {item.estoqueMinimo}{" "}
                            {item.unidadeMedida}
                          </p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                            <div
                              className="h-full rounded-full bg-berry"
                              style={{
                                width: `${item.estoqueMinimo > 0 ? Math.max(0, Math.min((item.estoqueAtual / item.estoqueMinimo) * 100, 100)) : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => navigate({ to: "/insumos" })}
                        className="focus-ring rounded-full border border-petal px-4 py-2 text-[10px] font-bold text-wine hover:bg-cream"
                      >
                        Ver insumos
                      </button>
                      <button
                        onClick={() => navigate({ to: "/gestao-financeira" })}
                        className="focus-ring rounded-full px-3 py-2 text-[10px] font-bold text-berry hover:bg-pale"
                      >
                        Abrir gestão financeira →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center text-center">
                    <Check className="mb-2 text-petal" size={30} />
                    <p className="text-sm font-semibold text-wine">Tudo certo com o seu estoque</p>
                  </div>
                )}
              </Card>
              <Card className="lg:col-span-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-berry">
                      Movimentação recente
                    </p>
                    <h2 className="font-display text-xl font-semibold text-wine">
                      Últimos atendimentos
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate({ to: "/atendimentos" })}
                    className="focus-ring rounded-full px-3 py-2 text-[10px] font-bold text-berry hover:bg-pale"
                  >
                    Ver todos →
                  </button>
                </div>
                <div className="mt-3 space-y-1.5">
                  {dados.ultimosAtendimentos.map((a) => (
                    <div
                      key={a.idAtendimento}
                      className="flex items-center gap-2.5 rounded-2xl px-2 py-2 transition hover:bg-cream"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pale font-display text-[11px] font-bold text-wine">
                        {a.nomeCliente
                          .split(" ")
                          .map((x: string) => x[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <b className="truncate text-[11px] text-wine">{a.nomeCliente}</b>
                          <b className="text-[10px] text-wine">{money.format(a.valorCobrado)}</b>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-wine/55">
                          <span className="truncate">{a.procedimento}</span>
                          <span>
                            ·{" "}
                            {new Date(`${a.data}T12:00:00`).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="rounded-full bg-cream px-1.5 py-0.5 text-wine">
                            {a.formaPagamento}
                          </span>
                          {a.teveImprevisto && (
                            <span className="rounded-full bg-pale px-1.5 py-0.5 font-bold text-berry">
                              Imprevisto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <section className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(ellipse_at_90%_10%,rgba(197,50,90,.42),transparent_45%),linear-gradient(145deg,#6B1530,#3A0A1B)] p-5 text-white shadow-[0_12px_35px_rgba(58,10,27,.22)] lg:col-span-3">
                <div className="absolute -right-10 top-20 h-36 w-36 rounded-full border-[18px] border-white/5" />
                <div className="relative flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-white/65">
                  <WandSparkles size={15} /> Cuidado com imprevistos
                </div>
                <h2 className="relative mt-2 font-display text-xl font-semibold">
                  Imprevistos do mês
                </h2>
                <div className="relative mt-5 rounded-2xl bg-white/8 p-3">
                  <div className="text-[9px] text-white/60">Tempo adicional gasto</div>
                  <div className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold">
                    <Clock3 size={17} className="text-petal" />
                    {Math.floor(dados.imprevistos.tempoAdicionalMin / 60)}h{" "}
                    {dados.imprevistos.tempoAdicionalMin % 60}min
                  </div>
                </div>
                <div className="relative mt-2 rounded-2xl bg-white/8 p-3">
                  <div className="text-[9px] text-white/60">Desperdício de materiais</div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {money.format(dados.imprevistos.desperdicioMateriais)}
                  </div>
                </div>
                <div className="relative mt-3 border-t border-white/15 pt-3">
                  <div className="text-[9px] text-white/60">Prejuízo total</div>
                  <div className="font-display text-2xl font-semibold">
                    {money.format(dados.resumo.prejuizoImprevistos)}
                  </div>
                  <p className="mt-1 text-[10px] text-white/70">
                    Imprevistos custaram {money.format(dados.resumo.prejuizoImprevistos)} neste mês.
                  </p>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
