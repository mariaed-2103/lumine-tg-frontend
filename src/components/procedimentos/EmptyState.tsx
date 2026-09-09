import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onNewProcedimento: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewProcedimento }) => {
  return (
    <div
      id="empty-state-procedimentos"
      className="py-12 sm:py-16 px-4 text-center max-w-lg mx-auto transition-all"
    >
      {/* Centered Sparkles / Aesthetic Icon in Soft Pink Circle */}
      <div className="mx-auto w-20 h-20 rounded-full bg-pale flex items-center justify-center mb-6 shadow-xs border border-petal/40">
        <Sparkles className="w-10 h-10 text-rose" strokeWidth={1.75} />
      </div>

      {/* Main Heading */}
      <h3 className="font-display font-bold text-xl sm:text-2xl text-wine mb-2 tracking-tight">
        Você ainda não cadastrou nenhum procedimento
      </h3>
      
      {/* Description */}
      <p className="text-xs sm:text-sm text-wine/80 max-w-md mx-auto mb-7 leading-relaxed font-sans">
        Cadastre os procedimentos que você realiza e monte a ficha técnica vinculando os insumos consumidos para automatizar sua precificação.
      </p>

      {/* Primary Action Button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          id="btn-empty-novo-procedimento"
          onClick={onNewProcedimento}
          className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white font-bold px-7 py-3 rounded-full text-sm transition-all duration-200 shadow-md shadow-berry/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Procedimento</span>
        </button>
      </div>
    </div>
  );
};
