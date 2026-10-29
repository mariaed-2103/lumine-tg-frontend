import React, { useState } from 'react';
import { Pencil, Trash2, Clock, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Procedimento, InsumoDisponivel } from './types';

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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div id="procedimentos-cards-container" className="md:hidden space-y-3">
      {procedimentos.map((proc) => {
        const numInsumos = proc.itensFichaTecnica.length;
        const hasNoInsumos = numInsumos === 0;
        const isExpanded = expandedId === proc.idProcedimento;
        const formattedPrice = formatCurrency(proc.precoPadrao);

        return (
          <div
            key={proc.idProcedimento}
            className="bg-white rounded-2xl border border-petal/50 p-4 shadow-xs space-y-3"
          >
            {/* Header: Title and Actions */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display font-bold text-base text-wine leading-snug">
                {proc.nome}
              </h4>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  id={`btn-mobile-edit-${proc.idProcedimento}`}
                  onClick={() => onEdit(proc)}
                  className="p-1.5 text-wine/70 hover:text-wine hover:bg-pale rounded-full transition-colors cursor-pointer"
                  aria-label={`Editar ${proc.nome}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id={`btn-mobile-delete-${proc.idProcedimento}`}
                  onClick={() => onDelete(proc)}
                  className="p-1.5 text-berry/70 hover:text-berry hover:bg-pale rounded-full transition-colors cursor-pointer"
                  aria-label={`Excluir ${proc.nome}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Badges: Duração e Preço */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="inline-flex items-center gap-1 bg-cream px-2.5 py-1 rounded-full border border-petal/50 text-wine font-semibold">
                <Clock className="w-3.5 h-3.5 text-rose" />
                <span>{proc.duracaoMinutos} min</span>
              </div>

              {formattedPrice ? (
                <div className="font-bold text-wine bg-pale/70 px-2.5 py-1 rounded-full border border-petal/40">
                  {formattedPrice}
                </div>
              ) : (
                <div className="text-wine/70 bg-cream px-2.5 py-1 rounded-full border border-petal/40 font-medium">
                  Preço não definido
                </div>
              )}
            </div>

            {/* Ficha Técnica Badge / Status */}
            <div className="pt-2 border-t border-petal/20 flex items-center justify-between">
              {hasNoInsumos ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-berry font-semibold bg-berry/10 px-2.5 py-1 rounded-full border border-berry/30">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>0 insumos</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : proc.idProcedimento)}
                  className="inline-flex items-center gap-1.5 text-xs text-wine font-bold bg-pale px-2.5 py-1 rounded-full border border-petal cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-berry" />
                  <span>{numInsumos} {numInsumos === 1 ? 'insumo' : 'insumos'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-wine/60" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-wine/60" />
                  )}
                </button>
              )}
            </div>

            {/* Expanded items on mobile */}
            {isExpanded && numInsumos > 0 && (
              <div className="bg-cream p-3 rounded-xl border border-petal/30 space-y-1.5 text-xs animate-in fade-in">
                <span className="font-bold text-wine uppercase text-[10px] block">
                  Insumos da Ficha Técnica:
                </span>
                {proc.itensFichaTecnica.map((item, idx) => {
                  const insInfo = getInsumoInfo(item.idInsumo);
                  return (
                    <div
                      key={item.idFichaTecnica || `${item.idInsumo}-${idx}`}
                      className="flex items-center justify-between py-1 border-b border-petal/20 last:border-none"
                    >
                      <span className="font-medium text-ink truncate pr-2">
                        {insInfo ? insInfo.nome : `Insumo #${item.idInsumo}`}
                      </span>
                      <span className="font-bold text-wine shrink-0 bg-white px-2 py-0.5 rounded-md border border-petal/40 text-[11px]">
                        {item.quantidadeUtilizada} {insInfo ? insInfo.unidadeMedida : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
