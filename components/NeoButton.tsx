import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon,
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 font-bold border-2 border-dark transition-all duration-200 flex items-center justify-center gap-2 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";
  
  const variants = {
    primary: "bg-neon text-dark shadow-neo hover:bg-white hover:shadow-neo-hover hover:translate-x-[2px] hover:translate-y-[2px]",
    secondary: "bg-white text-dark shadow-neo hover:bg-gray-100 hover:shadow-neo-hover hover:translate-x-[2px] hover:translate-y-[2px]",
    danger: "bg-alert text-white shadow-neo hover:bg-red-600 hover:shadow-neo-hover hover:translate-x-[2px] hover:translate-y-[2px]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span className="uppercase tracking-wider text-sm">{children}</span>
    </button>
  );
};