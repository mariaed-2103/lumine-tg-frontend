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
            <div key={atendimento.idAtendimento} className="lumine-row" role="row">
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
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink/70">
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
                      className="at-action-edit inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-petal/30 bg-white/55 text-wine/65 transition-colors hover:bg-pale hover:text-berry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/40"
                      title="Editar atendimento"
                      aria-label={`Editar atendimento de ${atendimento.nomeCliente}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      id={`btn-delete-atendimento-${atendimento.idAtendimento}`}
                      onClick={() => onDelete(atendimento)}
                      className="at-action-delete inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-petal/30 bg-white/55 text-wine/55 transition-colors hover:bg-rose/15 hover:text-berry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/40"
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
