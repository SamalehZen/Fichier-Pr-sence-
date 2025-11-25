import React from 'react';
import { NeoButton } from './NeoButton';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onCancel}
      ></div>

      <div className="relative glass-dark border border-white/20 rounded-glass-xl shadow-glass-xl p-8 max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 backdrop-blur-glass">
        <div className="absolute -top-6 -left-6 bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-glass shadow-glass-lg border border-red-400/30 animate-pulse">
          <AlertTriangle size={36} strokeWidth={2.5} className="text-white" />
        </div>

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 glass hover:bg-white/20 rounded-glass border border-white/10 transition-all duration-200 group"
        >
          <X size={22} className="text-white/60 group-hover:text-white" />
        </button>

        <h2 className="text-2xl font-black uppercase mb-5 mt-4 leading-tight gradient-text">
          {title}
        </h2>

        <p className="text-white/80 font-medium text-base mb-8 leading-relaxed glass rounded-glass p-4 border-l-4 border-red-500/50">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <NeoButton
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            ANNULER
          </NeoButton>
          <NeoButton
            onClick={onConfirm}
            variant="danger"
            className="flex-1"
          >
            CONFIRMER
          </NeoButton>
        </div>
      </div>
    </div>
  );
};