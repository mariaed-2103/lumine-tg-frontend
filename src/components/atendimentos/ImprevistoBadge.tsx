import React from "react";

import { descreverImprevisto, temImprevisto, type Atendimento } from "./types";
import { UnexpectedIcon } from "@/components/icons/lumine";

interface ImprevistoBadgeProps {
  atendimento: Pick<Atendimento, "tempoAdicional" | "desperdicioMateriais">;
}

/** Badge âmbar "Imprevisto" ou "—" discreto quando não há imprevisto. */
export const ImprevistoBadge: React.FC<ImprevistoBadgeProps> = ({ atendimento }) => {
  if (!temImprevisto(atendimento)) {
    return (
      <span className="whitespace-nowrap text-sm text-petal/70" aria-label="Sem imprevistos">
        —
      </span>
    );
  }

  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#D97706]/25 bg-[#FEF3C7] px-2.5 text-xs font-bold text-[#D97706]"
      title={descreverImprevisto(atendimento)}
    >
      <UnexpectedIcon className="h-3.5 w-3.5 shrink-0" size={14} />
      Imprevisto
    </span>
  );
};
