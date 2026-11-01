import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SemPerfilBanner } from "@/components/layout/SemPerfilBanner";
import { GlassCoin } from "@/components/decor/GlassCoin";
import {
  ClipboardIcon,
  ClockIcon,
} from "@/components/icons/lumine";
import { buscarPerfilEmpresa } from "@/services/perfilEmpresaService";
import type {
  ConfiguracaoFinanceira,
  DespesaFixa,
  CompraInsumo,
  FormaPagamento,
} from "@/components/financeiro/types";
import type { Procedimento } from "@/components/procedimentos/types";
import type { Insumo } from "@/components/insumos/types";
import {
  buscarConfiguracaoFinanceira,
  salvarConfiguracaoFinanceira,
} from "@/services/configuracaoFinanceiraService";
import {
  listarFormasPagamento,
  cadastrarFormaPagamento,
  editarFormaPagamento,
  excluirFormaPagamento,
} from "@/services/formaPagamentoService";
import { listarProcedimentos } from "@/services/procedimentoService";
import { listarFichaTecnica } from "@/services/fichaTecnicaService";
import { listarInsumos } from "@/services/insumoService";
import { listarCompras } from "@/services/compraService";
import { listarDespesasFixas } from "@/services/despesaFixaService";
import { apiFetch } from "@/services/api";
import {
  definirPrecoPadrao,
  simularPreco,
  type SimulacaoPrecoResponse,
} from "@/services/simulacaoPrecoService";
import {
  calcularCustoFixoPorMinuto,
  calcularCustoUnitarioInsumo,
  calcularSimulacao,
} from "@/lib/calcularSimulacao";
import { ConfiguracaoFinanceiraTab } from "@/components/financeiro/ConfiguracaoFinanceiraTab";
import { FormasPagamentoTab } from "@/components/financeiro/FormasPagamentoTab";
import { FinanceiroTabs, type FinanceiroTabId } from "@/components/financeiro/FinanceiroTabs";
import { FinanceiroDeleteModal } from "@/components/financeiro/FinanceiroDeleteModal";
import { MESES, ANOS } from "@/components/financeiro/CompetenciaSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/precificacao")({
  head: () => ({
    meta: [
      { title: "Precificação | Lumine" },
      {
        name: "description",
        content:
          "Defina os parâmetros financeiros e simule o preço dos seus procedimentos no Lumine.",
      },
    ],
  }),
  component: PrecificacaoPage,
});

type Perfil = {
  idPerfilEmpresa: number;
  diasTrabalhadosMes?: number;
  horasDisponiveisDia?: number;
};
type ItemFicha = { idInsumo: number; quantidadeUtilizada: number };

const CONFIGURACAO_PADRAO: ConfiguracaoFinanceira = {
  margemSeguranca: 10,
  lucroDesejado: 20,
  provisaoFeriasAtiva: false,
  percentualProvisaoFerias: null,
};

const dinheiro = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const percentual = (n: number) => `${n.toFixed(2).replace(".", ",")}%`;

