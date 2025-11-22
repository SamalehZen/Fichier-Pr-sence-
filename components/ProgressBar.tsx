import React from 'react';

interface ProgressBarProps {
  present: number;
  absent: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  present, 
  absent, 
  total 
}) => {
  // Calcul des pourcentages par rapport au TOTAL de la période (ex: 15 jours)
  // Si on a fait 3 jours (3 présents), ça fera 3/15 = 20% (et pas 100%)
  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;

  return (
    <div className="w-full">
      {/* Labels et Stats */}
      <div className="flex justify-between mb-1.5 items-end">
        <div className="flex gap-3 text-[10px] font-bold font-mono uppercase tracking-tight">
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-neon border border-dark"></div>
                <span className="text-dark">Présent: {present}</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-alert pattern-diagonal border border-dark"></div>
                <span className="text-alert">Absent: {absent}</span>
            </div>
        </div>
        <span className="text-[10px] font-black font-mono text-gray-400">TOTAL: {total}j</span>
      </div>

      {/* Barre Segmentée */}
      <div className="w-full h-5 border-2 border-dark bg-white flex relative overflow-hidden">
        
        {/* Segment Présent (Vert) */}
        <div 
          className="h-full bg-neon border-r-0 border-dark flex items-center justify-center transition-all duration-500 relative"
          style={{ width: `${presentPct}%`, borderRightWidth: presentPct > 0 ? '2px' : '0' }}
        >
            {presentPct >= 10 && <span className="text-[9px] font-black text-dark z-10">{presentPct}%</span>}
        </div>

        {/* Segment Absent (Rouge) */}
        <div 
          className="h-full bg-alert pattern-diagonal border-r-0 border-dark flex items-center justify-center transition-all duration-500 relative"
          style={{ width: `${absentPct}%`, borderRightWidth: absentPct > 0 ? '2px' : '0' }}
        >
            {absentPct >= 10 && <span className="text-[9px] font-black text-white drop-shadow-md z-10">{absentPct}%</span>}
        </div>

        {/* Fond hachuré léger pour les jours restants (Optionnel, pour le style) */}
        <div className="flex-1 h-full bg-gray-50 opacity-50" 
             style={{backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '4px 4px'}}>
        </div>
      </div>
    </div>
  );
};