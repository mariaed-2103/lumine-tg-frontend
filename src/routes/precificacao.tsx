import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Tag,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SemPerfilBanner } from "@/components/layout/SemPerfilBanner";
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
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-wine">Precificação</h1>
          <p className="mt-1 text-xs sm:text-sm text-wine/70 font-medium">
            Defina os parâmetros financeiros e simule o preço dos seus procedimentos
          </p>
        </header>

        <section className="rounded-2xl border border-petal/40 bg-white p-5 sm:p-7 shadow-xs">
          {/* Abas com visual de pílula idêntico ao padrão do sistema */}
          <FinanceiroTabs value={aba} onChange={setAba} />

          <div
            id="painel-precificacao"
            role="tabpanel"
            aria-labelledby={`tab-${aba}`}
          >
          {loading ? (
            <div className="py-12 text-center text-xs sm:text-sm text-wine/70 font-medium">
              Carregando dados de precificação...
            </div>
          ) : (
            <>
              {errorsLoad.length > 0 && (
                <div className="mb-5 flex items-center justify-between rounded-2xl border border-petal/60 bg-pale/70 p-4 text-xs font-medium text-wine">
                  <span>{errorsLoad[0]}</span>
                  <button
                    className="font-bold underline hover:text-berry transition-colors cursor-pointer"
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
                <div className="space-y-6">
                  {/* Filtros de Competência e Procedimento */}
                  <div className="rounded-2xl bg-cream/50 border border-petal/40 p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="competencia-sim"
                          className="block text-xs font-bold text-wine mb-1.5"
                        >
                          Mês de Competência
                        </label>
                        <input
                          id="competencia-sim"
                          type="month"
                          value={competencia}
                          onChange={(e) => setCompetencia(e.target.value)}
                          className="w-full rounded-xl border border-petal/50 bg-white px-3.5 py-2.5 text-xs font-medium text-ink outline-none transition focus:border-berry focus:ring-1 focus:ring-berry"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="procedimento-sim"
                          className="block text-xs font-bold text-wine mb-1.5"
                        >
                          Procedimento para Simulação
                        </label>
                        <select
                          id="procedimento-sim"
                          value={selected}
                          onChange={(e) => setSelected(e.target.value)}
                          className="w-full rounded-xl border border-petal/50 bg-white px-3.5 py-2.5 text-xs font-medium text-ink outline-none transition focus:border-berry focus:ring-1 focus:ring-berry cursor-pointer"
                        >
                          <option value="">Selecione um procedimento</option>
                          {procedimentos.map((p) => (
                            <option key={p.idProcedimento} value={p.idProcedimento}>
                              {p.nome} · {p.duracaoMinutos} min
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {procedimentos.length === 0 && (
                      <p className="mt-3 text-xs text-wine/70 font-medium">
                        Nenhum procedimento cadastrado. Cadastre procedimentos no menu para simular preços.
                      </p>
                    )}
                  </div>

                  {!selected ? (
                    <div className="py-12 px-4 text-center max-w-md mx-auto">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-pale flex items-center justify-center mb-4 border border-petal/40 text-berry">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-wine mb-1">
                        Selecione um procedimento
                      </h3>
                      <p className="text-xs text-wine/70 leading-relaxed font-sans">
                        Escolha um procedimento acima para analisar a ficha técnica, custos fixos calculados e obter a sugestão de preço ideal.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Coluna da esquerda (Espaçosa para a tabela de insumos) */}
                      <div className="lg:col-span-7 xl:col-span-7 space-y-5">
                        {procedimento && (
                          <div className="rounded-2xl bg-white border border-petal/40 p-5 shadow-xs space-y-4">
                            {/* Destaque do procedimento */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-petal/30">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-berry block">
                                  Procedimento Selecionado
                                </span>
                                <h3 className="font-display font-bold text-lg text-wine">
                                  {procedimento.nome}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 text-xs bg-cream px-3 py-1.5 rounded-full border border-petal/50 text-wine font-medium">
                                  <Clock className="w-3.5 h-3.5 text-rose" />
                                  <span>{procedimento.duracaoMinutos} min</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 text-xs bg-cream px-3 py-1.5 rounded-full border border-petal/50 text-wine font-medium">
                                  <Tag className="w-3.5 h-3.5 text-berry" />
                                  <span>
                                    Preço padrão:{" "}
                                    <strong className="text-wine">
                                      {procedimento.precoPadrao == null
                                        ? "Não definido"
                                        : dinheiro(procedimento.precoPadrao)}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Título e resumo de insumos */}
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <h4 className="font-display font-bold text-sm text-wine">
                                  Insumos da Ficha Técnica
                                </h4>
                                <p className="text-[11px] text-wine/70 font-medium">
                                  Custos calculados com base nas compras desta competência
                                </p>
                              </div>
                              {ficha.length > 0 && (
                                <span className="text-xs font-bold text-wine bg-cream px-3 py-1 rounded-full border border-petal/40">
                                  Total: <strong className="text-berry">{dinheiro(custoInsumos)}</strong>
                                </span>
                              )}
                            </div>

                            {/* Tabela estilizada no padrão de design do Lumine */}
                            {fichaLoading ? (
                              <div className="py-8 text-center text-xs text-wine/70">
                                Carregando insumos da ficha técnica...
                              </div>
                            ) : fichaError ? (
                              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                                {fichaError}
                              </div>
                            ) : ficha.length === 0 ? (
                              <div className="p-6 text-center rounded-2xl bg-cream border border-petal/40 text-xs text-wine/80">
                                Este procedimento não possui insumos na ficha técnica. Cadastre ao menos um insumo para simular o preço com precisão.
                              </div>
                            ) : (
                              <div className="overflow-hidden rounded-2xl border border-petal/40 bg-white shadow-2xs">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-cream border-b border-petal/40 text-wine font-display font-bold text-[11px] uppercase tracking-wider">
                                      <th className="py-3.5 px-4">Insumo</th>
                                      <th className="py-3.5 px-3 text-center">Quantidade Utilizada</th>
                                      <th className="py-3.5 px-3 text-right">Custo Unitário</th>
                                      <th className="py-3.5 px-4 text-right">Custo Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-petal/20 text-xs text-ink font-medium">
                                    {linhas.map((x) => (
                                      <tr
                                        key={x.f.idInsumo}
                                        className="hover:bg-cream/40 transition-colors"
                                      >
                                        <td className="py-3.5 px-4 font-bold text-wine">
                                          {x.insumo?.nome ?? "—"}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                          <span className="inline-flex items-center text-xs bg-cream px-2.5 py-0.5 rounded-full border border-petal/40 text-wine tabular-nums">
                                            {x.f.quantidadeUtilizada} {x.insumo?.unidadeMedida ?? ""}
                                          </span>
                                        </td>
                                        <td className="py-3.5 px-3 text-right tabular-nums text-wine/80">
                                          {x.custoUnitario === null ? "—" : dinheiro(x.custoUnitario)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-wine">
                                          {x.custo === null ? "—" : dinheiro(x.custo)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-cream/50 border-t-2 border-petal/50 font-display font-bold text-xs sm:text-sm text-wine">
                                      <td colSpan={3} className="py-3.5 px-4">
                                        Total de Insumos
                                      </td>
                                      <td className="py-3.5 px-4 text-right tabular-nums text-berry text-sm sm:text-base font-bold">
                                        {dinheiro(custoInsumos)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            )}

                            {linhas.some((x) => x.custo === null) && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>Há insumos sem compras registradas no período. Custo unitário considerado zerado no cálculo.</span>
                              </div>
                            )}
                          </div>
                        )}

                        {!config && (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Configure a margem de segurança e o lucro desejado na aba Configuração para habilitar o cálculo ideal.</span>
                          </div>
                        )}

                        {fixoMin === null && (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Informe os dias trabalhados e horas disponíveis no Perfil da Empresa para cálculo do custo fixo por minuto.</span>
                          </div>
                        )}
                      </div>

                      {/* Coluna da direita: Composição do Preço (Fixa e Elegante) */}
                      <div className="lg:col-span-5 xl:col-span-5 rounded-2xl border border-petal/40 bg-white p-5 sm:p-6 shadow-xs space-y-4 lg:sticky lg:top-6">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-petal/30">
                          <div className="w-9 h-9 rounded-xl bg-pale border border-petal/40 flex items-center justify-center text-berry shrink-0">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-base text-wine">Composição do Preço</h3>
                            <p className="text-[11px] text-wine/70 font-medium">Detalhamento dos custos e margens</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between gap-3 text-wine">
                            <span>Custo dos insumos</span>
                            <span className="tabular-nums font-semibold">
                              {simulacaoBackend
                                ? dinheiro(simulacaoBackend.custoInsumos)
                                : simulation
                                ? dinheiro(custoInsumos)
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-wine">
                            <span>Custo fixo por minuto</span>
                            <span className="tabular-nums font-semibold">
                              {simulacaoBackend
                                ? `${dinheiro(simulacaoBackend.custoFixoPorMinuto)} × ${simulacaoBackend.duracaoMinutos} min`
                                : fixoMin === null
                                ? "—"
                                : `${dinheiro(fixoMin)} × ${procedimento?.duracaoMinutos ?? "—"} min`}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-wine">
                            <span>Custo fixo do procedimento</span>
                            <span className="tabular-nums font-semibold">
                              {simulacaoBackend
                                ? dinheiro(simulacaoBackend.custoFixoProcedimento)
                                : simulation
                                ? dinheiro(simulation.custoFixoProcedimento)
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 border-t border-petal/40 pt-2.5 font-bold text-wine text-xs sm:text-sm">
                            <span>Custo do procedimento</span>
                            <span className="tabular-nums">
                              {simulacaoBackend
                                ? dinheiro(simulacaoBackend.custoProcedimento)
                                : simulation
                                ? dinheiro(simulation.custoProcedimento)
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-wine">
                            <span>Margem de segurança</span>
                            <span className="tabular-nums font-semibold">
                              {simulacaoBackend
                                ? percentual(simulacaoBackend.margemSeguranca)
                                : simulation
                                ? `${dinheiro(simulation.valorMargem)} (${percentual(config?.margemSeguranca ?? 0)})`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-wine">
                            <span>Lucro desejado</span>
                            <span className="tabular-nums font-semibold">
                              {simulacaoBackend
                                ? percentual(simulacaoBackend.lucroDesejado)
                                : simulation
                                ? `${dinheiro(simulation.valorLucro)} (${percentual(config?.lucroDesejado ?? 0)})`
                                : "—"}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-pale to-cream/80 border border-petal/60 p-4 sm:p-5 text-center sm:text-left">
                          <span className="text-[11px] font-bold text-wine/80 uppercase tracking-wider block mb-1 font-display">
                            Preço Sugerido
                          </span>
                          <p className="font-display text-3xl font-bold tabular-nums text-wine">
                            {precoSugerido != null ? dinheiro(precoSugerido) : "—"}
                          </p>
                          <p className="text-[10px] text-wine/60 mt-1 leading-snug font-sans">
                            Preço sugerido = custo do procedimento ÷ (1 − margem de segurança − lucro desejado)
                          </p>
                        </div>

                        {procedimento?.precoPadrao != null && precoSugerido != null && (
                          <div className="rounded-xl bg-cream/60 border border-petal/40 p-3 text-xs text-wine space-y-1">
                            <div className="flex justify-between">
                              <span className="text-wine/70">Preço padrão atual:</span>
                              <strong className="tabular-nums">{dinheiro(procedimento.precoPadrao)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-wine/70">Diferença sugerida:</span>
                              <strong
                                className={`tabular-nums ${
                                  precoSugerido - procedimento.precoPadrao >= 0
                                    ? "text-emerald-700"
                                    : "text-amber-800"
                                }`}
                              >
                                {precoSugerido - procedimento.precoPadrao >= 0 ? "+" : ""}
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
                          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-berry hover:bg-wine text-white font-bold text-xs py-3 px-4 transition-all duration-200 shadow-md shadow-berry/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => {
              if (!savingPrice) setConfirmPrice(false);
            }}
          >
            <div
              className="bg-white w-full max-w-md rounded-[32px] border border-petal/40 shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-pale border border-petal/40 flex items-center justify-center text-berry shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-wine">
                    Confirmar Preço Padrão
                  </h3>
                  <p className="text-xs text-wine/70 font-medium">
                    Atualização do valor de referência
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-wine/80 leading-relaxed font-sans mb-6">
                Deseja definir <strong>{dinheiro(precoSugerido)}</strong> como o preço padrão do procedimento <strong>{procedimento.nome}</strong>?
              </p>

              <div className="flex justify-end items-center gap-3">
                <button
                  type="button"
                  disabled={savingPrice}
                  onClick={() => setConfirmPrice(false)}
                  className="rounded-full border border-petal/60 hover:bg-cream text-wine font-bold px-5 py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingPrice}
                  onClick={() => void setDefaultPrice()}
                  className="rounded-full bg-berry hover:bg-wine text-white font-bold px-6 py-2.5 text-xs transition-all shadow-md shadow-berry/20 cursor-pointer disabled:opacity-50"
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
      </div>
    </AppShell>
  );
}
