import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Insumo } from './types';

interface InsumoCardListProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (insumo: Insumo) => void;
}

export const InsumoCardList: React.FC<InsumoCardListProps> = ({
  insumos,
  onEdit,
  onDelete,
}) => {
  const formatNumber = (val: number) => {
    return Number(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div className="xl:hidden space-y-3.5 px-1 py-2">
      {insumos.map((item) => {
        const isLowStock = item.estoqueAtual <= item.estoqueMinimo;

        return (
          <div
            key={item.idInsumo}
            id={`card-insumo-${item.idInsumo}`}
            className={`glass glass-border-iridescent rounded-[22px] border border-petal/45 p-5 shadow-sm transition-all ${
              isLowStock
                ? 'bg-gradient-to-r from-pale/80 to-white/65'
                : 'bg-white/65'
            }`}
          >
            {/* Header: Title, Unit Badge & Low Stock Warning */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-sans font-bold text-[15px] text-ink leading-tight">
                    {item.nome}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pale text-wine border border-petal/50">
                    {item.unidadeMedida}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isLowStock ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-rose to-berry px-2.5 py-1 text-[10px] font-bold tracking-tight text-white">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    <span>Estoque baixo</span>
                  </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pale/60 text-wine border border-petal/50">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rose" />
                    <span>Normal</span>
                  </span>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-white/45 rounded-2xl border border-white/80 text-center mb-3.5">
              <div>
                <span className="block text-[10px] font-bold text-wine/70 uppercase tracking-wider">
                  Embalagem
                </span>
                <span className="text-xs font-bold text-ink mt-0.5 block tabular-nums">
                  {formatNumber(item.quantidadePorEmbalagem)} {item.unidadeMedida}
                </span>
              </div>

              <div className="border-x border-petal/40">
                <span className="block text-[10px] font-bold text-wine/70 uppercase tracking-wider">
                  Estoque Atual
                </span>
                <span
                  className={`text-xs font-bold mt-0.5 block tabular-nums ${
                    isLowStock ? 'text-berry' : 'text-ink'
                  }`}
                >
                  {formatNumber(item.estoqueAtual)} {item.unidadeMedida}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-wine/70 uppercase tracking-wider">
                  Estoque Mín.
                </span>
                <span className="text-xs font-medium text-ink/60 mt-0.5 block tabular-nums">
                  {formatNumber(item.estoqueMinimo)} {item.unidadeMedida}
                </span>
              </div>
            </div>

            {/* Stock Level Bar */}
            <div className="mb-3.5 px-1">
              <div className="flex justify-between text-[11px] text-wine mb-1 font-medium">
                <span>Nível disponível</span>
                <span>
                  {formatNumber(item.estoqueAtual)} / {formatNumber(item.quantidadePorEmbalagem)} {item.unidadeMedida}
                </span>
              </div>
              <div className="w-full h-2 bg-petal/25 rounded-full overflow-hidden shadow-inner shadow-wine/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    isLowStock ? 'bg-gradient-to-r from-rose to-berry' : 'bg-gradient-to-r from-petal to-rose'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        6,
                        (item.estoqueAtual / (item.quantidadePorEmbalagem || 1)) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Card Footer: Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-petal/30">
              <button
                type="button"
                id={`btn-mobile-edit-${item.idInsumo}`}
                onClick={() => onEdit(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose hover:bg-pale transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                id={`btn-mobile-delete-${item.idInsumo}`}
                onClick={() => onDelete(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-berry hover:bg-pale transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
