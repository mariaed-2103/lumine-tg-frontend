// --- Módulo de Gestão Financeira ---

export type FinanceiroTab =
  | "despesas-fixas"
  | "despesas-variaveis"
  | "compras"
  | "formas-pagamento"
  | "configuracao";

// 1. Despesa Fixa (RF011)
export interface DespesaFixa {
  idDespesa: number;
  nome: string;
  valor: number;
  categoria: string;
  dataInicio: string;
  dataFim: string | null;
}

export interface DespesaFixaFormData {
  nome: string;
  valor: string;
  categoria: string;
  dataInicio: string;
  dataFim: string;
}

export interface DespesaFixaFormErrors {
  nome?: string;
  valor?: string;
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
}

// 2. Despesa Variável (RF012)
export interface DespesaVariavel {
  idDespesaVariavel: number;
  data: string;
  nome: string;
  valor: number;
  categoria: string;
}

export interface DespesaVariavelFormData {
  data: string;
  nome: string;
  valor: string;
  categoria: string;
}

export interface DespesaVariavelFormErrors {
  data?: string;
  nome?: string;
  valor?: string;
  categoria?: string;
}

// 3. Compra de Insumo (RF014)
// idInsumo aqui é number — referência ao Insumo real do backend (INT).
// Nos FormData, idInsumo permanece string pois vem de um <select>.
// A conversão Number(formData.idInsumo) acontece no momento do submit.
export interface CompraInsumo {
  idCompra: number;
  idInsumo: number;
  dataCompra: string;
  quantidadeComprada: number;
  valorTotalCompra: number;
  descricao?: string;
}

export interface CompraInsumoFormData {
  idInsumo: string; // string: vem de <select>, convertido para number no submit
  dataCompra: string;
  quantidadeComprada: string;
  valorTotalCompra: string;
  descricao: string;
}

export interface CompraInsumoFormErrors {
  idInsumo?: string;
  dataCompra?: string;
  quantidadeComprada?: string;
  valorTotalCompra?: string;
  descricao?: string;
}

// 4. Forma de Pagamento (RF016)
export interface FormaPagamento {
  idFormaPagamento: number;
  nome: string;
  taxaPercentual: number;
}

export interface FormaPagamentoFormData {
  nome: string;
  taxaPercentual: string;
}

export interface FormaPagamentoFormErrors {
  nome?: string;
  taxaPercentual?: string;
}

// 5. Configuração Financeira (RF013 e RF015)
export interface ConfiguracaoFinanceira {
  idConfiguracao?: number;
  margemSeguranca: number;
  lucroDesejado: number;
  provisaoFeriasAtiva: boolean;
  percentualProvisaoFerias: number | null;
  dataAtualizacao?: string;
}

export interface ConfiguracaoFinanceiraFormData {
  margemSeguranca: string;
  lucroDesejado: string;
  provisaoFeriasAtiva: boolean;
  percentualProvisaoFerias: string;
}

export interface ConfiguracaoFinanceiraFormErrors {
  margemSeguranca?: string;
  lucroDesejado?: string;
  percentualProvisaoFerias?: string;
  geral?: string;
}
