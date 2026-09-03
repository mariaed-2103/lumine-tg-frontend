export type UnidadeMedida = "mL" | "g" | "unidade";

export interface Insumo {
  idInsumo: number;
  nome: string;
  unidadeMedida: UnidadeMedida;
  quantidadePorEmbalagem: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  dataCadastro?: string;
}

export interface InsumoFormData {
  nome: string;
  unidadeMedida: UnidadeMedida;
  quantidadePorEmbalagem: string | number;
  estoqueAtual: string | number;
  estoqueMinimo: string | number;
}

export interface InsumoFormErrors {
  nome?: string;
  unidadeMedida?: string;
  quantidadePorEmbalagem?: string;
  estoqueAtual?: string;
  estoqueMinimo?: string;
}

export type FilterOption =
  | "todos"
  | "estoque_baixo"
  | "mL"
  | "g"
  | "unidade";

export type SortOption =
  | "nome_asc"
  | "nome_desc"
  | "estoque_asc"
  | "estoque_desc";