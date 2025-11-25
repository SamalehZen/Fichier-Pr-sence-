import React from 'react';
import { SoftButton } from './SoftButton';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-md" onClick={onCancel}></div>

      <div className="relative bg-white rounded-card shadow-soft-xl p-8 max-w-md w-full animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-charcoal-800 hover:bg-cream-100 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-alert-400 to-alert-600 text-white rounded-2xl shadow-soft-md">
            <AlertTriangle size={32} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-charcoal-800">
            {title}
          </h2>
        </div>

        <p className="text-neutral-600 text-base leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <SoftButton onClick={onCancel} variant="outline" size="md" className="flex-1">
            Annuler
          </SoftButton>
          <SoftButton onClick={onConfirm} variant="danger" size="md" className="flex-1">
            Confirmer
          </SoftButton>
        </div>
      </div>
    </div>
  );
};
