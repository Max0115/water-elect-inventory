import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const bgBorder =
    toast.type === 'success'
      ? 'bg-[#1a2e26] border-emerald-500/40 text-emerald-300'
      : toast.type === 'error'
      ? 'bg-[#311b1b] border-red-500/40 text-red-300'
      : 'bg-[#1b2533] border-cyan-500/40 text-cyan-300';

  const Icon =
    toast.type === 'success'
      ? CheckCircle2
      : toast.type === 'error'
      ? AlertCircle
      : Info;

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all transform translate-y-0 ${bgBorder}`}
    >
      <div className="flex items-center space-x-2.5">
        <Icon size={18} className="shrink-0" />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-3 text-white/60 hover:text-white transition p-0.5 rounded"
      >
        <X size={14} />
      </button>
    </div>
  );
};

