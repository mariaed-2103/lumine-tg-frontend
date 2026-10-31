import React from "react";
import { CalendarDays, Edit2, Trash2 } from "lucide-react";

import { ImprevistoBadge } from "./ImprevistoBadge";
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center">
              <h4 className="line-clamp-2 min-w-0 font-display text-base font-bold leading-snug text-wine">
                {atendimento.nomeCliente}
              </h4>
            </div>
            <span className="shrink-0 whitespace-nowrap pt-1 text-right text-sm font-extrabold tabular-nums text-wine">
              {formatarMoeda(atendimento.valorCobrado)}
            </span>
          </div>

          <p className="line-clamp-2 text-sm font-medium leading-snug text-ink/75">
            {atendimento.nomeProcedimento}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full border border-petal/50 bg-white/60 px-2.5 text-xs font-semibold text-ink/70">
              <CalendarDays className="h-3.5 w-3.5 text-rose" />
              {formatarData(atendimento.dataAtendimento)}
            </span>
            <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full border border-petal/50 bg-pale px-2.5 text-xs font-bold text-wine">
              <PaymentMiniIcon label={atendimento.nomeFormaPagamento} />
              {atendimento.nomeFormaPagamento}
            </span>
            <ImprevistoBadge atendimento={atendimento} />
          </div>

          {temImprevisto(atendimento) && (
            <div className="ml-1 text-[11px] text-wine/70">
              {[
                atendimento.tempoAdicional > 0 ? `+${atendimento.tempoAdicional} min` : null,
                atendimento.desperdicioMateriais > 0
                  ? formatarMoeda(atendimento.desperdicioMateriais)
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}

          <div className="row-actions flex items-center justify-end gap-2 border-t border-petal/20 pt-3">
            <button
              type="button"
              id={`btn-mobile-edit-atendimento-${atendimento.idAtendimento}`}
              onClick={() => onEdit(atendimento)}
              className="at-action-edit inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/50 text-[#6B1530]/75 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#F5A8BC]/35 transition-all hover:bg-[#FCE1E8] hover:text-[#C5325A] hover:ring-[#F5A8BC]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
              title="Editar atendimento"
              aria-label={`Editar atendimento de ${atendimento.nomeCliente}`}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              id={`btn-mobile-delete-atendimento-${atendimento.idAtendimento}`}
              onClick={() => onDelete(atendimento)}
              className="at-action-delete inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/50 text-[#C5325A]/75 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#F5A8BC]/35 transition-all hover:bg-[rgba(197,50,90,0.12)] hover:text-[#C5325A] hover:ring-[#C5325A]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
              title="Excluir atendimento"
              aria-label={`Excluir atendimento de ${atendimento.nomeCliente}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
