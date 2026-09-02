import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Insumo } from './types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  insumo: Insumo | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  insumo,
  onConfirm,
  onCancel,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !insumo) return null;

  return (
    <div
      id="modal-delete-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        id="modal-delete-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-delete-title"
        className="bg-white w-full max-w-md rounded-[32px] border border-petal/40 shadow-2xl overflow-hidden p-6 sm:p-8 relative transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          type="button"
          id="btn-modal-delete-close"
          onClick={onCancel}
          className="absolute top-5 right-5 p-1 text-wine/60 hover:text-wine hover:bg-pale rounded-full transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Alert Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-pale border border-petal/50 flex items-center justify-center shrink-0 text-berry">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-4">
            <h4
              id="modal-delete-title"
              className="font-display font-bold text-xl text-wine leading-snug"
            >
              Excluir Insumo
            </h4>
            <p className="text-xs sm:text-sm text-ink/80 mt-2 leading-relaxed">
              Deseja excluir <span className="font-bold text-wine">"{insumo.nome}"</span>? Essa ação removerá o produto do seu controle.
            </p>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-center gap-3 mt-7">
          <button
            type="button"
            id="btn-cancel-delete"
            onClick={onCancel}
            className="px-5 py-2.5 border border-petal text-wine hover:bg-pale rounded-full font-bold text-sm transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-berry hover:bg-wine text-white rounded-full font-bold text-sm transition-all shadow-md shadow-berry/20 cursor-pointer"
          >
            Excluir insumo
          </button>
        </div>
      </div>
    </div>
  );
};