export function PrecificacaoPage() {
  const [competencia, setCompetencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  });
  const [aba, setAba] = useState<FinanceiroTabId>("configuracao");
  const [loading, setLoading] = useState(true);
  const [errorsLoad, setErrorsLoad] = useState<string[]>([]);
  const [config, setConfig] = useState<ConfiguracaoFinanceira | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [temPerfil, setTemPerfil] = useState<boolean | null>(null);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [compras, setCompras] = useState<CompraInsumo[]>([]);
  const [despesas, setDespesas] = useState<DespesaFixa[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  const [deleteForma, setDeleteForma] = useState<FormaPagamento | null>(null);
  const [selected, setSelected] = useState("");
  const [ficha, setFicha] = useState<ItemFicha[]>([]);
  const [fichaLoading, setFichaLoading] = useState(false);
  const [fichaError, setFichaError] = useState("");
  const [confirmPrice, setConfirmPrice] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);
  const [simulacaoBackend, setSimulacaoBackend] =
    useState<SimulacaoPrecoResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorsLoad([]);
    const perfilEmpresa = await buscarPerfilEmpresa();
    setTemPerfil(!!perfilEmpresa);
    if (!perfilEmpresa) {
      setLoading(false);
      return;
    }
    const jobs = await Promise.allSettled([
      fetchProfile(),
      listarProcedimentos(),
      listarFormasPagamento(),
      listarCompras(),
      listarDespesasFixas(),
      listarInsumos(),
    ]);
    const errs: string[] = [];
    if (jobs[0].status === "fulfilled") {
      const p = jobs[0].value;
      setPerfil(p);
      try {
        const c = await buscarConfiguracaoFinanceira(p.idPerfilEmpresa);
        setConfig(c);
      } catch {
        setConfig(null);
      }
    } else
      errs.push(
        jobs[0].reason instanceof Error
          ? jobs[0].reason.message
          : "Perfil da empresa indisponível."
      );
    if (jobs[1].status === "fulfilled") setProcedimentos(jobs[1].value);
    else
      errs.push(
        jobs[1].reason instanceof Error
          ? jobs[1].reason.message
          : "Não foi possível carregar procedimentos."
      );
    if (jobs[2].status === "fulfilled") setFormas(jobs[2].value);
    else
      errs.push(
        jobs[2].reason instanceof Error
          ? jobs[2].reason.message
          : "Não foi possível carregar formas de pagamento."
      );
    if (jobs[3].status === "fulfilled") setCompras(jobs[3].value);
    else
      errs.push(
        jobs[3].reason instanceof Error
          ? jobs[3].reason.message
          : "Não foi possível carregar compras."
      );
    if (jobs[4].status === "fulfilled") setDespesas(jobs[4].value);
    else
      errs.push(
        jobs[4].reason instanceof Error
          ? jobs[4].reason.message
          : "Não foi possível carregar despesas fixas."
      );
    if (jobs[5].status === "fulfilled") setInsumos(jobs[5].value);
    else
      errs.push(
        jobs[5].reason instanceof Error
          ? jobs[5].reason.message
          : "Não foi possível carregar insumos."
      );
    setErrorsLoad(errs);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function fetchProfile(): Promise<Perfil> {
    const id = localStorage.getItem("idUsuario");
    if (!id) throw new Error("Usuário não identificado.");
    const r = await apiFetch(`/perfis-empresa/usuario/${id}`);
    if (!r.ok) throw new Error("Não foi possível carregar o Perfil da Empresa.");
    return r.json();
  }

  const procedimento = procedimentos.find(
    (p) => p.idProcedimento === Number(selected)
  );

  const parts = competencia.split("-").map(Number);
  const anoCompetencia = parts[0] ?? new Date().getFullYear();
  const mesCompetencia = parts[1] ?? new Date().getMonth() + 1;
  const diasNoMes = new Date(anoCompetencia, mesCompetencia, 0).getDate();
  const inicioCompetencia = `${competencia}-01`;
  const fimCompetencia = `${competencia}-${String(diasNoMes).padStart(2, "0")}`;

  useEffect(() => {
    if (!selected) {
      setFicha([]);
      return;
    }
    setFichaLoading(true);
    setFichaError("");
    listarFichaTecnica(Number(selected))
      .then(setFicha)
      .catch((e) =>
        setFichaError(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar a ficha técnica."
        )
      )
      .finally(() => setFichaLoading(false));
  }, [selected]);

  useEffect(() => {
    setSimulacaoBackend(null);
    if (!selected || !competencia) return;
    simularPreco(Number(selected), mesCompetencia, anoCompetencia)
      .then(setSimulacaoBackend)
      .catch((e) =>
        toast.error(
          e instanceof Error ? e.message : "Não foi possível calcular a simulação."
        )
      );
  }, [selected, competencia, mesCompetencia, anoCompetencia]);

  const linhas = ficha.map((f) => {
    const insumo = insumos.find((i) => i.idInsumo === f.idInsumo);
    const comprasDoInsumo = compras.filter(
      (c) =>
        c.idInsumo === f.idInsumo &&
        c.dataCompra >= inicioCompetencia &&
        c.dataCompra <= fimCompetencia
    );
    const custoUnitario = calcularCustoUnitarioInsumo(
      insumo?.quantidadePorEmbalagem ?? 0,
      comprasDoInsumo
    );
    return {
      f,
      insumo,
      custoUnitario,
      custo:
        custoUnitario === null ? null : custoUnitario * f.quantidadeUtilizada,
    };
  });

  const custoInsumos = linhas.reduce((sum, x) => sum + (x.custo ?? 0), 0);
  const despesasAtivasMes = despesas.filter(
    (d) =>
      d.dataInicio <= fimCompetencia &&
      (!d.dataFim || d.dataFim >= inicioCompetencia)
  );
  const despesasMes = despesasAtivasMes.reduce((sum, d) => sum + d.valor, 0);
  const valorProLabore = despesasAtivasMes
    .filter((d) =>
      d.categoria
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .includes("pro-labore")
    )
    .reduce((sum, d) => sum + d.valor, 0);

  const fixoMin = calcularCustoFixoPorMinuto(
    despesasMes,
    valorProLabore,
    perfil?.diasTrabalhadosMes,
    perfil?.horasDisponiveisDia,
    config?.provisaoFeriasAtiva ? (config.percentualProvisaoFerias ?? 0) : 0
  );

  const simulation =
    procedimento &&
    config &&
    linhas.length > 0 &&
    linhas.every((x) => x.custo !== null) &&
    fixoMin !== null
      ? calcularSimulacao({
          duracaoMinutos: procedimento.duracaoMinutos,
          custoInsumos,
          custoFixoPorMinuto: fixoMin,
          margemSeguranca: config.margemSeguranca,
          lucroDesejado: config.lucroDesejado,
        })
      : null;

  const precoSugerido =
    simulacaoBackend?.precoSugerido ?? simulation?.precoSugerido;

  async function handleSaveConfiguracao(
    novaConfig: Omit<ConfiguracaoFinanceira, "idConfiguracao" | "dataAtualizacao">
  ) {
    if (!perfil) return;
    try {
      const saved = await salvarConfiguracaoFinanceira(
        perfil.idPerfilEmpresa,
        novaConfig
      );
      setConfig(saved);
      toast.success("Configuração financeira salva com sucesso!");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Não foi possível salvar a configuração."
      );
      throw e;
    }
  }

  async function handleAddForma(
    novaForma: Omit<FormaPagamento, "idFormaPagamento">
  ) {
    try {
      await cadastrarFormaPagamento(novaForma);
      setFormas(await listarFormasPagamento());
      toast.success("Forma de pagamento cadastrada com sucesso!");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível cadastrar a forma de pagamento."
      );
      throw e;
    }
  }

  async function handleUpdateForma(
    id: number,
    forma: Omit<FormaPagamento, "idFormaPagamento">
  ) {
    try {
      await editarFormaPagamento(id, forma);
      setFormas(await listarFormasPagamento());
      toast.success("Forma de pagamento atualizada com sucesso!");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível atualizar a forma de pagamento."
      );
      throw e;
    }
  }

  async function handleConfirmDelete() {
    if (!deleteForma) return;
    try {
      await excluirFormaPagamento(deleteForma.idFormaPagamento);
      setFormas(await listarFormasPagamento());
      setDeleteForma(null);
      toast.success("Forma de pagamento excluída com sucesso.");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível excluir a forma de pagamento."
      );
    }
  }

  async function setDefaultPrice() {
    if (!procedimento || precoSugerido == null) return;
    setSavingPrice(true);
    try {
      await definirPrecoPadrao(
        procedimento.idProcedimento,
        Number(precoSugerido.toFixed(2))
      );
      setProcedimentos((old) =>
        old.map((p) =>
          p.idProcedimento === procedimento.idProcedimento
            ? { ...p, precoPadrao: Number(precoSugerido.toFixed(2)) }
            : p
        )
      );
      setConfirmPrice(false);
      toast.success("Preço padrão definido com sucesso.");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível atualizar o preço padrão."
      );
    } finally {
      setSavingPrice(false);
    }
  }

  return (
    <AppShell mobileTitle="Precificação">
      {temPerfil === false && <SemPerfilBanner />}

      {/* Cabeçalho */}
      <div className="relative pt-2 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-wine sm:text-[40px]">
          Precificação
        </h1>

        <p className="mt-1.5 max-w-[600px] text-balance text-sm font-medium text-ink/65 sm:text-[15px]">
          Defina os parâmetros financeiros e simule o preço dos seus procedimentos
        </p>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 z-0 hidden h-[88px] w-[92px] select-none xl:block 2xl:h-[98px] 2xl:w-[104px]"
        >
          <GlassCoin className="h-full w-full" size={190} />
        </div>
      </div>

      {/* Card principal no padrão Lumine */}
      <section className="glass-strong glass-border-iridescent w-full rounded-[32px] p-6 shadow-sm transition-all sm:p-8">
        {/* Barra superior com navegação em pílulas */}
        <div className="relative flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-petal/70 to-transparent" />
          <FinanceiroTabs value={aba} onChange={setAba} />
        </div>

        <div
          id="painel-precificacao"
          role="tabpanel"
          aria-labelledby={`tab-${aba}`}
          className="pt-5"
        >
          {loading ? (
            <div className="py-16 text-center text-sm font-semibold text-wine/70">
              Carregando dados de precificação...
            </div>
          ) : (
            <>
              {errorsLoad.length > 0 && (
                <div className="mb-5 flex items-center justify-between rounded-2xl border border-petal/60 bg-pale/75 p-4 text-xs font-semibold text-wine">
                  <span>{errorsLoad[0]}</span>
                  <button
                    className="cursor-pointer font-bold text-berry underline transition-colors hover:text-wine"
                    onClick={() => void load()}
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* ABA 1: CONFIGURAÇÃO DE PRECIFICAÇÃO */}
              {aba === "configuracao" && (
                <ConfiguracaoFinanceiraTab
                  configuracao={config ?? CONFIGURACAO_PADRAO}
                  onSaveConfiguracao={handleSaveConfiguracao}
                />
              )}

              {/* ABA 2: FORMAS DE PAGAMENTO E TAXAS */}
              {aba === "pagamentos" && (
                <FormasPagamentoTab
                  formasPagamento={formas}
                  onAddForma={handleAddForma}
                  onUpdateForma={handleUpdateForma}
                  onDeleteRequest={(forma) => setDeleteForma(forma)}
                />
              )}

              {/* ABA 3: SIMULAÇÃO DE PREÇO */}
              {aba === "simulacao" && (
                <div className="space-y-5">
                  {/* Filtros de Competência e Procedimento */}
                  <div className="rounded-[24px] border border-petal/40 bg-white/45 p-4 shadow-[inset_0_1px_3px_rgba(107,21,48,0.07)] sm:p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          id="label-competencia"
                          htmlFor="select-competencia-mes"
                          className="mb-1.5 ml-1 block text-xs font-bold text-wine"
                        >
                          Mês de Competência
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={String(mesCompetencia)}
                            onValueChange={(val) => {
                              const newMes = String(val).padStart(2, "0");
                              setCompetencia(`${anoCompetencia}-${newMes}`);
                            }}
                          >
                            <SelectTrigger
                              id="select-competencia-mes"
                              aria-labelledby="label-competencia select-competencia-mes"
                              className="h-11 w-full rounded-full border-petal/70 bg-white/80 px-4 text-sm font-semibold text-ink"
                            >
                              <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {MESES.map((m) => (
                                <SelectItem key={m.valor} value={String(m.valor)}>
                                  {m.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={String(anoCompetencia)}
                            onValueChange={(val) => {
                              setCompetencia(`${val}-${String(mesCompetencia).padStart(2, "0")}`);
                            }}
                          >
                            <SelectTrigger
                              id="select-competencia-ano"
                              aria-labelledby="label-competencia select-competencia-ano"
                              className="h-11 w-full rounded-full border-petal/70 bg-white/80 px-4 text-sm font-semibold text-ink"
                            >
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {ANOS.map((a) => (
                                <SelectItem key={a} value={String(a)}>
                                  {a}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Input hidden de compatibilidade com testes e formulários legados */}
                        <input id="competencia-sim" type="hidden" value={competencia} readOnly />
                      </div>
                      <div>
                        <label
                          htmlFor="procedimento-sim"
                          className="mb-1.5 ml-1 block text-xs font-bold text-wine"
                        >
                          Procedimento para Simulação
                        </label>
                        <Select
                          value={selected}
                          onValueChange={(value) =>
                            setSelected(value === "__empty__" ? "" : value)
                          }
                        >
                          <SelectTrigger
                            id="procedimento-sim"
                            className="h-11 w-full rounded-full border-petal/70 bg-white/80 px-4 text-sm font-semibold text-ink"
                          >
                            <SelectValue placeholder="Selecione um procedimento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__empty__">
                              Selecione um procedimento
                            </SelectItem>
                            {procedimentos.map((p) => (
                              <SelectItem
                                key={p.idProcedimento}
                                value={String(p.idProcedimento)}
                              >
                                {p.nome} · {p.duracaoMinutos} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {procedimentos.length === 0 && (
                      <p className="mt-3 ml-1 text-xs font-medium text-ink/60">
                        Nenhum procedimento cadastrado. Cadastre procedimentos no menu para simular preços.
                      </p>
                    )}
                  </div>

                  {!selected ? (
                    <div className="mx-auto max-w-lg px-4 py-12 text-center sm:py-16">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-petal/40 bg-pale shadow-xs">
                        <ClipboardIcon className="h-9 w-9 text-rose" size={36} />
                      </div>
                      <h3 className="mb-2 font-display text-xl font-bold tracking-tight text-wine sm:text-2xl">
                        Selecione um procedimento
                      </h3>
                      <p className="mx-auto max-w-md font-sans text-xs leading-relaxed text-wine/80 sm:text-sm">
                        Escolha um procedimento acima para consultar os insumos da ficha técnica, o custo fixo por minuto e o preço sugerido.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
                      {/* Coluna da esquerda: Procedimento e Ficha Técnica */}
                      <div className="space-y-4 lg:col-span-7">
                        {procedimento && (
                          <div className="rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-xs space-y-5 sm:p-6">
                            {/* Cabeçalho limpo e leve do procedimento selecionado */}
                            <div className="space-y-2 border-b border-petal/25 pb-4">
                              <div className="flex flex-wrap items-center justify-between gap-2.5">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-berry">
                                  Procedimento Selecionado
                                </span>
                                <div className="flex flex-wrap items-center gap-2.5 text-xs text-ink/70">
                                  <span className="inline-flex items-center gap-1.5 font-semibold text-wine bg-cream/70 px-2.5 py-0.5 rounded-full border border-petal/40">
                                    <ClockIcon
                                      size={13}
                                      className="h-3.5 w-3.5 text-rose"
                                    />
                                    <span>{procedimento.duracaoMinutos} min</span>
                                  </span>
                                  <span className="font-medium text-ink/65">
                                    Preço padrão:{" "}
                                    <strong className="font-bold tabular-nums text-wine">
                                      {procedimento.precoPadrao == null
                                        ? "Não definido"
                                        : dinheiro(procedimento.precoPadrao)}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                              <h3 className="font-display text-2xl font-bold tracking-tight text-wine sm:text-[26px]">
                                {procedimento.nome}
                              </h3>
                            </div>

                            {/* Título da Ficha Técnica */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <div className="flex items-center gap-2">
                                <ClipboardIcon
                                  size={16}
                                  className="h-4 w-4 text-berry"
                                />
                                <h4 className="font-display text-base font-bold text-wine">
                                  Ficha Técnica
                                </h4>
                                <span className="text-xs font-semibold text-wine/55">
                                  ({ficha.length} {ficha.length === 1 ? "insumo" : "insumos"})
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-ink/50">
                                Compras da competência
                              </span>
                            </div>

                            {/* Lista limpa de insumos */}
                            {fichaLoading ? (
                              <div className="py-10 text-center text-sm font-semibold text-wine/70">
                                Carregando insumos da ficha técnica...
                              </div>
                            ) : fichaError ? (
                              <div className="rounded-2xl border border-berry/30 bg-pale/80 p-4 text-xs font-semibold text-wine">
                                {fichaError}
                              </div>
                            ) : ficha.length === 0 ? (
                              <div className="rounded-2xl border border-petal/35 bg-cream/30 p-6 text-center text-xs font-medium text-wine/75">
                                Este procedimento não possui insumos vinculados na ficha técnica.
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="grid grid-cols-[minmax(0,1.6fr)_100px_100px_110px] items-center px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/50 border-b border-petal/25">
                                  <div>Insumo</div>
                                  <div className="text-center">Qtd.</div>
                                  <div className="text-right">Unitário</div>
                                  <div className="text-right">Total</div>
                                </div>

                                <div className="divide-y divide-petal/15">
                                  {linhas.map((x) => (
                                    <div
                                      key={x.f.idInsumo}
                                      className="grid grid-cols-[minmax(0,1.6fr)_100px_100px_110px] items-center px-3 py-3 text-xs transition-colors hover:bg-cream/40 rounded-xl"
                                    >
                                      <div className="min-w-0 pr-2">
                                        <span className="block truncate font-semibold text-ink">
                                          {x.insumo?.nome ?? "—"}
                                        </span>
                                      </div>
                                      <div className="text-center font-medium tabular-nums text-ink/75">
                                        {x.f.quantidadeUtilizada}{" "}
                                        {x.insumo?.unidadeMedida ?? ""}
                                      </div>
                                      <div className="text-right font-medium tabular-nums text-ink/60">
                                        {x.custoUnitario === null
                                          ? "—"
                                          : dinheiro(x.custoUnitario)}
                                      </div>
                                      <div className="text-right font-bold tabular-nums text-wine">
                                        {x.custo === null ? "—" : dinheiro(x.custo)}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between border-t-2 border-petal/30 px-3 pt-3.5 mt-2">
                                  <span className="font-display text-xs font-bold uppercase tracking-wider text-wine/75">
                                    Total de Insumos
                                  </span>
                                  <span className="font-display text-lg font-bold tabular-nums text-berry">
                                    {dinheiro(custoInsumos)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {linhas.some((x) => x.custo === null) && (
                              <div className="flex items-center gap-2.5 rounded-xl border border-petal/50 bg-cream/50 p-3 text-xs font-medium text-wine/80">
                                <AlertCircle className="h-4 w-4 shrink-0 text-berry" />
                                <span>
                                  Há insumos sem compras registradas nesta competência.
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {!config && (
                          <div className="flex items-center gap-2.5 rounded-2xl border border-petal/60 bg-pale/60 p-4 text-xs font-medium text-wine">
                            <AlertCircle className="h-4 w-4 shrink-0 text-berry" />
                            <span>
                              Salve a margem de segurança e o lucro desejado na aba Configuração para habilitar o cálculo local.
                            </span>
                          </div>
                        )}

                        {fixoMin === null && (
                          <div className="flex items-center gap-2.5 rounded-2xl border border-petal/60 bg-pale/60 p-4 text-xs font-medium text-wine">
                            <AlertCircle className="h-4 w-4 shrink-0 text-berry" />
                            <span>
                              Informe os dias trabalhados e horas disponíveis no Perfil da Empresa para calcular o custo fixo por minuto.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Coluna da direita: Composição do Preço */}
                      <div className="rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-[0_8px_24px_-8px_rgba(107,21,48,0.12)] space-y-5 sm:p-6 lg:col-span-5 lg:sticky lg:top-6">
                        <div className="border-b border-petal/30 pb-3">
                          <h3 className="font-display text-lg font-bold text-wine">
                            Composição do Preço
                          </h3>
                          <p className="text-xs font-medium text-ink/60">
                            Custos e margens aplicados ao procedimento
                          </p>
                        </div>

                        <div className="divide-y divide-petal/25 text-xs sm:text-[13px]">
                          <div className="flex justify-between gap-3 py-2 text-ink/80">
                            <span>Custo dos insumos</span>
                            <span className="font-bold tabular-nums text-wine">
                              {simulacaoBackend
                                ? dinheiro(simulacaoBackend.custoInsumos)
                                : simulation
                                  ? dinheiro(custoInsumos)
                                  : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 py-2 text-ink/80">
                            <span>Custo fixo por minuto</span>
                            <span className="font-bold tabular-nums text-wine">
                              {simulacaoBackend
                                ? `${dinheiro(simulacaoBackend.custoFixoPorMinuto)} × ${simulacaoBackend.duracaoMinutos} min`
                                : fixoMin === null
                                  ? "—"
                                  : `${dinheiro(fixoMin)} × ${procedimento?.duracaoMinutos ?? "—"} min`}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 py-2 text-ink/80">
                            <span>Custo fixo do procedimento</span>
                            <span className="font-bold tabular-nums text-wine">
                              {simulacaoBackend
                                ? dinheiro(simulacaoBackend.custoFixoProcedimento)
                                : simulation
                                  ? dinheiro(simulation.custoFixoProcedimento)
                                  : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 py-2.5 font-bold text-wine">
                            <span>Custo do procedimento</span>
                            <span className="tabular-nums">
                              {simulacaoBackend
                                ? dinheiro(simulacaoBackend.custoProcedimento)
                                : simulation
                                  ? dinheiro(simulation.custoProcedimento)
                                  : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 py-2 text-ink/80">
                            <span>Margem de segurança</span>
                            <span className="font-bold tabular-nums text-wine">
                              {simulacaoBackend
                                ? percentual(simulacaoBackend.margemSeguranca)
                                : simulation
                                  ? `${dinheiro(simulation.valorMargem)} (${percentual(config?.margemSeguranca ?? 0)})`
                                  : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 py-2 text-ink/80">
                            <span>Lucro desejado</span>
                            <span className="font-bold tabular-nums text-wine">
                              {simulacaoBackend
                                ? percentual(simulacaoBackend.lucroDesejado)
                                : simulation
                                  ? `${dinheiro(simulation.valorLucro)} (${percentual(config?.lucroDesejado ?? 0)})`
                                  : "—"}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-[20px] border border-petal/55 bg-gradient-to-br from-pale/90 via-white/85 to-cream/90 p-5">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/65">
                            Preço Sugerido
                          </span>
                          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-wine sm:text-[34px]">
                            {precoSugerido != null ? dinheiro(precoSugerido) : "—"}
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-ink/60">
                            Calculado sobre o custo total somado às margens configuradas
                          </p>
                        </div>

                        {procedimento?.precoPadrao != null && precoSugerido != null && (
                          <div className="rounded-2xl border border-petal/45 bg-white/75 p-3.5 text-xs text-wine space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-ink/65">Preço padrão atual:</span>
                              <strong className="font-bold tabular-nums">
                                {dinheiro(procedimento.precoPadrao)}
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink/65">Diferença sugerida:</span>
                              <strong
                                className={`font-bold tabular-nums ${
                                  precoSugerido - procedimento.precoPadrao >= 0
                                    ? "text-wine"
                                    : "text-berry"
                                }`}
                              >
                                {precoSugerido - procedimento.precoPadrao >= 0
                                  ? "+"
                                  : ""}
                                {dinheiro(precoSugerido - procedimento.precoPadrao)} (
                                {percentual(
                                  ((precoSugerido - procedimento.precoPadrao) /
                                    procedimento.precoPadrao) *
                                    100
                                )}
                                )
                              </strong>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={precoSugerido == null}
                          onClick={() => setConfirmPrice(true)}
                          className="group shine inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-5 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          <span>Definir como preço padrão</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal de confirmação do preço padrão */}
      {confirmPrice && procedimento && precoSugerido != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => {
            if (!savingPrice) setConfirmPrice(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-petal/40 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-petal/25 pb-4">
              <h3 className="font-display text-xl font-bold text-wine">
                Confirmar Preço Padrão
              </h3>
              <p className="mt-1 text-xs font-medium text-ink/60">
                Atualização do valor de referência do procedimento
              </p>
            </div>

            <p className="my-5 font-sans text-xs leading-relaxed text-ink/80 sm:text-sm">
              Deseja definir{" "}
              <strong className="font-bold text-wine">
                {dinheiro(precoSugerido)}
              </strong>{" "}
              como o preço padrão de{" "}
              <strong className="font-bold text-wine">
                {procedimento.nome}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-3 border-t border-petal/25 pt-5">
              <button
                type="button"
                disabled={savingPrice}
                onClick={() => setConfirmPrice(false)}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-petal/60 bg-white/70 px-5 text-sm font-bold text-wine transition-colors hover:bg-pale"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingPrice}
                onClick={() => void setDefaultPrice()}
                className="shine inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-6 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all hover:from-wine hover:to-wine active:scale-[0.98] disabled:opacity-50"
              >
                {savingPrice ? "Salvando..." : "Confirmar Preço"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão da forma de pagamento */}
      {deleteForma && (
        <FinanceiroDeleteModal
          isOpen={!!deleteForma}
          title="Excluir Forma de Pagamento"
          itemName={deleteForma.nome}
          itemTypeLabel="a forma de pagamento"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteForma(null)}
        />
      )}
    </AppShell>
  );
}
