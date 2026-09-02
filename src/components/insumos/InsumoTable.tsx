import React from 'react';
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Insumo } from './types';

interface InsumoTableProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (insumo: Insumo) => void;
}

export const InsumoTable: React.FC<InsumoTableProps> = ({
  insumos,
  onEdit,
  onDelete,
}) => {
  // Format decimal number with Portuguese standard
  const formatNumber = (val: number) => {
    return Number(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div className="hidden md:block w-full overflow-hidden rounded-2xl bg-cream border border-petal/50 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-petal/40 bg-pale/60 text-xs uppercase tracking-wider text-wine font-bold">
              <th scope="col" className="py-3.5 px-5 font-bold">
                Insumo / Unidade
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold text-center">
                Qtd. por Embalagem
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold text-center">
                Estoque Atual
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold text-center">
                Estoque Mínimo
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 px-5 font-bold text-right">
                Ações
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-petal/30 text-sm">
            {insumos.map((item) => {
              const isLowStock = item.estoqueAtual <= item.estoqueMinimo;

              return (
                <tr
                  key={item.idInsumo}
                  id={`row-insumo-${item.idInsumo}`}
                  className={`group transition-colors ${
                    isLowStock
                      ? 'bg-pale/30 hover:bg-pale/60 border-l-4 border-l-berry'
                      : 'hover:bg-pale/20 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Nome & Unidade */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-bold text-ink group-hover:text-wine transition-colors leading-snug">
                        {item.nome}
                      </span>
                      <span className="inline-flex items-center self-start px-2 py-0.5 rounded-full text-xs font-semibold bg-pale text-wine border border-petal/60">
                        {item.unidadeMedida}
                      </span>
                    </div>
                  </td>

                  {/* Quantidade por Embalagem */}
                  <td className="py-4 px-4 text-center font-medium text-ink">
                    <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-petal/30 text-xs font-semibold text-wine">
                      {formatNumber(item.quantidadePorEmbalagem)} {item.unidadeMedida}
                    </span>
                  </td>

                  {/* Estoque Atual */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`text-sm font-bold ${
                          isLowStock ? 'text-berry' : 'text-ink'
                        }`}
                      >
                        {formatNumber(item.estoqueAtual)} {item.unidadeMedida}
                      </span>
                      {/* Sub-bar indicator */}
                      <div className="w-20 h-1.5 bg-petal/30 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isLowStock ? 'bg-berry' : 'bg-rose'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                8,
                                (item.estoqueAtual / (item.quantidadePorEmbalagem || 1)) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Estoque Mínimo (referência discreta) */}
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs font-medium text-wine/70">
                      {formatNumber(item.estoqueMinimo)} {item.unidadeMedida}
                    </span>
                  </td>

                  {/* Status / Alerta de Estoque Baixo */}
                  <td className="py-4 px-4 text-center">
                    {isLowStock ? (
                      <span
                        id={`badge-low-stock-${item.idInsumo}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-berry text-white shadow-2xs animate-pulse"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Estoque baixo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pale text-wine border border-petal/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose" />
                        <span>Normal</span>
                      </span>
                    )}
                  </td>

                  {/* Ações: Editar e Excluir */}
                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        id={`btn-edit-insumo-${item.idInsumo}`}
                        onClick={() => onEdit(item)}
                        title="Editar insumo"
                        aria-label={`Editar ${item.nome}`}
                        className="p-2 text-wine/70 hover:text-wine hover:bg-pale rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        id={`btn-delete-insumo-${item.idInsumo}`}
                        onClick={() => onDelete(item)}
                        title="Excluir insumo"
                        aria-label={`Excluir ${item.nome}`}
                        className="p-2 text-berry/70 hover:text-berry hover:bg-pale rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
