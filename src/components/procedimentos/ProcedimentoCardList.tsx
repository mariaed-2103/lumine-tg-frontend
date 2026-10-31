import React, { useState } from "react";
import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import {
  ClockIcon,
  ClipboardIcon,
  ChevronDownIcon,
} from "@/components/icons/lumine";
import { Procedimento, InsumoDisponivel } from "./types";

interface ProcedimentoCardListProps {
  procedimentos: Procedimento[];
  insumosDisponiveis: InsumoDisponivel[];
  onEdit: (procedimento: Procedimento) => void;
  onDelete: (procedimento: Procedimento) => void;
}

export const ProcedimentoCardList: React.FC<ProcedimentoCardListProps> = ({
  procedimentos,
  insumosDisponiveis,
  onEdit,
  onDelete,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getInsumoInfo = (idInsumo: number) => {
    return insumosDisponiveis.find((ins) => ins.idInsumo === idInsumo);
  };

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div id="procedimentos-cards-container" className="xl:hidden flex flex-col gap-3">
      {procedimentos.map((proc) => {
        const numInsumos = proc.itensFichaTecnica.length;
        const hasNoInsumos = numInsumos === 0;
        const isExpanded = expandedId === proc.idProcedimento;
        const formattedPrice = formatCurrency(proc.precoPadrao);

        return (
          <div
            key={proc.idProcedimento}
            className={`proc-row-card relative rounded-[20px] border p-4 transition-all duration-200 space-y-3 ${
              isExpanded
                ? "bg-white/85 border-white/80 glass-border-iridescent shadow-[0_8px_24px_-6px_rgba(107,21,48,0.16)]"
                : "bg-white/60 border-white/80"
            }`}
          >
            {/* Topo: Chevron + Nome */}
            <div className="flex items-center gap-2.5 min-w-0">
              {numInsumos > 0 && (
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/50 border border-[rgba(245,168,188,0.4)] text-[#E8698A]"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-250 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </span>
              )}
              <h4 className="font-sans font-bold text-[15px] text-[#2E0F18] leading-tight line-clamp-2 min-w-0 flex-1">
                {proc.nome}
              </h4>
            </div>

            {/* Meio: Duração e Preço lado a lado */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="w-fit h-7 inline-flex items-center gap-1.5 bg-white/60 px-3 rounded-full border border-[rgba(245,168,188,0.45)] text-[#6B1530] font-semibold tabular-nums whitespace-nowrap">
                <ClockIcon size={14} className="w-3.5 h-3.5 text-[#E8698A]" />
                <span>{proc.duracaoMinutos} min</span>
              </div>

              {formattedPrice ? (
                <div className="text-[15px] font-extrabold text-[#6B1530] tabular-nums whitespace-nowrap">
                  {formattedPrice}
                </div>
              ) : (
                <div className="text-wine/70 bg-cream px-2.5 py-1 rounded-full border border-petal/40 font-medium whitespace-nowrap">
                  Preço não definido
                </div>
              )}
            </div>

            {/* Abaixo / Base: Pílula da Ficha Técnica e Ações à direita (alvos de 40px) */}
            <div className="pt-2.5 border-t border-petal/25 flex items-center justify-between gap-2">
              {hasNoInsumos ? (
                <div className="w-fit h-7 inline-flex items-center gap-1.5 text-xs text-berry font-semibold bg-berry/10 px-3 rounded-full border border-berry/30 whitespace-nowrap">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>0 insumos</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : proc.idProcedimento)}
                  aria-expanded={isExpanded}
                  className="w-fit h-7 inline-flex items-center gap-1.5 text-[12px] text-[#6B1530] font-bold bg-[#FCE1E8] px-3 rounded-full border border-[rgba(245,168,188,0.5)] cursor-pointer relative overflow-hidden whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5] after:pointer-events-none after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:bg-gradient-to-r after:from-[#F5A8BC]/20 after:via-[#FFD9C7]/20 after:to-[#E8698A]/15"
                >
                  <ClipboardIcon size={14} className="w-3.5 h-3.5 text-[#C5325A] relative z-10" />
                  <span className="relative z-10">
                    {numInsumos} {numInsumos === 1 ? "insumo" : "insumos"}
                  </span>
                  {isExpanded ? (
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#6B1530]/60 rotate-180 relative z-10" />
                  ) : (
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#6B1530]/60 relative z-10" />
                  )}
                </button>
              )}

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  id={`btn-mobile-edit-${proc.idProcedimento}`}
                  onClick={() => onEdit(proc)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#6B1530]/75 transition-all hover:bg-[#FCE1E8] hover:text-[#C5325A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                  title="Editar procedimento"
                  aria-label={`Editar ${proc.nome}`}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  id={`btn-mobile-delete-${proc.idProcedimento}`}
                  onClick={() => onDelete(proc)}
                  className="proc-delete-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/50 border border-white/80 ring-1 ring-[#F5A8BC]/35 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#C5325A]/75 transition-all hover:bg-[rgba(197,50,90,0.12)] hover:text-[#C5325A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                  title="Excluir procedimento"
                  aria-label={`Excluir ${proc.nome}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expanded items on mobile */}
            {isExpanded && numInsumos > 0 && (
              <div className="procedure-expand-panel bg-[#FCE1E8]/40 p-4 rounded-2xl border border-white/70 space-y-2.5 text-xs">
                <span className="font-bold text-[#6B1530]/70 uppercase tracking-[0.12em] text-[11px] block">
                  Insumos da Ficha Técnica:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {proc.itensFichaTecnica.map((item, idx) => {
                    const insInfo = getInsumoInfo(item.idInsumo);
                    return (
                      <div
                        key={item.idFichaTecnica || `${item.idInsumo}-${idx}`}
                        className="h-11 flex items-center gap-3 px-4 rounded-full bg-white/70 border border-[rgba(245,168,188,0.35)] min-w-0"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8698A]"
                        />
                        <span className="font-semibold text-[13px] text-[#2E0F18] truncate flex-1">
                          {insInfo ? insInfo.nome : `Insumo #${item.idInsumo}`}
                        </span>
                        <span className="font-bold text-[#6B1530] shrink-0 h-6 inline-flex items-center bg-[#FCE1E8] px-2.5 rounded-full text-[12px] tabular-nums">
                          {item.quantidadeUtilizada} {insInfo ? insInfo.unidadeMedida : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
