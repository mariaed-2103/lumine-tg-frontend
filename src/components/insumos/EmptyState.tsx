import React from 'react';
import { Plus, FlaskConical } from 'lucide-react';

interface EmptyStateProps {
  onNewInsumo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewInsumo }) => {
  return (
    <div
      id="empty-state-container"
      className="py-12 sm:py-16 px-4 text-center max-w-lg mx-auto transition-all"
    >
      {/* Centered Flask / Beaker Icon in Soft Pink Circle */}
      <div className="mx-auto w-20 h-20 rounded-full bg-pale flex items-center justify-center mb-6 shadow-xs border border-petal/40">
        <FlaskConical className="w-10 h-10 text-rose" strokeWidth={1.75} />
      </div>

      {/* Main Heading */}
      <h3 className="font-display font-bold text-xl sm:text-2xl text-wine mb-2 tracking-tight">
        Você ainda não cadastrou nenhum insumo
      </h3>
      
      {/* Description */}
      <p className="text-xs sm:text-sm text-wine/80 max-w-md mx-auto mb-7 leading-relaxed font-sans">
        Cadastre esmaltes, cremes, algodão e tudo o que você usa nos procedimentos para acompanhar custos e estoque.
      </p>

      {/* Primary Action Button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          id="btn-empty-novo-insumo"
          onClick={onNewInsumo}
          className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-wine text-white font-bold px-7 py-3 rounded-full text-sm transition-all duration-200 shadow-md shadow-berry/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Insumo</span>
        </button>
      </div>
    </div>
  );
};

