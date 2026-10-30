import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

import type { Atendimento } from "./types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  atendimento: Atendimento | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  atendimento,
  onConfirm,
  onCancel,
}) => {
  // Fecha com Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !atendimento) return null;

  return (
    <div
      id="modal-delete-atendimento-backdrop"
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-ink/50 p-4 backdrop-blur-xs transition-opacity duration-200 fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        id="modal-delete-atendimento-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-delete-atendimento-title"
        className="relative w-full max-w-md animate-in overflow-hidden rounded-[32px] border border-petal/40 bg-white p-6 shadow-2xl duration-200 zoom-in-95 sm:p-8"
      >
        <button
          type="button"
          id="btn-modal-delete-atendimento-close"
          onClick={onCancel}
          className="absolute right-5 top-5 cursor-pointer rounded-full p-1 text-wine/60 transition-colors hover:bg-pale hover:text-wine"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-petal/50 bg-pale text-berry">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1 pr-4">
            <h4
              id="modal-delete-atendimento-title"
              className="font-display text-xl font-bold leading-snug text-wine"
            >
              Excluir atendimento
            </h4>
            <p className="mt-2 font-sans text-xs leading-relaxed text-ink/80 sm:text-sm">
              Excluir atendimento de{" "}
              <span className="font-bold text-wine">{atendimento.nomeCliente}</span>? Essa ação não
              pode ser desfeita.
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            id="btn-cancel-delete-atendimento"
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-petal px-5 py-2.5 text-sm font-bold text-wine transition-all hover:bg-pale"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-delete-atendimento"
            onClick={onConfirm}
            className="cursor-pointer rounded-full bg-berry px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-berry/20 transition-all hover:bg-wine"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
