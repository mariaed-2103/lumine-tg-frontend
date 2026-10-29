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

/**
 * Calcula o custo unitário de um insumo usando a média ponderada
 * de todas as compras registradas, dividida pela quantidade por embalagem.
 *
 * Fórmula:
 *   custo unitário = soma(valorTotalCompra) ÷ (soma(quantidadeComprada) × quantidadePorEmbalagem)
 *
 * Retorna null se não houver compras válidas ou se quantidadePorEmbalagem for zero.
 */
export function calcularCustoUnitarioInsumo(
  quantidadePorEmbalagem: number,
  compras: Array<{ quantidadeComprada: number; valorTotalCompra: number }>,
): number | null {
  if (!compras || compras.length === 0 || quantidadePorEmbalagem <= 0) return null;

  const comprasValidas = compras.filter(
    (c) => c.quantidadeComprada > 0 && c.valorTotalCompra >= 0,
  );
  if (comprasValidas.length === 0) return null;

  const totalValor = comprasValidas.reduce((acc, c) => acc + c.valorTotalCompra, 0);
  const totalQuantidade = comprasValidas.reduce((acc, c) => acc + c.quantidadeComprada, 0);

  if (totalQuantidade <= 0) return null;

  return totalValor / (totalQuantidade * quantidadePorEmbalagem);
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
