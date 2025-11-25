import React from 'react';

interface ProgressBarProps {
  present: number;
  absent: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ present, absent, total }) => {
  const recorded = present + absent;
  const remaining = total - recorded;

  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;
  const remainingPct = total > 0 ? Math.round((remaining / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="w-full h-3 rounded-full glass overflow-hidden flex relative border border-white/10 shadow-inner-glass">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500 relative"
          style={{ width: `${presentPct}%` }}
        >
          {presentPct >= 12 && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-lg">
              {presentPct}%
            </span>
          )}
        </div>

        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 relative"
          style={{ width: `${absentPct}%` }}
        >
          {absentPct >= 12 && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-lg">
              {absentPct}%
            </span>
          )}
        </div>

        <div
          className="h-full bg-white/10 transition-all duration-500"
          style={{ width: `${remainingPct}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-glass"></div>
          <span className="text-white/70">
            Présent: <span className="text-emerald-400 font-bold">{present}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-glass"></div>
          <span className="text-white/70">
            Absent: <span className="text-red-400 font-bold">{absent}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50 font-bold">TOTAL: {total}j</span>
        </div>
      </div>
    </div>
  );
};