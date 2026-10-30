import React from "react";
import { AlertTriangle } from "lucide-react";

import { descreverImprevisto, temImprevisto, type Atendimento } from "./types";

interface ImprevistoBadgeProps {
  atendimento: Pick<Atendimento, "tempoAdicional" | "desperdicioMateriais">;
}

/** Badge âmbar "Imprevisto" ou "—" discreto quando não há imprevisto. */
export const ImprevistoBadge: React.FC<ImprevistoBadgeProps> = ({ atendimento }) => {
  if (!temImprevisto(atendimento)) {
    return (
      <span className="text-sm text-wine/40" aria-label="Sem imprevistos">
        —
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-[#D97706]/30 bg-[#FEF3C7] px-2.5 py-1 text-xs font-bold text-[#D97706]"
      title={descreverImprevisto(atendimento)}
    >
      <AlertTriangle className="h-3 w-3 shrink-0" />
      Imprevisto
    </span>
  );
};
