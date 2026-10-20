import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
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
import { listarProcedimentos, editarProcedimento } from "@/services/procedimentoService";
import { listarFichaTecnica } from "@/services/fichaTecnicaService";
import { listarInsumos } from "@/services/insumoService";
import { listarCompras } from "@/services/compraService";
import { listarDespesasFixas } from "@/services/despesaFixaService";
import {
  calcularCustoFixoPorMinuto,
  calcularCustoUnitarioInsumo,
  calcularSimulacao,
} from "@/lib/calcularSimulacao";

export const Route = createFileRoute("/precificacao")({ component: PrecificacaoPage });
type Aba = "configuracao" | "pagamentos" | "simulacao";
type Perfil = {
  idPerfilEmpresa: number;
  diasTrabalhadosMes?: number;
  horasDisponiveisDia?: number;
};
type ItemFicha = { idInsumo: number; quantidadeUtilizada: number };
const input =
  "w-full rounded-md border border-petal bg-white px-3 py-2 text-sm text-ink outline-none focus:border-berry";
const card = "rounded-lg border border-petal bg-white p-5";
const dinheiro = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const percentual = (n: number) => `${n.toFixed(2).replace(".", ",")}%`;
const numero = (v: string) =>
  Number(v.trim().includes(",") ? v.trim().replace(/\./g, "").replace(",", ".") : v.trim());

