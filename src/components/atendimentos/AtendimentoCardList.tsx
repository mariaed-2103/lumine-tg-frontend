import React from "react";
import { CalendarDays, Edit2, Trash2 } from "lucide-react";

import { formatarData, formatarMoeda, temImprevisto, type Atendimento } from "./types";
import { PaymentMiniIcon } from "@/components/icons/lumine";

interface AtendimentoCardListProps {
  atendimentos: Atendimento[];
  onEdit: (atendimento: Atendimento) => void;
  onDelete: (atendimento: Atendimento) => void;
}

export const AtendimentoCardList: React.FC<AtendimentoCardListProps> = ({
  atendimentos,
  onEdit,
  onDelete,
}) => {
  return (
    <div id="atendimentos-cards-container" className="at-mobile-list space-y-3">
      {atendimentos.map((atendimento) => (
        <div key={atendimento.idAtendimento} className="lumine-row at-mobile-card p-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h4 className="line-clamp-1 min-w-0 font-display text-sm font-bold leading-snug text-wine sm:text-base">
              {atendimento.nomeCliente}
            </h4>
            <span className="shrink-0 whitespace-nowrap text-sm font-bold tabular-nums text-wine">
              {formatarMoeda(atendimento.valorCobrado)}
            </span>
          </div>

          <p className="line-clamp-1 text-[13px] font-medium leading-snug text-ink/70">
            {atendimento.nomeProcedimento}
          </p>

          <div className="flex min-w-0 items-center justify-between gap-3 border-t border-petal/20 pt-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-ink/60">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <CalendarDays className="h-3.5 w-3.5 text-rose" />
                {formatarData(atendimento.dataAtendimento)}
              </span>
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <PaymentMiniIcon label={atendimento.nomeFormaPagamento} />
                <span className="truncate">{atendimento.nomeFormaPagamento}</span>
              </span>
              {temImprevisto(atendimento) && (
                <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-[#B45309]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                  Imprevisto
                </span>
              )}
            </div>

            <div className="row-actions flex shrink-0 items-center gap-1">
              <button
                type="button"
                id={`btn-mobile-edit-atendimento-${atendimento.idAtendimento}`}
                onClick={() => onEdit(atendimento)}
                className="at-action-edit inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-petal/30 bg-white/55 text-wine/65 transition-colors hover:bg-pale hover:text-berry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/40"
                title="Editar atendimento"
                aria-label={`Editar atendimento de ${atendimento.nomeCliente}`}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                id={`btn-mobile-delete-atendimento-${atendimento.idAtendimento}`}
                onClick={() => onDelete(atendimento)}
                className="at-action-delete inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-petal/30 bg-white/55 text-wine/55 transition-colors hover:bg-rose/15 hover:text-berry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/40"
                title="Excluir atendimento"
                aria-label={`Excluir atendimento de ${atendimento.nomeCliente}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
