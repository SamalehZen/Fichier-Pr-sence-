import React, { useEffect } from 'react';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <X size={20} />,
    warning: <AlertTriangle size={20} />
  } as const;

  const colors = {
    success: 'bg-success-500 border-success-600',
    error: 'bg-alert-500 border-alert-600',
    warning: 'bg-golden-500 border-golden-600'
  } as const;

  return (
    <div
      className={`fixed top-6 right-6 z-50 ${colors[type]} text-white px-6 py-4 rounded-card shadow-soft-xl border-l-4 flex items-center gap-3 animate-fade-in max-w-md`}
    >
      {icons[type]}
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors" aria-label="Fermer la notification">
        <X size={18} />
      </button>
    </div>
  );
};
