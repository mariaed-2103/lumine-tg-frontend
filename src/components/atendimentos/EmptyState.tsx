import React from "react";
import { CalendarDays, Plus } from "lucide-react";

interface EmptyStateProps {
  onNewAtendimento: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewAtendimento }) => {
  return (
    <div
      id="empty-state-atendimentos"
      className="mx-auto max-w-lg px-4 py-12 text-center transition-all sm:py-16"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-petal/40 bg-pale shadow-xs">
        <CalendarDays className="h-10 w-10 text-petal" strokeWidth={1.5} />
      </div>

      <h3 className="mb-2 font-display text-xl font-bold tracking-tight text-wine sm:text-2xl">
        Nenhum atendimento registrado
      </h3>

      <p className="mx-auto mb-7 max-w-md font-sans text-xs leading-relaxed text-wine/70 sm:text-sm">
        Registre o primeiro atendimento para começar a acompanhar seus resultados.
      </p>

      <div className="flex items-center justify-center">
        <button
          type="button"
          id="btn-empty-novo-atendimento"
          onClick={onNewAtendimento}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-berry px-7 py-3 text-sm font-bold text-white shadow-md shadow-berry/20 transition-all duration-200 hover:bg-wine active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Atendimento</span>
        </button>
      </div>
    </div>
  );
};
