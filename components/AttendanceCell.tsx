
import React, { useState, useRef, useEffect } from 'react';
import { AttendanceRecord, JUSTIFICATIONS } from '../types';
import { Check, X, MessageSquare } from 'lucide-react';

interface AttendanceCellProps {
  date: string;
  record: AttendanceRecord | undefined;
  onChange: (status: 'PRESENT' | 'ABSENT', justification?: string) => void;
}

export const AttendanceCell: React.FC<AttendanceCellProps> = ({ date, record, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const status = record?.status || 'PENDING';
  const justification = record?.justification;

  // Close menu on scroll to prevent floating menu mismatch
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
      const menuHeightEstimate = 350; // Increased estimate for buttons

      // Decide placement: if space below is less than menu height, place above
      const spaceBelow = windowHeight - rect.bottom;
      const placement = spaceBelow < menuHeightEstimate ? 'top' : 'bottom';

      let top = 0;
      if (placement === 'bottom') {
        top = rect.bottom + 10; // 10px gap
      } else {
        top = rect.top - 10; // 10px gap
      }

      // Center horizontally relative to button
      const left = rect.left + rect.width / 2;

      setMenuPosition({ top, left, placement });
      setIsOpen(true);
    }
  };

  const handleStatusClick = (newStatus: 'PRESENT' | 'ABSENT') => {
    if (newStatus === 'PRESENT') {
      onChange('PRESENT');
      setIsOpen(false);
    } else {
      // If switching to absent, keep open to select justification
      // Default to first justification if none exists
      if (status !== 'ABSENT') {
         onChange('ABSENT', JUSTIFICATIONS[0]); 
      }
    }
  };

  const handleJustificationClick = (just: string) => {
    onChange('ABSENT', just);
    setIsOpen(false); // Always close on click, even if same value
  };

  return (
    <>
      {/* Backdrop for click-outside */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-dark/20 backdrop-blur-[1px] z-[90]"
            onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className="relative group/cell">
        {/* Main Button */}
        <button
            ref={buttonRef}
            onClick={toggleMenu}
            className={`
            w-10 h-10 relative flex items-center justify-center border-2 border-dark transition-all duration-200 z-[30]
            ${status === 'PRESENT' ? 'bg-neon' : status === 'ABSENT' ? 'bg-alert text-white pattern-diagonal' : 'bg-white hover:bg-gray-100'}
            focus:outline-none hover:scale-105 active:scale-95
            ${isOpen ? 'scale-105 ring-2 ring-dark ring-offset-1' : ''}
            `}
        >
            {status === 'PRESENT' && <Check size={20} strokeWidth={3} className="text-dark" />}
            {status === 'ABSENT' && (
                <>
                    <X size={20} strokeWidth={3} className="relative z-10 drop-shadow-md text-white" />
                    {/* Visual indicator for justification */}
                    {justification && (
                        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-dark border border-white rounded-full z-10"></div>
                    )}
                </>
            )}
            {status === 'PENDING' && <span className="text-gray-300 text-xs font-bold">?</span>}
        </button>

        {/* Tooltip for Justification (Hover only when ABSENT & has justification & menu closed) */}
        {status === 'ABSENT' && justification && !isOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/cell:block z-[60] w-max max-w-[200px] pointer-events-none">
                <div className="bg-dark text-white border-2 border-white shadow-neo px-3 py-2 relative">
                    <div className="text-[9px] font-bold uppercase text-neon mb-0.5 tracking-wider">Motif d'absence</div>
                    <div className="text-xs font-bold flex items-center gap-2">
                        <MessageSquare size={12} className="text-neon" />
                        <span className="truncate">{justification}</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-dark"></div>
                </div>
            </div>
        )}

        {/* Edit Menu - Fixed Positioning Portal-like behavior */}
        {isOpen && menuPosition && (
            <div 
                className={`
                    fixed z-[100] bg-white border-2 border-dark shadow-neo-lg w-[300px] md:w-[340px] p-5 text-dark
                    
                    /* Mobile: Always stick to bottom */
                    max-md:!top-[unset] max-md:!left-0 max-md:!bottom-0 max-md:!translate-x-0 max-md:!translate-y-0 max-md:w-full max-md:rounded-t-xl max-md:border-t-4 max-md:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]
                    max-md:animate-in max-md:slide-in-from-bottom

                    /* Desktop: Position based on calculation */
                    md:rounded-none
                    md:animate-in md:fade-in md:zoom-in-95 md:duration-150
                `}
                style={{
                    // On desktop, apply calculated positions. 
                    // On mobile, the CSS class overrides these with !important properties above
                    top: menuPosition.placement === 'bottom' ? menuPosition.top : 'auto',
                    bottom: menuPosition.placement === 'top' ? (window.innerHeight - menuPosition.top - 10) : 'auto', // Calculate bottom if placing top
                    left: menuPosition.left,
                    transform: 'translateX(-50%)', // Center horizontally
                }}
            >
                
            {/* Connector Triangle (Desktop only) */}
            <div className={`
                hidden md:block absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent
                ${menuPosition.placement === 'bottom' 
                    ? '-top-[12px] border-b-[12px] border-b-dark after:absolute after:-bottom-[10px] after:-left-[8px] after:border-l-[8px] after:border-l-transparent after:border-r-[8px] after:border-r-transparent after:border-b-[8px] after:border-b-white' 
                    : '-bottom-[12px] border-t-[12px] border-t-dark after:absolute after:-top-[10px] after:-left-[8px] after:border-l-[8px] after:border-l-transparent after:border-r-[8px] after:border-r-transparent after:border-t-[8px] after:border-t-white'
                }
            `}></div>

            {/* Mobile Handle */}
            <div className="md:hidden w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

            {/* Content */}
            <div className="mb-5 text-center">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ÉDITION DU STATUT</div>
                <div className="text-xl font-black uppercase border-b-4 border-neon inline-block pb-1 text-dark">{date}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
                <button
                onClick={() => handleStatusClick('PRESENT')}
                className={`
                    p-3 border-2 border-dark font-bold text-sm transition-all flex flex-col items-center gap-2 justify-center min-h-[80px]
                    ${status === 'PRESENT' 
                        ? 'bg-neon text-dark shadow-[inset_3px_3px_0px_rgba(0,0,0,0.1)] translate-x-[2px] translate-y-[2px]' 
                        : 'bg-white text-dark hover:bg-neon/20 hover:translate-y-[-4px] shadow-neo hover:shadow-neo-hover'}
                `}
                >
                <Check size={28} strokeWidth={3} /> 
                PRÉSENT
                </button>
                <button
                onClick={() => handleStatusClick('ABSENT')}
                className={`
                    p-3 border-2 border-dark font-bold text-sm transition-all flex flex-col items-center gap-2 justify-center min-h-[80px]
                    ${status === 'ABSENT' 
                        ? 'bg-alert text-white shadow-[inset_3px_3px_0px_rgba(0,0,0,0.2)] pattern-diagonal translate-x-[2px] translate-y-[2px]' 
                        : 'bg-white text-dark hover:bg-alert/10 hover:translate-y-[-4px] shadow-neo hover:shadow-neo-hover'}
                `}
                >
                <X size={28} strokeWidth={3} /> 
                ABSENT
                </button>
            </div>

            {status === 'ABSENT' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 bg-gray-50 p-4 border-2 border-gray-200">
                    <label className="text-xs font-bold uppercase flex items-center gap-2 text-dark mb-2">
                        <MessageSquare size={14} /> Justification requise
                    </label>
                    <div className="flex flex-col gap-2">
                        {JUSTIFICATIONS.map(j => (
                            <button
                                key={j}
                                onClick={() => handleJustificationClick(j)}
                                className={`
                                    w-full text-left px-4 py-3 border-2 font-bold text-xs uppercase transition-all flex items-center justify-between
                                    ${justification === j 
                                        ? 'bg-dark text-neon border-dark shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' 
                                        : 'bg-white text-dark border-dark hover:bg-white hover:shadow-neo hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-y-0 active:translate-x-0 active:shadow-none'}
                                `}
                            >
                                {j}
                                {justification === j && <Check size={16} className="text-neon" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile Only: Close Button */}
            <button 
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full md:hidden bg-dark text-white font-bold py-4 uppercase tracking-widest active:bg-black"
            >
                Fermer
            </button>
            </div>
        )}
      </div>
    </>
  );
};
