import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const NeoCard: React.FC<NeoCardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white border-2 border-dark shadow-neo p-6 relative ${className}`}>
      {title && (
        <div className="absolute -top-5 left-4 bg-dark text-white px-3 py-1 text-sm font-bold uppercase tracking-widest transform -rotate-1">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};