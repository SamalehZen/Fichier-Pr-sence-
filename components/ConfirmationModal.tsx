
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white border-4 border-dark shadow-neo-lg p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="absolute -top-6 -left-6 bg-alert text-white p-3 border-2 border-dark shadow-neo">
            <AlertTriangle size={32} strokeWidth={2.5} />
        </div>

        <button 
            onClick={onCancel}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-dark transition-all"
        >
            <X size={24} />
        </button>

        <h2 className="text-2xl font-black uppercase mb-4 mt-2 leading-none text-alert">
            {title}
        </h2>
        
        <p className="text-dark font-bold text-lg mb-8 leading-relaxed border-l-4 border-gray-200 pl-4">
            {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
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
