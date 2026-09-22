import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface FinanceiroDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemTypeLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FinanceiroDeleteModal: React.FC<FinanceiroDeleteModalProps> = ({
  isOpen,
  title,
  itemName,
  itemTypeLabel,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-delete-financeiro-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        id="modal-delete-financeiro-content"
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

        {/* Header with Warning Icon */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-pale border border-petal/50 flex items-center justify-center shrink-0 text-berry">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-4">
            <h4
              id="modal-delete-title"
              className="font-display font-bold text-xl text-wine leading-snug"
            >
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-ink/80 mt-2 leading-relaxed font-sans">
              Tem certeza que deseja excluir {itemTypeLabel}{" "}
              <strong className="text-wine font-bold">"{itemName}"</strong>?
              Essa ação não pode ser desfeita.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-petal/30">
          <button
            type="button"
            id="btn-modal-delete-cancel"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-petal/60 text-xs font-bold text-wine hover:bg-pale transition-colors cursor-pointer text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-modal-delete-confirm"
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-berry hover:bg-wine text-white text-xs font-bold shadow-md shadow-berry/20 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
