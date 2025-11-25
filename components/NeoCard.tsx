import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const NeoCard: React.FC<NeoCardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`glass-dark rounded-glass-lg p-6 backdrop-blur-glass relative border border-white/10 shadow-glass overflow-hidden ${className}`}>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      {title && (
        <div className="relative mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white flex items-center gap-3">
            <span className="h-1 w-12 bg-gradient-to-r from-primary-from to-primary-to rounded-full"></span>
            {title}
          </h2>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};