export type EntradaSimulacao = {
  duracaoMinutos: number;
  custoInsumos: number;
  custoFixoPorMinuto: number;
  margemSeguranca: number;
  lucroDesejado: number;
};

export function calcularSimulacao(e: EntradaSimulacao) {
  const custoFixoProcedimento = e.custoFixoPorMinuto * e.duracaoMinutos;
  const custoProcedimento = e.custoInsumos + custoFixoProcedimento;
  const divisor = 1 - (e.margemSeguranca + e.lucroDesejado) / 100;
  if (divisor <= 0) return null;
  const precoSugerido = custoProcedimento / divisor;
  return {
    custoFixoProcedimento,
    custoProcedimento,
    precoSugerido,
    valorMargem: (precoSugerido * e.margemSeguranca) / 100,
    valorLucro: (precoSugerido * e.lucroDesejado) / 100,
  };
}

export function calcularCustoUnitarioInsumo(
  quantidadePorEmbalagem: number,
  compra: { quantidadeComprada: number; valorTotalCompra: number } | null,
): number | null {
  if (!compra || quantidadePorEmbalagem <= 0 || compra.quantidadeComprada <= 0) return null;
  return compra.valorTotalCompra / (compra.quantidadeComprada * quantidadePorEmbalagem);
}

export function calcularCustoFixoPorMinuto(
  despesasMes: number,
  valorProLabore: number,
  diasTrabalhadosMes: number | null | undefined,
  horasDisponiveisDia: number | null | undefined,
  provisaoFerias: number,
): number | null {
  if (!diasTrabalhadosMes || !horasDisponiveisDia) return null;
  return (
    (despesasMes + valorProLabore * (provisaoFerias / 100)) /
    (diasTrabalhadosMes * horasDisponiveisDia * 60)
  );
}
