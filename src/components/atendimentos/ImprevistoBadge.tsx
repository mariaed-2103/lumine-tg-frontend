import React from "react";

import { descreverImprevisto, temImprevisto, type Atendimento } from "./types";
import { UnexpectedIcon } from "@/components/icons/lumine";

interface ImprevistoBadgeProps {
  atendimento: Pick<Atendimento, "tempoAdicional" | "desperdicioMateriais">;
}

/** Indicador discreto de imprevisto, ou "—" quando não há ocorrência. */
export const ImprevistoBadge: React.FC<ImprevistoBadgeProps> = ({ atendimento }) => {
  if (!temImprevisto(atendimento)) {
    return (
      <span className="whitespace-nowrap text-xs text-ink/35" aria-label="Sem imprevistos">
        —
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#B45309]"
      title={descreverImprevisto(atendimento)}
    >
      <UnexpectedIcon className="h-3.5 w-3.5 shrink-0" size={14} />
      Imprevisto
    </span>
  );
};
