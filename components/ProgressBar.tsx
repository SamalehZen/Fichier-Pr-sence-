import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  label, 
  colorClass = 'bg-neon' 
}) => {
  const percentage = Math.round((value / max) * 100) || 0;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {label && <span className="text-xs font-bold uppercase tracking-wide">{label}</span>}
        <span className="text-xs font-bold font-mono">{percentage}%</span>
      </div>
      <div className="w-full h-4 border-2 border-dark bg-gray-100 relative">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out border-r-2 border-dark`}
          style={{ width: `${percentage}%` }}
        >
            {/* Diagonal stripe pattern overlay */}
            <div className="w-full h-full absolute top-0 left-0 opacity-20" 
                 style={{backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '10px 10px'}}></div>
        </div>
      </div>
    </div>
  );
};