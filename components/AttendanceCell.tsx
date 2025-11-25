import React, { useState, useRef, useEffect } from 'react';
import { AttendanceRecord, JUSTIFICATIONS, AttendanceStatus } from '../types';
import { Check, X, MessageSquare, Minus } from 'lucide-react';

interface AttendanceCellProps {
  date: string;
  record: AttendanceRecord | undefined;
  onChange: (status: AttendanceStatus, justification?: string) => void;
}

export const AttendanceCell: React.FC<AttendanceCellProps> = ({ date, record, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const status = record?.status || 'PENDING';
  const justification = record?.justification;

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const menuHeightEstimate = 350;

      const spaceBelow = windowHeight - rect.bottom;
      const placement = spaceBelow < menuHeightEstimate ? 'top' : 'bottom';

      let top = 0;
      if (placement === 'bottom') {
        top = rect.bottom + 10;
      } else {
        top = rect.top - 10;
      }

      const left = rect.left + rect.width / 2;

      setMenuPosition({ top, left, placement });
      setIsOpen(true);
    }
  };

  const handleStatusClick = (newStatus: 'PRESENT' | 'ABSENT') => {
    if (status === newStatus) {
      onChange('PENDING');
      setIsOpen(false);
      return;
    }

    if (newStatus === 'PRESENT') {
      onChange('PRESENT');
      setIsOpen(false);
    } else {
      if (status !== 'ABSENT') {
        onChange('ABSENT', JUSTIFICATIONS[0]);
      }
    }
  };

  const handleJustificationClick = (just: string) => {
    onChange('ABSENT', just);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className="relative group/cell">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className={`${
            status === 'PRESENT'
              ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-300/30 shadow-glass text-white'
              : status === 'ABSENT'
              ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400/30 shadow-glass text-white'
              : 'glass border-white/20 text-white/40 hover:bg-white/15 hover:text-white/80'
          } w-11 h-11 relative flex items-center justify-center rounded-glass transition-all duration-300 z-[30] border focus:outline-none hover:scale-110 active:scale-95 hover:shadow-glass-lg ${
            isOpen ? 'scale-110 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent' : ''
          }`}
        >
          {status === 'PRESENT' && <Check size={20} strokeWidth={3} className="drop-shadow-lg" />}
          {status === 'ABSENT' && (
            <>
              <X size={20} strokeWidth={3} className="relative z-10 drop-shadow-lg" />
              {justification && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-red-500 animate-pulse z-10"></div>
              )}
            </>
          )}
          {status === 'PENDING' && <span className="text-sm font-bold">?</span>}
        </button>

        {status === 'ABSENT' && justification && !isOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/cell:block z-[60] w-max max-w-[220px] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="glass-dark rounded-glass px-4 py-3 relative border border-white/20 shadow-glass-lg backdrop-blur-glass">
              <div className="text-xs font-bold uppercase text-emerald-400 mb-1 tracking-wider">Motif d'absence</div>
              <div className="text-sm font-semibold flex items-center gap-2 text-white">
                <MessageSquare size={14} className="text-emerald-400" />
                <span className="truncate">{justification}</span>
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 glass-dark border-b border-r border-white/20 rotate-45"></div>
            </div>
          </div>
        )}

        {isOpen && menuPosition && (
          <div
            className={`fixed z-[100] glass-dark border border-white/10 shadow-glass-xl w-[300px] md:w-[340px] p-6 rounded-glass backdrop-blur-glass text-white
              max-md:!top-[unset] max-md:!left-0 max-md:!bottom-0 max-md:!translate-x-0 max-md:!translate-y-0 max-md:w-full max-md:rounded-t-2xl max-md:border-t max-md:border-white/10 max-md:shadow-[0_-10px_40px_rgba(8,15,32,0.45)] max-md:animate-in max-md:slide-in-from-bottom
              md:animate-in md:fade-in md:zoom-in-95 md:duration-150`}
            style={{
              top: menuPosition.placement === 'bottom' ? menuPosition.top : 'auto',
              bottom: menuPosition.placement === 'top' ? window.innerHeight - menuPosition.top - 10 : 'auto',
              left: menuPosition.left,
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className={`hidden md:block absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent ${
                menuPosition.placement === 'bottom'
                  ? '-top-[12px] border-b-[12px] border-b-white/30'
                  : '-bottom-[12px] border-t-[12px] border-t-white/30'
              }`}
            ></div>

            <div className="md:hidden w-16 h-1.5 bg-white/30 rounded-full mx-auto mb-6"></div>

            <div className="mb-5 text-center">
              <div className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">Édition du statut</div>
              <div className="text-xl font-black uppercase inline-flex items-center gap-2 px-4 py-1 rounded-glass bg-white/10 border border-white/10">
                {date}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <button
                onClick={() => handleStatusClick('PRESENT')}
                className={`${
                  status === 'PRESENT'
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white border-emerald-300/30 shadow-inner-glass scale-95'
                    : 'glass border-white/10 text-white/80 hover:bg-emerald-500/20 hover:border-emerald-400/30 hover:scale-105 hover:shadow-glass'
                } p-4 rounded-glass font-bold text-sm transition-all duration-300 flex flex-col items-center gap-2 justify-center min-h-[90px] border`}
              >
                <Check size={32} strokeWidth={3} />
                PRÉSENT
              </button>
              <button
                onClick={() => handleStatusClick('ABSENT')}
                className={`${
                  status === 'ABSENT'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400/30 shadow-inner-glass scale-95'
                    : 'glass border-white/10 text-white/80 hover:bg-red-500/20 hover:border-red-400/30 hover:scale-105 hover:shadow-glass'
                } p-4 rounded-glass font-bold text-sm transition-all duration-300 flex flex-col items-center gap-2 justify-center min-h-[90px] border`}
              >
                <X size={32} strokeWidth={3} />
                ABSENT
              </button>
            </div>

            {status === 'ABSENT' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 glass rounded-glass border border-white/10 p-5">
                <div className="text-xs font-bold uppercase flex items-center gap-2 text-white/70">
                  <MessageSquare size={14} /> Justification requise
                </div>
                <div className="flex flex-col gap-2">
                  {JUSTIFICATIONS.map(j => (
                    <button
                      key={j}
                      onClick={() => handleJustificationClick(j)}
                      className={`${
                        justification === j
                          ? 'bg-gradient-to-r from-primary-from to-primary-to text-white border-white/20 shadow-glass'
                          : 'glass border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                      } w-full text-left px-4 py-3 rounded-glass font-semibold text-xs uppercase transition-all duration-300 flex items-center justify-between`}
                    >
                      <span className="truncate">{j}</span>
                      {justification === j && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {status !== 'PENDING' && (
              <button
                onClick={() => {
                  onChange('PENDING');
                  setIsOpen(false);
                }}
                className="w-full mt-4 glass border border-white/10 rounded-glass py-3 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/15 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Minus size={12} /> Effacer le statut
              </button>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full md:hidden bg-gradient-to-r from-primary-from to-primary-to text-white font-bold py-4 uppercase tracking-widest rounded-glass shadow-glass"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </>
  );
};