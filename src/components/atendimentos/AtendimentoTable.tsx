import React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ImprevistoBadge } from "./ImprevistoBadge";
import { formatarData, formatarMoeda, type Atendimento } from "./types";

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
    <div
      id="atendimentos-table-container"
      className="hidden overflow-hidden rounded-2xl border border-petal/40 bg-white md:block"
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-petal/40 bg-cream text-xs font-bold uppercase tracking-wider text-wine">
            <th className="px-4 py-3.5 font-display">Data</th>
            <th className="px-4 py-3.5 font-display">Cliente</th>
            <th className="px-4 py-3.5 font-display">Procedimento</th>
            <th className="px-4 py-3.5 font-display">Valor cobrado</th>
            <th className="px-4 py-3.5 font-display">Pagamento</th>
            <th className="px-4 py-3.5 font-display">Imprevistos</th>
            <th className="px-4 py-3.5 text-right font-display">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-petal/20 text-sm text-ink">
          {atendimentos.map((atendimento) => (
            <tr key={atendimento.idAtendimento} className="transition-colors hover:bg-cream/60">
              <td className="whitespace-nowrap px-4 py-3.5 font-medium text-ink">
                {formatarData(atendimento.dataAtendimento)}
              </td>

              <td className="px-4 py-3.5 font-bold text-wine">{atendimento.nomeCliente}</td>

              <td className="px-4 py-3.5 font-medium text-ink">{atendimento.nomeProcedimento}</td>

              <td className="whitespace-nowrap px-4 py-3.5 font-bold text-wine">
                {formatarMoeda(atendimento.valorCobrado)}
              </td>

              <td className="px-4 py-3.5">
                <span className="inline-flex items-center rounded-full border border-petal/50 bg-pale px-2.5 py-1 text-xs font-semibold text-wine">
                  {atendimento.nomeFormaPagamento}
                </span>
              </td>

              <td className="px-4 py-3.5">
                <ImprevistoBadge atendimento={atendimento} />
              </td>

              <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    id={`btn-edit-atendimento-${atendimento.idAtendimento}`}
                    onClick={() => onEdit(atendimento)}
                    className="cursor-pointer rounded-full p-1.5 text-wine/70 transition-colors hover:bg-pale hover:text-wine"
                    title="Editar atendimento"
                    aria-label={`Editar atendimento de ${atendimento.nomeCliente}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    id={`btn-delete-atendimento-${atendimento.idAtendimento}`}
                    onClick={() => onDelete(atendimento)}
                    className="cursor-pointer rounded-full p-1.5 text-berry/70 transition-colors hover:bg-pale hover:text-berry"
                    title="Excluir atendimento"
                    aria-label={`Excluir atendimento de ${atendimento.nomeCliente}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