function PrecificacaoPage() {
  const [aba, setAba] = useState<Aba>("configuracao");
  const [loading, setLoading] = useState(true);
  const [errorsLoad, setErrorsLoad] = useState<string[]>([]);
  const [config, setConfig] = useState<ConfiguracaoFinanceira | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [compras, setCompras] = useState<CompraInsumo[]>([]);
  const [despesas, setDespesas] = useState<DespesaFixa[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [margem, setMargem] = useState("");
  const [lucro, setLucro] = useState("");
  const [editConfig, setEditConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [filter, setFilter] = useState("");
  const [formaEdit, setFormaEdit] = useState<FormaPagamento | null>(null);
  const [formaNome, setFormaNome] = useState("");
  const [formaTaxa, setFormaTaxa] = useState("");
  const [formaError, setFormaError] = useState("");
  const [formaModalOpen, setFormaModalOpen] = useState(false);
  const [savingForma, setSavingForma] = useState(false);
  const [deleteForma, setDeleteForma] = useState<FormaPagamento | null>(null);
  const [selected, setSelected] = useState("");
  const [ficha, setFicha] = useState<ItemFicha[]>([]);
  const [fichaLoading, setFichaLoading] = useState(false);
  const [fichaError, setFichaError] = useState("");
  const [confirmPrice, setConfirmPrice] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorsLoad([]);
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
        setMargem(String(c.margemSeguranca).replace(".", ","));
        setLucro(String(c.lucroDesejado).replace(".", ","));
      } catch {
        setConfig(null);
      }
    } else
      errs.push(
        jobs[0].reason instanceof Error
          ? jobs[0].reason.message
          : "Perfil da empresa indisponível.",
      );
    if (jobs[1].status === "fulfilled") setProcedimentos(jobs[1].value);
    else
      errs.push(
        jobs[1].reason instanceof Error
          ? jobs[1].reason.message
          : "Não foi possível carregar procedimentos.",
      );
    if (jobs[2].status === "fulfilled") setFormas(jobs[2].value);
    else
      errs.push(
        jobs[2].reason instanceof Error
          ? jobs[2].reason.message
          : "Não foi possível carregar formas de pagamento.",
      );
    if (jobs[3].status === "fulfilled") setCompras(jobs[3].value);
    else
      errs.push(
        jobs[3].reason instanceof Error
          ? jobs[3].reason.message
          : "Não foi possível carregar compras.",
      );
    if (jobs[4].status === "fulfilled") setDespesas(jobs[4].value);
    else
      errs.push(
        jobs[4].reason instanceof Error
          ? jobs[4].reason.message
          : "Não foi possível carregar despesas fixas.",
      );
    if (jobs[5].status === "fulfilled") setInsumos(jobs[5].value);
    else
      errs.push(
        jobs[5].reason instanceof Error
          ? jobs[5].reason.message
          : "Não foi possível carregar insumos.",
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
    const r = await fetch(`http://localhost:8080/perfis-empresa/usuario/${id}`);
    if (!r.ok) throw new Error("Não foi possível carregar o Perfil da Empresa.");
    return r.json();
  }

  const procedimento = procedimentos.find((p) => p.idProcedimento === Number(selected));
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
          e instanceof Error ? e.message : "Não foi possível carregar a ficha técnica.",
        ),
      )
      .finally(() => setFichaLoading(false));
  }, [selected]);

  const linhas = ficha.map((f) => {
    const insumo = insumos.find((i) => i.idInsumo === f.idInsumo);
    const compra = compras
      .filter((c) => c.idInsumo === f.idInsumo)
      .sort((a, b) => b.dataCompra.localeCompare(a.dataCompra))[0];
    const custoUnitario = calcularCustoUnitarioInsumo(
      insumo?.quantidadePorEmbalagem ?? 0,
      compra ?? null,
    );
    return {
      f,
      insumo,
      custoUnitario,
      custo: custoUnitario === null ? null : custoUnitario * f.quantidadeUtilizada,
    };
  });
  const custoInsumos = linhas.reduce((sum, x) => sum + (x.custo ?? 0), 0);
  const now = new Date();
  const despesasAtivasMes = despesas.filter(
    (d) =>
      d.dataInicio <=
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}` &&
      (!d.dataFim ||
        d.dataFim >= `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`),
  );
  const despesasMes = despesasAtivasMes.reduce((sum, d) => sum + d.valor, 0);
  const valorProLabore = despesasAtivasMes
    .filter((d) => d.categoria.toLocaleLowerCase("pt-BR").includes("pró-labore"))
    .reduce((sum, d) => sum + d.valor, 0);
  const fixoMin = calcularCustoFixoPorMinuto(
    despesasMes,
    valorProLabore,
    perfil?.diasTrabalhadosMes,
    perfil?.horasDisponiveisDia,
    config?.provisaoFeriasAtiva ? (config.percentualProvisaoFerias ?? 0) : 0,
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
  const totalPercent =
    (Number(margem.replace(",", ".")) || 0) + (Number(lucro.replace(",", ".")) || 0);

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    const m = numero(margem),
      l = numero(lucro);
    if (!margem.trim() || !Number.isFinite(m)) {
      toast.error("Informe a margem de segurança.");
      return;
    }
    if (!lucro.trim() || !Number.isFinite(l)) {
      toast.error("Informe o lucro desejado.");
      return;
    }
    if (m < 0 || l < 0) {
      toast.error("O valor deve ser maior ou igual a 0%.");
      return;
    }
    if (m + l >= 100) {
      toast.error("A soma da margem de segurança com o lucro desejado deve ser menor que 100%.");
      return;
    }
    setSavingConfig(true);
    try {
      const saved = await salvarConfiguracaoFinanceira(perfil.idPerfilEmpresa, {
        ...(config ?? { provisaoFeriasAtiva: false, percentualProvisaoFerias: null }),
        margemSeguranca: m,
        lucroDesejado: l,
      });
      setConfig(saved);
      setEditConfig(false);
      toast.success("Configuração salva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSavingConfig(false);
    }
  }

  async function saveForma(e: React.FormEvent) {
    e.preventDefault();
    setFormaError("");
    const taxa = numero(formaTaxa);
    if (!formaNome.trim()) {
      setFormaError("Informe o nome da forma de pagamento.");
      return;
    }
    if (!formaTaxa.trim() || !Number.isFinite(taxa)) {
      setFormaError("Informe o percentual da taxa.");
      return;
    }
    if (taxa < 0) {
      setFormaError("A taxa não pode ser negativa.");
      return;
    }
    if (taxa > 100) {
      setFormaError("A taxa não pode ser maior que 100%.");
      return;
    }
    setSavingForma(true);
    try {
      const dados = { nome: formaNome.trim(), taxaPercentual: taxa };
      const saved = formaEdit
        ? await editarFormaPagamento(formaEdit.idFormaPagamento, dados)
        : await cadastrarFormaPagamento(dados);
      setFormas((old) =>
        formaEdit
          ? old.map((f) => (f.idFormaPagamento === saved.idFormaPagamento ? saved : f))
          : [...old, saved],
      );
      setFormaEdit(null);
      setFormaNome("");
      setFormaTaxa("");
      setFormaModalOpen(false);
      toast.success("Forma de pagamento salva.");
    } catch (e) {
      setFormaError(
        e instanceof Error ? e.message : "Não foi possível salvar a forma de pagamento.",
      );
    } finally {
      setSavingForma(false);
    }
  }

  async function setDefaultPrice() {
    if (!procedimento || !simulation) return;
    setSavingPrice(true);
    try {
      const updated = await editarProcedimento(procedimento.idProcedimento, {
        nome: procedimento.nome,
        duracaoMinutos: procedimento.duracaoMinutos,
        precoPadrao: Number(simulation.precoSugerido.toFixed(2)),
      });
      setProcedimentos((old) =>
        old.map((p) => (p.idProcedimento === updated.idProcedimento ? updated : p)),
      );
      setConfirmPrice(false);
      toast.success("Preço padrão atualizado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível atualizar o preço padrão.");
    } finally {
      setSavingPrice(false);
    }
  }

  const abas: { id: Aba; label: string }[] = [
    { id: "configuracao", label: "Configuração" },
    { id: "pagamentos", label: "Formas de pagamento" },
    { id: "simulacao", label: "Simulação de preço" },
  ];
  const fieldLabel = "mb-1 block text-sm font-medium text-wine";
  return (
    <AppShell mobileTitle="Precificação">
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-[22px] font-semibold text-wine">Precificação</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina os parâmetros financeiros e simule o preço dos seus procedimentos
          </p>
        </header>
        <section className={card}>
          <div className="mb-5 border-b border-petal pb-4">
            <div className="hidden gap-2 sm:flex">
              {abas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className={`rounded-md px-4 py-2 text-sm ${aba === a.id ? "bg-berry text-white" : "text-wine hover:bg-pale"}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <select
              className={`${input} sm:hidden`}
              value={aba}
              onChange={(e) => setAba(e.target.value as Aba)}
            >
              {abas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Carregando dados...</p>
          ) : (
            <>
              {errorsLoad.length > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-md border border-petal bg-pale p-3 text-sm text-wine">
                  <span>{errorsLoad[0]}</span>
                  <button className="underline" onClick={() => void load()}>
                    Tentar novamente
                  </button>
                </div>
              )}
              {aba === "configuracao" && (
                <div className={card}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold text-wine">
                      Configuração da precificação
                    </h2>
                    {config && !editConfig && (
                      <button
                        onClick={() => setEditConfig(true)}
                        className="inline-flex items-center gap-2 rounded-md border border-petal px-3 py-2 text-sm text-wine"
                      >
                        <Pencil size={16} />
                        Editar configuração
                      </button>
                    )}
                  </div>
                  {!config && !editConfig ? (
                    <div className="py-8 text-center">
                      <p className="mb-4 text-sm">Nenhuma configuração cadastrada</p>
                      <button
                        onClick={() => setEditConfig(true)}
                        className="rounded-md bg-berry px-4 py-2 text-sm text-white"
                      >
                        Configurar agora
                      </button>
                    </div>
                  ) : editConfig ? (
                    <form onSubmit={saveConfig} className="mt-5 max-w-xl space-y-4">
                      <label className={fieldLabel}>
                        Margem de segurança (%)
                        <input
                          className={input}
                          name="margemSeguranca"
                          type="text"
                          inputMode="decimal"
                          value={margem}
                          onChange={(e) => setMargem(e.target.value)}
                        />
                      </label>
                      <label className={fieldLabel}>
                        Lucro desejado (%)
                        <input
                          className={input}
                          name="lucroDesejado"
                          type="text"
                          inputMode="decimal"
                          value={lucro}
                          onChange={(e) => setLucro(e.target.value)}
                        />
                      </label>
                      <p
                        className={`text-sm ${totalPercent >= 100 ? "text-red-600" : "text-muted-foreground"}`}
                      >
                        Soma dos percentuais: {percentual(totalPercent)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={savingConfig}
                          className="rounded-md bg-berry px-4 py-2 text-sm text-white disabled:opacity-60"
                        >
                          {savingConfig ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditConfig(false)}
                          className="rounded-md border border-petal px-4 py-2 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <dl className="mt-5 grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <dt>Margem de segurança</dt>
                      <dd className="tabular-nums">{percentual(config!.margemSeguranca)}</dd>
                      <dt>Lucro desejado</dt>
                      <dd className="tabular-nums">{percentual(config!.lucroDesejado)}</dd>
                      <dt>Soma dos percentuais</dt>
                      <dd className="tabular-nums">
                        {percentual(config!.margemSeguranca + config!.lucroDesejado)}
                      </dd>
                      <dt>Última atualização</dt>
                      <dd>
                        {config!.dataAtualizacao
                          ? new Date(config!.dataAtualizacao).toLocaleString("pt-BR")
                          : "—"}
                      </dd>
                    </dl>
                  )}
                  <p className="mt-5 rounded-md bg-pale p-3 text-sm text-wine">
                    Esses parâmetros são usados na simulação de preço de cada procedimento.
                  </p>
                </div>
              )}

              {aba === "pagamentos" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                      <input
                        className={`${input} pl-9`}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Buscar por nome"
                      />
                    </label>
                    <button
                      onClick={() => {
                        setFormaEdit(null);
                        setFormaNome("");
                        setFormaTaxa("");
                        setFormaError("");
                        setFormaModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-berry px-4 py-2 text-sm text-white"
                    >
                      <Plus size={16} />
                      Nova forma de pagamento
                    </button>
                  </div>
                  {formas.filter((f) => f.nome.toLowerCase().includes(filter.toLowerCase()))
                    .length === 0 ? (
                    <div className="py-10 text-center text-sm">
                      Nenhuma forma de pagamento cadastrada{" "}
                      <button
                        className="ml-2 text-berry underline"
                        onClick={() => {
                          setFormaEdit(null);
                          setFormaNome("");
                          setFormaTaxa("");
                          setFormaError("");
                          setFormaModalOpen(true);
                        }}
                      >
                        Cadastrar
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border border-petal">
                      <table className="w-full min-w-[480px] text-sm">
                        <thead className="bg-pale text-wine">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Nome</th>
                            <th className="px-4 py-3 text-right font-medium">Taxa (%)</th>
                            <th className="px-4 py-3 text-right font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formas
                            .filter((f) => f.nome.toLowerCase().includes(filter.toLowerCase()))
                            .map((f) => (
                              <tr
                                key={f.idFormaPagamento}
                                className="border-t border-petal/60 hover:bg-cream"
                              >
                                <td className="px-4 py-3">{f.nome}</td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                  {percentual(f.taxaPercentual)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    title="Editar"
                                    onClick={() => {
                                      setFormaEdit(f);
                                      setFormaNome(f.nome);
                                      setFormaTaxa(String(f.taxaPercentual).replace(".", ","));
                                      setFormaError("");
                                      setFormaModalOpen(true);
                                    }}
                                    className="rounded p-1 text-wine hover:text-berry"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    title="Excluir"
                                    onClick={() => setDeleteForma(f)}
                                    className="rounded p-1 text-wine hover:text-red-600"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {aba === "simulacao" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className={`${card} space-y-4`}>
                    <h2 className="font-display text-lg font-semibold text-wine">Procedimento</h2>
                    <label className={fieldLabel}>
                      Procedimento
                      <select
                        className={input}
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {procedimentos.map((p) => (
                          <option key={p.idProcedimento} value={p.idProcedimento}>
                            {p.nome} · {p.duracaoMinutos} min
                          </option>
                        ))}
                      </select>
                    </label>
                    {procedimentos.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Cadastre um procedimento para simular o preço.
                      </p>
                    )}
                    {procedimento && (
                      <>
                        <div className="rounded-md bg-cream p-3 text-sm">
                          <strong>{procedimento.nome}</strong>
                          <div>Duração: {procedimento.duracaoMinutos} min</div>
                          <div>
                            Preço padrão atual:{" "}
                            {procedimento.precoPadrao == null
                              ? "Não definido"
                              : dinheiro(procedimento.precoPadrao)}
                          </div>
                        </div>
                        <h3 className="font-medium text-wine">Insumos da ficha técnica</h3>
                        {fichaLoading ? (
                          <p className="text-sm">Carregando ficha técnica...</p>
                        ) : fichaError ? (
                          <p className="text-sm text-red-600">{fichaError}</p>
                        ) : ficha.length === 0 ? (
                          <p className="text-sm text-wine">
                            Este procedimento não possui insumos na ficha técnica. Cadastre ao menos
                            um insumo para simular o preço.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[460px] text-sm">
                              <thead className="bg-pale">
                                <tr>
                                  <th className="p-2 text-left">Insumo</th>
                                  <th className="p-2 text-right">Quantidade utilizada</th>
                                  <th className="p-2 text-right">Custo unitário</th>
                                  <th className="p-2 text-right">Custo</th>
                                </tr>
                              </thead>
                              <tbody>
                                {linhas.map((x) => (
                                  <tr key={x.f.idInsumo} className="border-t border-petal/50">
                                    <td className="p-2">{x.insumo?.nome ?? "—"}</td>
                                    <td className="p-2 text-right tabular-nums">
                                      {x.f.quantidadeUtilizada} {x.insumo?.unidadeMedida}
                                    </td>
                                    <td className="p-2 text-right tabular-nums">
                                      {x.custoUnitario === null ? "—" : dinheiro(x.custoUnitario)}
                                    </td>
                                    <td className="p-2 text-right tabular-nums">
                                      {x.custo === null ? "—" : dinheiro(x.custo)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t border-petal font-semibold">
                                  <td colSpan={3} className="p-2">
                                    Total de insumos
                                  </td>
                                  <td className="p-2 text-right tabular-nums">
                                    {dinheiro(custoInsumos)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                        {linhas.some((x) => x.custo === null) && (
                          <p className="text-sm text-amber-800">
                            Insumo sem compra registrada: não é possível calcular o custo.
                          </p>
                        )}
                      </>
                    )}
                    {!config && (
                      <p className="text-sm text-wine">
                        Configure a margem de segurança e o lucro desejado na aba Configuração.
                      </p>
                    )}
                    {fixoMin === null && (
                      <p className="text-sm text-wine">
                        Informe os dias trabalhados e as horas disponíveis no Perfil da Empresa.
                      </p>
                    )}
                  </div>
                  <div className={`${card} space-y-3`}>
                    <h2 className="font-display text-lg font-semibold text-wine">
                      Composição do preço
                    </h2>
                    {[
                      ["Custo dos insumos", simulation ? dinheiro(custoInsumos) : "—"],
                      [
                        "Custo fixo por minuto",
                        fixoMin === null
                          ? "—"
                          : `${dinheiro(fixoMin)} × ${procedimento?.duracaoMinutos ?? "—"} min`,
                      ],
                      [
                        "Custo fixo do procedimento",
                        simulation ? dinheiro(simulation.custoFixoProcedimento) : "—",
                      ],
                      [
                        "Custo do procedimento",
                        simulation ? dinheiro(simulation.custoProcedimento) : "—",
                      ],
                      [
                        "Margem de segurança",
                        simulation
                          ? `${dinheiro(simulation.valorMargem)} (${percentual(config?.margemSeguranca ?? 0)})`
                          : "—",
                      ],
                      [
                        "Lucro desejado",
                        simulation
                          ? `${dinheiro(simulation.valorLucro)} (${percentual(config?.lucroDesejado ?? 0)})`
                          : "—",
                      ],
                    ].map(([label, value], i) => (
                      <div
                        key={label}
                        className={`flex justify-between gap-3 text-sm ${i === 3 ? "border-t border-petal pt-3 font-semibold" : ""}`}
                      >
                        <span>{label}</span>
                        <span className="tabular-nums text-right">{value}</span>
                      </div>
                    ))}
                    <div className="rounded-md bg-pale p-4">
                      <span className="text-sm text-wine">Preço sugerido</span>
                      <p className="font-display text-2xl font-semibold tabular-nums text-wine">
                        {simulation ? dinheiro(simulation.precoSugerido) : "—"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Preço sugerido = custo do procedimento ÷ (1 − margem de segurança − lucro
                      desejado)
                    </p>
                    {procedimento?.precoPadrao != null && simulation && (
                      <p className="text-sm">
                        Preço padrão atual: {dinheiro(procedimento.precoPadrao)} · Diferença:{" "}
                        {dinheiro(simulation.precoSugerido - procedimento.precoPadrao)} (
                        {percentual(
                          ((simulation.precoSugerido - procedimento.precoPadrao) /
                            procedimento.precoPadrao) *
                            100,
                        )}
                        )
                      </p>
                    )}
                    <button
                      disabled={!simulation}
                      onClick={() => setConfirmPrice(true)}
                      className="w-full rounded-md bg-berry px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Definir como preço padrão
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        {formaModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
            onClick={() => {
              if (!savingForma) setFormaModalOpen(false);
            }}
          >
            <form
              onSubmit={saveForma}
              onClick={(e) => e.stopPropagation()}
              className={`${card} w-full max-w-md space-y-4`}
            >
              <h2 className="font-display text-lg font-semibold">
                {formaEdit ? "Editar forma de pagamento" : "Nova forma de pagamento"}
              </h2>
              <label className={fieldLabel}>
                Nome
                <input
                  className={input}
                  name="nome"
                  maxLength={100}
                  value={formaNome}
                  onChange={(e) => setFormaNome(e.target.value)}
                />
              </label>
              <label className={fieldLabel}>
                Taxa percentual (%)
                <input
                  className={input}
                  name="taxaPercentual"
                  inputMode="decimal"
                  value={formaTaxa}
                  onChange={(e) => setFormaTaxa(e.target.value)}
                />
              </label>
              {formaError && <p className="text-sm text-red-600">{formaError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormaModalOpen(false)}
                  className="rounded-md border border-petal px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  disabled={savingForma}
                  className="rounded-md bg-berry px-4 py-2 text-sm text-white"
                >
                  {savingForma ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        )}
        {deleteForma && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
            <div className={`${card} w-full max-w-md`}>
              <div className="mb-3 flex items-center gap-2 text-wine">
                <AlertCircle size={18} />
                <h2 className="font-display text-lg font-semibold">Excluir {deleteForma.nome}?</h2>
              </div>
              <p className="text-sm">Essa ação não pode ser desfeita.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteForma(null)}
                  className="rounded-md border border-petal px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      await excluirFormaPagamento(deleteForma.idFormaPagamento);
                      setFormas((old) =>
                        old.filter((f) => f.idFormaPagamento !== deleteForma.idFormaPagamento),
                      );
                      setDeleteForma(null);
                      toast.success("Forma de pagamento excluída.");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Não foi possível excluir.");
                    }
                  }}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm text-white"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
        {confirmPrice && procedimento && simulation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
            <div className={`${card} w-full max-w-md`}>
              <h2 className="font-display text-lg font-semibold text-wine">
                Confirmar preço padrão
              </h2>
              <p className="mt-3 text-sm">
                Definir {dinheiro(simulation.precoSugerido)} como preço padrão de{" "}
                {procedimento.nome}?
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  disabled={savingPrice}
                  onClick={() => setConfirmPrice(false)}
                  className="rounded-md border border-petal px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  disabled={savingPrice}
                  onClick={() => void setDefaultPrice()}
                  className="rounded-md bg-berry px-4 py-2 text-sm text-white"
                >
                  {savingPrice ? "Salvando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
