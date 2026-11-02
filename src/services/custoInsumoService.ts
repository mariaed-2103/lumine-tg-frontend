import { apiFetch } from "@/services/api";

export interface CustoUnitarioInsumo {
  idInsumo: number;
  nome: string;
  unidadeMedida: string;
  custoUnitario: number | null;
}

export async function listarCustosUnitariosInsumos(
  dataLimite: string,
): Promise<CustoUnitarioInsumo[]> {
  const response = await apiFetch(
    `/insumos/custos-unitarios?dataLimite=${encodeURIComponent(dataLimite)}`,
  );
  if (!response.ok) {
    throw new Error("Não foi possível calcular os custos dos insumos.");
  }
  return response.json();
}
