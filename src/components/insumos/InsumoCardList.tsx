import React from 'react';
import { Edit2, Trash2, AlertTriangle, CheckCircle2, Box } from 'lucide-react';
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
    <div className="md:hidden space-y-3.5">
      {insumos.map((item) => {
        const isLowStock = item.estoqueAtual <= item.estoqueMinimo;

        return (
          <div
            key={item.idInsumo}
            id={`card-insumo-${item.idInsumo}`}
            className={`rounded-3xl p-5 transition-all shadow-sm ${
              isLowStock
                ? 'bg-cream border-l-4 border-l-berry border-y border-r border-petal'
                : 'bg-white border border-petal'
            }`}
          >
            {/* Header: Title, Unit Badge & Low Stock Warning */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-display font-bold text-base text-wine leading-tight">
                    {item.nome}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-pale text-wine">
                    {item.unidadeMedida}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isLowStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-berry text-white uppercase tracking-tight">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Estoque baixo</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pale text-wine">
                    <CheckCircle2 className="w-3 h-3 text-rose" />
                    <span>Normal</span>
                  </span>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-cream rounded-2xl border border-petal/40 text-center mb-3.5">
              <div>
                <span className="block text-[10px] font-bold text-wine/70 uppercase tracking-wider">
                  Embalagem
                </span>
                <span className="text-xs font-bold text-ink mt-0.5 block">
                  {formatNumber(item.quantidadePorEmbalagem)} {item.unidadeMedida}
                </span>
              </div>

              <div className="border-x border-petal/40">
                <span className="block text-[10px] font-bold text-wine/70 uppercase tracking-wider">
                  Estoque Atual
                </span>
                <span
                  className={`text-xs font-bold mt-0.5 block ${
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
                <span className="text-xs font-medium text-petal mt-0.5 block">
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
              <div className="w-full h-2 bg-pale rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isLowStock ? 'bg-berry' : 'bg-rose'
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
