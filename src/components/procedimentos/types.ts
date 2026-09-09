import type { UnidadeMedida } from "@/components/insumos/types";

/**
 * Insumo simplificado para uso no select da Ficha Técnica.
 * Reaproveita o formato já usado pela tela de Insumos (idInsumo numérico,
 * vindo do backend real via insumoService).
 */
export interface InsumoDisponivel {
  idInsumo: number;
  nome: string;
  unidadeMedida: UnidadeMedida;
}

export interface FichaTecnicaItem {
  idFichaTecnica?: number;
  idInsumo: number;
  quantidadeUtilizada: number;
}

export interface Procedimento {
  idProcedimento: number;
  nome: string;
  duracaoMinutos: number;
  precoPadrao: number | null;
  itensFichaTecnica: FichaTecnicaItem[];
  dataCadastro?: string;
}

export interface FichaTecnicaFormRow {
  idTemp: string;
  idInsumo: string;
  quantidadeUtilizada: string;
}

export interface ProcedimentoFormData {
  nome: string;
  duracaoMinutos: string;
  precoPadrao: string;
  itensFichaTecnica: FichaTecnicaFormRow[];
}

export interface ProcedimentoFormErrors {
  nome?: string;
  duracaoMinutos?: string;
  precoPadrao?: string;
  itensFichaTecnica?: Record<
    string,
    {
      idInsumo?: string;
      quantidadeUtilizada?: string;
    }
  >;
}

export type ProcedimentoSortOption =
  | "nome_asc"
  | "nome_desc"
  | "duracao_asc"
  | "duracao_desc"
  | "preco_asc"
  | "preco_desc";
