import React from "react";
import { Edit2, Trash2 } from "lucide-react";

import { ImprevistoBadge } from "./ImprevistoBadge";
import { formatarData, formatarMoeda, type Atendimento } from "./types";
import { PaymentMiniIcon } from "@/components/icons/lumine";

interface AtendimentoTableProps {
  atendimentos: Atendimento[];
  onEdit: (atendimento: Atendimento) => void;
  onDelete: (atendimento: Atendimento) => void;
}

export const AtendimentoTable: React.FC<AtendimentoTableProps> = ({
  atendimentos,
  onEdit,
  onDelete,
}) => {
  return (
    <div id="atendimentos-table-container" className="at-scroll">
      <div className="at-list" role="table" aria-label="Atendimentos">
        <div className="at-grid at-column-heading mb-2 px-[calc(var(--at-pad)+1px)]" role="row">
          <div role="columnheader">Data</div>
          <div role="columnheader">Cliente</div>
          <div role="columnheader">Procedimento</div>
          <div className="text-right" role="columnheader">
            Valor cobrado
          </div>
          <div role="columnheader">Pagamento</div>
          <div role="columnheader">Imprevistos</div>
          <div className="text-right" role="columnheader">
            Ações
          </div>
        </div>

        <div className="flex flex-col gap-3" role="rowgroup">
          {atendimentos.map((atendimento) => (
            <div
              key={atendimento.idAtendimento}
              className="lumine-row"
              role="row"
            >
              <div className="at-grid min-h-[68px] px-[var(--at-pad)] py-3.5">
                <div
                  className="min-w-0 whitespace-nowrap text-[13px] font-semibold tabular-nums text-ink/60"
                  role="cell"
                >
                  {formatarData(atendimento.dataAtendimento)}
                </div>

                <div className="flex min-w-0 items-center" role="cell">
                  <span className="line-clamp-2 min-w-0 text-[15px] font-bold leading-tight text-ink">
                    {atendimento.nomeCliente}
                  </span>
                </div>

                <div
                  className="line-clamp-2 min-w-0 text-sm font-medium leading-snug text-ink/75"
                  role="cell"
                >
                  {atendimento.nomeProcedimento}
                </div>

                <div
                  className="whitespace-nowrap pr-2 text-right text-[15px] font-extrabold tabular-nums text-wine"
                  role="cell"
                >
                  {formatarMoeda(atendimento.valorCobrado)}
                </div>

                <div role="cell">
                  <span className="inline-flex h-7 w-fit items-center gap-1.5 whitespace-nowrap rounded-full border border-petal/50 bg-pale px-2.5 text-xs font-bold text-wine">
                    <PaymentMiniIcon label={atendimento.nomeFormaPagamento} />
                    {atendimento.nomeFormaPagamento}
                  </span>
                </div>

                <div role="cell">
                  <ImprevistoBadge atendimento={atendimento} />
                </div>

                <div role="cell">
                  <div className="row-actions flex items-center justify-end gap-2">
                    <button
                      type="button"
                      id={`btn-edit-atendimento-${atendimento.idAtendimento}`}
                      onClick={() => onEdit(atendimento)}
                      className="at-action-edit inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/50 text-[#6B1530]/75 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#F5A8BC]/35 transition-all hover:bg-[#FCE1E8] hover:text-[#C5325A] hover:ring-[#F5A8BC]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                      title="Editar atendimento"
                      aria-label={`Editar atendimento de ${atendimento.nomeCliente}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      id={`btn-delete-atendimento-${atendimento.idAtendimento}`}
                      onClick={() => onDelete(atendimento)}
                      className="at-action-delete inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/50 text-[#C5325A]/75 shadow-[0_2px_6px_rgba(107,21,48,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#F5A8BC]/35 transition-all hover:bg-[rgba(197,50,90,0.12)] hover:text-[#C5325A] hover:ring-[#C5325A]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
                      title="Excluir atendimento"
                      aria-label={`Excluir atendimento de ${atendimento.nomeCliente}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
