import React from 'react';

interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const SoftButton: React.FC<SoftButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'rounded-button font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-golden-500 to-golden-600 text-white shadow-soft-md hover:shadow-soft-lg hover:from-golden-600 hover:to-golden-600 active:scale-95',
    secondary: 'bg-charcoal-800 text-white shadow-soft-md hover:bg-charcoal-700 hover:shadow-soft-lg active:scale-95',
    outline: 'bg-white border-2 border-golden-500 text-golden-600 hover:bg-golden-50 hover:shadow-soft active:scale-95',
    ghost: 'bg-transparent text-charcoal-800 hover:bg-cream-100 active:scale-95',
    danger: 'bg-gradient-to-r from-alert-500 to-alert-600 text-white shadow-soft-md hover:shadow-soft-lg hover:from-alert-600 hover:to-alert-600 active:scale-95'
  } as const;

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  } as const;

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="w-5 h-5">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="w-5 h-5">{icon}</span>}
    </button>
  );
};
