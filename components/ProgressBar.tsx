import React from 'react';

interface ProgressBarProps {
  present: number;
  absent: number;
  total: number;
  showPercentages?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  present,
  absent,
  total,
  showPercentages = true,
  height = 'md'
}) => {
  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;
  const pendingPct = Math.max(0, 100 - presentPct - absentPct);

  const heights: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8'
  };

  return (
    <div className="w-full space-y-2">
      <div className={`w-full ${heights[height]} rounded-full overflow-hidden bg-cream-200 flex shadow-inner-soft`}>
        {presentPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-success-400 to-success-500 flex items-center justify-center transition-all duration-500"
            style={{ width: `${presentPct}%` }}
          >
            {showPercentages && presentPct >= 10 && (
              <span className="text-[10px] font-bold text-white drop-shadow-sm">
                {presentPct}%
              </span>
            )}
          </div>
        )}

        {absentPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-alert-400 to-alert-500 flex items-center justify-center transition-all duration-500"
            style={{ width: `${absentPct}%` }}
          >
            {showPercentages && absentPct >= 10 && (
              <span className="text-[10px] font-bold text-white drop-shadow-sm">
                {absentPct}%
              </span>
            )}
          </div>
        )}

        {pendingPct > 0 && (
          <div
            className="h-full bg-cream-100 flex items-center justify-center transition-all duration-500"
            style={{ width: `${pendingPct}%` }}
          >
            {showPercentages && pendingPct >= 10 && (
              <span className="text-[10px] font-semibold text-neutral-400">
                {pendingPct}%
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-success-400 to-success-500"></span>
          <span className="text-neutral-500 font-medium">{present} présents</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-alert-400 to-alert-500"></span>
          <span className="text-neutral-500 font-medium">{absent} absents</span>
        </div>
      </div>
    </div>
  );
};
