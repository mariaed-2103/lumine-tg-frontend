import React from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";

import { ImprevistoBadge } from "./ImprevistoBadge";
import { formatarData, formatarMoeda, temImprevisto, type Atendimento } from "./types";

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
    <div id="atendimentos-cards-container" className="space-y-3 md:hidden">
      {atendimentos.map((atendimento) => (
        <div
          key={atendimento.idAtendimento}
          className="space-y-3 rounded-2xl border border-petal/50 bg-white p-4 shadow-xs"
        >
          {/* Cabeçalho: cliente + ações */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-display text-base font-bold leading-snug text-wine">
                {atendimento.nomeCliente}
              </h4>
              <p className="mt-0.5 text-xs font-medium text-ink/80">
                {atendimento.nomeProcedimento}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                id={`btn-mobile-edit-atendimento-${atendimento.idAtendimento}`}
                onClick={() => onEdit(atendimento)}
                className="cursor-pointer rounded-full p-1.5 text-wine/70 transition-colors hover:bg-pale hover:text-wine"
                aria-label={`Editar atendimento de ${atendimento.nomeCliente}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                id={`btn-mobile-delete-atendimento-${atendimento.idAtendimento}`}
                onClick={() => onDelete(atendimento)}
                className="cursor-pointer rounded-full p-1.5 text-berry/70 transition-colors hover:bg-pale hover:text-berry"
                aria-label={`Excluir atendimento de ${atendimento.nomeCliente}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Data, valor e pagamento */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-petal/50 bg-cream px-2.5 py-1 font-semibold text-wine">
              <CalendarDays className="h-3.5 w-3.5 text-rose" />
              {formatarData(atendimento.dataAtendimento)}
            </span>
            <span className="rounded-full border border-petal/40 bg-pale/70 px-2.5 py-1 font-bold text-wine">
              {formatarMoeda(atendimento.valorCobrado)}
            </span>
            <span className="rounded-full border border-petal/50 bg-pale px-2.5 py-1 font-semibold text-wine">
              {atendimento.nomeFormaPagamento}
            </span>
          </div>

          {/* Imprevistos */}
          <div className="flex items-center gap-2 border-t border-petal/20 pt-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-wine/60">Imprevistos</span>
            <ImprevistoBadge atendimento={atendimento} />
            {temImprevisto(atendimento) && (
              <span className="text-[11px] text-wine/70">
                {[
                  atendimento.tempoAdicional > 0 ? `+${atendimento.tempoAdicional} min` : null,
                  atendimento.desperdicioMateriais > 0
                    ? formatarMoeda(atendimento.desperdicioMateriais)
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
