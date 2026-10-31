import React from "react";
import { CalendarDays, Plus } from "lucide-react";

interface EmptyStateProps {
  onNewAtendimento: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewAtendimento }) => {
  return (
    <div
      id="empty-state-atendimentos"
      className="mx-auto max-w-lg px-4 py-10 text-center sm:py-12"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pale text-berry">
        <CalendarDays className="h-6 w-6" aria-hidden="true" />
      </div>

      <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-wine sm:text-xl">
        Nenhum atendimento registrado
      </h3>

      <p className="mx-auto mb-6 max-w-md font-sans text-xs leading-relaxed text-wine/70 sm:text-sm">
        Registre o primeiro atendimento para começar a acompanhar seus resultados.
      </p>

      <div className="flex items-center justify-center">
        <button
          type="button"
          id="btn-empty-novo-atendimento"
          onClick={onNewAtendimento}
          className="group shine inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/80 bg-gradient-to-br from-[#D13E66] to-berry px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-berry/30 transition-all duration-200 hover:from-wine hover:to-wine active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5325A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8F5]"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Atendimento</span>
        </button>
      </div>
    </div>
  );
};
