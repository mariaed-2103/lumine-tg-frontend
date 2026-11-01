import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Insumo } from "./types";

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
    return Number(val).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div id="insumos-cards-container" className="xl:hidden flex flex-col gap-3">
      {insumos.map((item) => {
        const isLowStock = item.estoqueAtual <= item.estoqueMinimo;

        return (
          <div
            key={item.idInsumo}
            id={`card-insumo-${item.idInsumo}`}
            className="proc-row-card relative rounded-[20px] border border-white/80 bg-white/60 p-4 transition-all duration-200 space-y-3"
          >
            {/* Topo: Nome + Unidade */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h4 className="font-sans font-bold text-[15px] text-[#2E0F18] leading-tight line-clamp-2 min-w-0">
                {item.nome}
              </h4>
              <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#FCE1E8] border border-[rgba(245,168,188,0.5)] px-2.5 text-[11px] font-bold text-[#6B1530]">
                {item.unidadeMedida}
              </span>
            </div>

            {/* Meio: Embalagem e Estoque lado a lado */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="w-fit h-7 inline-flex items-center gap-1.5 bg-white/60 px-3 rounded-full border border-[rgba(245,168,188,0.45)] text-[#6B1530] font-semibold tabular-nums whitespace-nowrap">
                <span>
                  Emb.: {formatNumber(item.quantidadePorEmbalagem)}{" "}
                  {item.unidadeMedida}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className={`text-[15px] font-extrabold tabular-nums whitespace-nowrap ${
                    isLowStock ? "text-[#C5325A]" : "text-[#6B1530]"
                  }`}
                >
                  {formatNumber(item.estoqueAtual)} {item.unidadeMedida}
                </span>
                <span className="text-[11px] font-semibold text-[#6B1530]/60 tabular-nums whitespace-nowrap">
                  (mín. {formatNumber(item.estoqueMinimo)} {item.unidadeMedida})
                </span>
              </div>
            </div>

            {/* Barra de nível de estoque */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F5A8BC]/25">
              <div
                className={`h-full rounded-full transition-all ${
                  isLowStock
                    ? "bg-gradient-to-r from-[#E8698A] to-[#C5325A]"
                    : "bg-gradient-to-r from-[#F5A8BC] to-[#E8698A]"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      6,
                      (item.estoqueAtual /
                        (item.quantidadePorEmbalagem || 1)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>

            {/* Base: Status à esquerda e Ações circulares à direita */}
            <div className="pt-2.5 border-t border-petal/25 flex items-center justify-between gap-2">
              {isLowStock ? (
                <div className="w-fit h-7 inline-flex items-center gap-1.5 text-[12px] text-berry font-semibold bg-berry/10 px-3 rounded-full border border-berry/30 whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-berry animate-pulse"
                  />
                  <span>Estoque baixo</span>
                </div>
              ) : (
                <div className="w-fit h-7 inline-flex items-center gap-1.5 text-[12px] text-[#6B1530] font-bold bg-[#FCE1E8] px-3 rounded-full border border-[rgba(245,168,188,0.5)] relative overflow-hidden whitespace-nowrap after:pointer-events-none after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:bg-gradient-to-r after:from-[#F5A8BC]/20 after:via-[#FFD9C7]/20 after:to-[#E8698A]/15">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8698A] relative z-10"
                  />
                  <span className="relative z-10">Normal</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  id={`btn-mobile-edit-${item.idInsumo}`}
                  onClick={() => onEdit(item)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#6B1530]/75 transition-all hover:bg-[#FCE1E8] hover:text-[#C5325A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                  title="Editar insumo"
                  aria-label={`Editar ${item.nome}`}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  id={`btn-mobile-delete-${item.idInsumo}`}
                  onClick={() => onDelete(item)}
                  className="proc-delete-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#C5325A]/75 transition-all hover:bg-[rgba(197,50,90,0.12)] hover:text-[#C5325A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                  title="Excluir insumo"
                  aria-label={`Excluir ${item.nome}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
