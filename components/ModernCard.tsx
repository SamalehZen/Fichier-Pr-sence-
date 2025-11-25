import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  hover?: boolean;
  variant?: 'default' | 'glass' | 'gradient';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  badge,
  hover = false,
  variant = 'default'
}) => {
  const baseStyles = 'rounded-card p-6 transition-all duration-300';

  const variants = {
    default: 'bg-white shadow-soft-md border border-cream-200',
    glass: 'glass-effect shadow-soft-lg',
    gradient: 'bg-gradient-to-br from-white to-cream-100 shadow-soft-md border border-cream-200'
  } as const;

  const hoverStyles = hover ? 'hover-glow cursor-pointer' : '';

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {(title || badge) && (
        <div className="flex justify-between items-start mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-charcoal-800 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span className="px-3 py-1 bg-golden-100 text-golden-600 text-xs font-semibold rounded-badge">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
