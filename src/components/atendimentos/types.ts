/**
 * Atendimento (RF019/RF020).
 * `nomeProcedimento` e `nomeFormaPagamento` são os nomes resolvidos a partir
 * dos FKs (`idProcedimento` / `idFormaPagamento`) para exibição na listagem.
 * `dataAtendimento` usa o formato ISO `yyyy-mm-dd` (valor do input type="date").
 */
export interface Atendimento {
  idAtendimento: number;
  dataAtendimento: string;
  nomeCliente: string;
  idProcedimento: number;
  nomeProcedimento: string;
  valorCobrado: number;
  idFormaPagamento: number;
  nomeFormaPagamento: string;
  tempoAdicional: number;
  desperdicioMateriais: number;
}

/** Procedimento simplificado para o select do formulário. */
export interface ProcedimentoOpcao {
  idProcedimento: number;
  nome: string;
  precoPadrao: number | null;
}

/** Forma de pagamento simplificada para o select do formulário. */
export interface FormaPagamentoOpcao {
  idFormaPagamento: number;
  nome: string;
  taxaPercentual?: number;
}

/** Dados já convertidos que o formulário entrega ao salvar. */
export interface AtendimentoInput {
  dataAtendimento: string;
  nomeCliente: string;
  idProcedimento: number;
  valorCobrado: number;
  idFormaPagamento: number;
  tempoAdicional: number;
  desperdicioMateriais: number;
}

/** Estado bruto (strings) dos campos do formulário. */
export interface AtendimentoFormData {
  dataAtendimento: string;
  nomeCliente: string;
  idProcedimento: string;
  valorCobrado: string;
  idFormaPagamento: string;
  tempoAdicional: string;
  desperdicioMateriais: string;
}

export type AtendimentoFormErrors = {
  [K in keyof AtendimentoFormData]?: string | undefined;
};

/** Um atendimento tem imprevisto quando há tempo adicional ou desperdício. */
export function temImprevisto(a: Pick<Atendimento, "tempoAdicional" | "desperdicioMateriais">) {
  return a.tempoAdicional > 0 || a.desperdicioMateriais > 0;
}

/** Data de hoje (fuso local) no formato yyyy-mm-dd. */
export function hojeISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** yyyy-mm-dd → dd/mm/aaaa (sem passar por Date, evitando erro de fuso). */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** 1234.5 → R$ 1.234,50 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

/** Texto curto que descreve o imprevisto (usado em tooltips). */
export function descreverImprevisto(
  a: Pick<Atendimento, "tempoAdicional" | "desperdicioMateriais">,
): string {
  const partes: string[] = [];
  if (a.tempoAdicional > 0) partes.push(`+${a.tempoAdicional} min de tempo adicional`);
  if (a.desperdicioMateriais > 0)
    partes.push(`${formatarMoeda(a.desperdicioMateriais)} de desperdício de materiais`);
  return partes.join(" · ");
}
