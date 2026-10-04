import React, { useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  showCancel?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  variant = 'danger',
  showCancel = true,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap
      setTimeout(() => confirmBtnRef.current?.focus(), 100);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 className="w-6 h-6 text-red-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-400" />,
    info: <Info className="w-6 h-6 text-cyan-400" />,
  };

  const bgColors = {
    danger: 'bg-red-500/10',
    warning: 'bg-amber-500/10',
    info: 'bg-cyan-500/10',
  };

  const btnColors = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-sm bg-[#1C202C] border border-[#2B3242] rounded-2xl shadow-xl transform transition-all scale-100 opacity-100 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className={`p-3 rounded-full mb-4 ${bgColors[variant]}`}>
              {icons[variant]}
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-gray-400 mb-6">
              {message}
            </p>
          </div>
          
          <div className="flex gap-3">
            {showCancel && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-[#222734] border border-[#2B3242] rounded-xl hover:bg-[#2A3142] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                {cancelText}
              </button>
            )}
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 ${btnColors[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
