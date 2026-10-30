import React from 'react';
import { Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => {
        let borderColor = 'border-blue-500/40 text-blue-200';
        let icon = <Info className="w-4 h-4 text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          borderColor = 'border-emerald-500/40 text-emerald-200';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          borderColor = 'border-rose-500/40 text-rose-200';
          icon = <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl bg-gray-900/95 backdrop-blur-md border shadow-2xl text-xs font-semibold transform transition-all duration-300 animate-in slide-in-from-bottom-3 ${borderColor}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
