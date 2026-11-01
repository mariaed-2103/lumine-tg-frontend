import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Insumo } from "./types";

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
    return Number(val).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div
      id="insumos-table-container"
      className="hidden xl:block w-full bg-transparent"
    >
      <div className="w-full">
        {/* Cabeçalho das colunas */}
        <div
          role="row"
          className="insumo-grid px-[calc(var(--insumo-pad-x)+1px)] text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B1530]/55"
        >
          <div className="min-w-0 whitespace-nowrap">Insumo / Unidade</div>
          <div className="min-w-0 text-center whitespace-nowrap">
            Qtd. por Embalagem
          </div>
          <div className="min-w-0 text-center whitespace-nowrap">
            Estoque Atual
          </div>
          <div className="min-w-0 text-center whitespace-nowrap">
            Estoque Mínimo
          </div>
          <div className="min-w-0 text-center whitespace-nowrap">Status</div>
          <div className="min-w-0 text-right whitespace-nowrap">Ações</div>
        </div>

        {/* Lista de linhas no padrão de Procedimentos */}
        <div className="mt-2 flex flex-col gap-3 text-sm text-ink">
          {insumos.map((item) => {
            const isLowStock = item.estoqueAtual <= item.estoqueMinimo;

            return (
              <div
                key={item.idInsumo}
                id={`row-insumo-${item.idInsumo}`}
                className="proc-row-card group relative rounded-[20px] border border-white/80 bg-white/60 transition-all duration-200 hover:border-[#F5A8BC]/55 hover:bg-white/85"
              >
                <div className="insumo-grid min-h-[72px] px-[var(--insumo-pad-x)] py-4">
                  {/* 1. Nome & Unidade */}
                  <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                    <span className="min-w-0 text-[15px] font-bold leading-tight text-[#2E0F18] line-clamp-2">
                      {item.nome}
                    </span>
                    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#FCE1E8] border border-[rgba(245,168,188,0.5)] px-2.5 text-[11px] font-bold text-[#6B1530]">
                      {item.unidadeMedida}
                    </span>
                  </div>

                  {/* 2. Quantidade por Embalagem */}
                  <div className="min-w-0 flex justify-center">
                    <div className="w-fit h-7 inline-flex items-center px-3 rounded-full bg-white/60 border border-[rgba(245,168,188,0.45)] text-[12px] font-semibold tabular-nums text-[#6B1530] whitespace-nowrap">
                      {formatNumber(item.quantidadePorEmbalagem)}{" "}
                      {item.unidadeMedida}
                    </div>
                  </div>

                  {/* 3. Estoque Atual */}
                  <div className="min-w-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-[15px] font-extrabold tabular-nums whitespace-nowrap ${
                        isLowStock ? "text-[#C5325A]" : "text-[#6B1530]"
                      }`}
                    >
                      {formatNumber(item.estoqueAtual)} {item.unidadeMedida}
                    </span>
                    <div className="mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-[#F5A8BC]/25">
                      <div
                        className={`h-full rounded-full ${
                          isLowStock
                            ? "bg-gradient-to-r from-[#E8698A] to-[#C5325A]"
                            : "bg-gradient-to-r from-[#F5A8BC] to-[#E8698A]"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              8,
                              (item.estoqueAtual /
                                (item.quantidadePorEmbalagem || 1)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 4. Estoque Mínimo */}
                  <div className="min-w-0 text-center whitespace-nowrap">
                    <span className="text-[13px] font-semibold text-[#6B1530]/60 tabular-nums">
                      {formatNumber(item.estoqueMinimo)} {item.unidadeMedida}
                    </span>
                  </div>

                  {/* 5. Status */}
                  <div className="min-w-0 flex justify-center">
                    {isLowStock ? (
                      <span
                        id={`badge-low-stock-${item.idInsumo}`}
                        className="w-fit h-7 inline-flex items-center gap-1.5 px-3 rounded-full text-[12px] font-semibold bg-berry/10 text-berry border border-berry/30 whitespace-nowrap"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-berry animate-pulse"
                        />
                        <span>Estoque baixo</span>
                      </span>
                    ) : (
                      <span className="w-fit h-7 inline-flex items-center gap-1.5 px-3 rounded-full bg-[#FCE1E8] border border-[rgba(245,168,188,0.5)] text-[12px] font-bold text-[#6B1530] whitespace-nowrap relative overflow-hidden after:pointer-events-none after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:bg-gradient-to-r after:from-[#F5A8BC]/20 after:via-[#FFD9C7]/20 after:to-[#E8698A]/15">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8698A] relative z-10"
                        />
                        <span className="relative z-10">Normal</span>
                      </span>
                    )}
                  </div>

                  {/* 6. Ações */}
                  <div className="min-w-0 flex items-center justify-end gap-2 opacity-100 lg:opacity-70 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      id={`btn-edit-insumo-${item.idInsumo}`}
                      onClick={() => onEdit(item)}
                      title="Editar insumo"
                      aria-label={`Editar ${item.nome}`}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#6B1530]/75 transition-all hover:bg-[#FCE1E8] hover:text-[#C5325A] hover:ring-[#F5A8BC]/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      id={`btn-delete-insumo-${item.idInsumo}`}
                      onClick={() => onDelete(item)}
                      title="Excluir insumo"
                      aria-label={`Excluir ${item.nome}`}
                      className="proc-delete-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#C5325A]/75 transition-all hover:bg-[rgba(197,50,90,0.12)] hover:text-[#C5325A] hover:ring-[#C5325A]/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
