import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
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
    <div className="hidden w-full bg-transparent xl:block">
      <div className="w-full overflow-visible px-1 py-3">
        <table className="w-full table-fixed border-separate border-spacing-y-2.5 text-left">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
          </colgroup>
          {/* Table Header */}
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.12em] text-wine/65 font-bold">
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
          <tbody className="text-sm">
            {insumos.map((item) => {
              const isLowStock = item.estoqueAtual <= item.estoqueMinimo;

              return (
                <tr
                  key={item.idInsumo}
                  id={`row-insumo-${item.idInsumo}`}
                  className={`insumo-row group ${
                    isLowStock
                      ? 'bg-gradient-to-r from-pale/80 via-white/65 to-white/60'
                      : 'bg-white/65 hover:bg-white/90'
                  }`}
                >
                  {/* Nome & Unidade */}
                  <td className="rounded-l-2xl border-y border-l border-petal/55 px-3 py-3.5">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="min-w-0 break-words font-bold leading-snug text-ink transition-colors group-hover:text-wine">
                        {item.nome}
                      </span>
                      <span className="inline-flex shrink-0 items-center rounded-full border border-petal/60 bg-pale px-2 py-0.5 text-xs font-semibold text-wine">
                        {item.unidadeMedida}
                      </span>
                    </div>
                  </td>

                  {/* Quantidade por Embalagem */}
                  <td className="whitespace-nowrap border-y border-petal/55 px-2 py-3.5 text-center font-medium text-ink">
                    <span className="rounded-full border border-petal/40 bg-white/75 px-2 py-1.5 text-xs font-semibold text-wine tabular-nums">
                      {formatNumber(item.quantidadePorEmbalagem)} {item.unidadeMedida}
                    </span>
                  </td>

                  {/* Estoque Atual */}
                  <td className="whitespace-nowrap border-y border-petal/55 px-2 py-3.5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`text-[15px] font-extrabold tabular-nums ${
                          isLowStock ? 'text-berry' : 'text-ink'
                        }`}
                      >
                        {formatNumber(item.estoqueAtual)} {item.unidadeMedida}
                      </span>
                      {/* Sub-bar indicator */}
                      <div className="mt-1.5 h-2 w-20 overflow-hidden rounded-full bg-petal/25 shadow-inner shadow-wine/10">
                        <div
                          className={`h-full rounded-full shadow-[inset_0_1px_rgba(255,255,255,.75)] ${
                            isLowStock ? 'bg-gradient-to-r from-rose to-berry' : 'bg-gradient-to-r from-petal to-rose'
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
                  <td className="whitespace-nowrap border-y border-petal/55 px-2 py-3.5 text-center">
                    <span className="text-[13px] font-medium text-ink/60 tabular-nums">
                      {formatNumber(item.estoqueMinimo)} {item.unidadeMedida}
                    </span>
                  </td>

                  {/* Status / Alerta de Estoque Baixo */}
                  <td className="whitespace-nowrap border-y border-petal/55 px-2 py-3.5 text-center">
                    {isLowStock ? (
                      <span
                        id={`badge-low-stock-${item.idInsumo}`}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-rose to-berry px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-berry/20"
                      >
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        <span>Estoque baixo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-petal/50 bg-pale/60 px-2.5 py-1 text-xs font-semibold text-wine">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rose" />
                        <span>Normal</span>
                      </span>
                    )}
                  </td>

                  {/* Ações: Editar e Excluir */}
                  <td className="rounded-r-2xl border-y border-r border-petal/55 px-2 py-3.5 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        id={`btn-edit-insumo-${item.idInsumo}`}
                        onClick={() => onEdit(item)}
                        title="Editar insumo"
                        aria-label={`Editar ${item.nome}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/55 text-wine/70 transition-all hover:bg-pale hover:text-berry active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/40"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        id={`btn-delete-insumo-${item.idInsumo}`}
                        onClick={() => onDelete(item)}
                        title="Excluir insumo"
                        aria-label={`Excluir ${item.nome}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/55 text-berry/70 transition-all hover:bg-berry/10 hover:text-berry active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/40"
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
