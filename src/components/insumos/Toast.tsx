import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        onDismiss(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="pointer-events-auto flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-ink border border-petal/40 shadow-2xl text-cream transition-all transform animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-rose flex items-center justify-center shrink-0 text-white shadow-xs">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <p className="text-sm font-semibold text-cream leading-snug">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-petal hover:text-white rounded-lg transition-colors"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
