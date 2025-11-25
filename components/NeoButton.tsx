import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const NeoButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-glass backdrop-blur-glass transition-all duration-300 flex items-center justify-center gap-2 border relative overflow-hidden group';

  const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variants: Record<'primary' | 'secondary' | 'danger' | 'success', string> = {
    primary: 'bg-gradient-to-r from-primary-from to-primary-to text-white border-white/20 shadow-glass hover:shadow-glass-lg hover:scale-105 active:scale-100',
    secondary: 'glass border-white/10 text-white/80 hover:glass-hover hover:text-white hover:scale-105 active:scale-100',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/20 shadow-glass hover:shadow-glass-lg hover:from-red-600 hover:to-red-700 hover:scale-105 active:scale-100',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-400/20 shadow-glass hover:shadow-glass-lg hover:from-emerald-600 hover:to-green-700 hover:scale-105 active:scale-100',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      {icon && <span className="w-5 h-5 relative z-10">{icon}</span>}
      <span className="uppercase tracking-wider relative z-10">{children}</span>
    </button>
  );
};