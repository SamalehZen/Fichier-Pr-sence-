import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AttendanceRecord, JUSTIFICATIONS, AttendanceStatus } from '../types';
import { Check, X, MessageSquare, Minus } from 'lucide-react';
import { SoftButton } from './SoftButton';

interface AttendanceCellProps {
  date: string;
  record: AttendanceRecord | undefined;
  onChange: (status: AttendanceStatus, justification?: string) => void;
}

const formatDisplayDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  if (Number.isNaN(dateObj.getTime())) {
    return dateStr;
  }

  return dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const AttendanceCell: React.FC<AttendanceCellProps> = ({ date, record, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const status = record?.status || 'PENDING';
  const justification = record?.justification;

  const displayDate = useMemo(() => formatDisplayDate(date), [date]);

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
      const menuHeightEstimate = 320;

      const spaceBelow = windowHeight - rect.bottom;
      const placement: 'top' | 'bottom' = spaceBelow < menuHeightEstimate ? 'top' : 'bottom';
      const top = placement === 'bottom' ? rect.bottom : rect.top;
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
          className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-[90]"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className="relative group/cell">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className={`
            w-10 h-10 relative flex items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none
            ${
              status === 'PRESENT'
                ? 'bg-success-400 border-success-500 shadow-soft'
                : status === 'ABSENT'
                  ? 'bg-alert-400 border-alert-500 text-white shadow-soft'
                  : 'bg-white border-cream-200 hover:bg-cream-100 hover:shadow-soft'
            }
            ${isOpen ? 'ring-2 ring-golden-400 ring-offset-2 ring-offset-white' : ''}
          `}
        >
          {status === 'PRESENT' && (
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-inner-soft">
              <Check size={16} strokeWidth={3} className="text-success-600" />
            </div>
          )}
          {status === 'ABSENT' && (
            <>
              <div className="w-6 h-6 bg-alert-600 rounded-full flex items-center justify-center shadow-inner-soft">
                <X size={16} strokeWidth={3} className="text-white" />
              </div>
              {justification && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-white/80 border border-alert-100 rounded-full"></div>
              )}
            </>
          )}
          {status === 'PENDING' && (
            <span className="text-neutral-300 text-xs font-semibold">?</span>
          )}
        </button>

        {status === 'ABSENT' && justification && !isOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/cell:block z-[60] max-w-[220px]">
            <div className="bg-white border border-cream-200 rounded-card shadow-soft px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
                Motif d'absence
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <MessageSquare size={14} className="text-golden-500" />
                <span className="truncate">{justification}</span>
              </div>
            </div>
          </div>
        )}

        {isOpen && menuPosition && (
          <div
            className="fixed z-[100] bg-white border border-cream-200 rounded-card shadow-soft-lg w-[320px] max-w-[calc(100vw-32px)] p-5 text-charcoal-800 animate-fade-in"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              transform: `translateX(-50%) ${menuPosition.placement === 'bottom' ? 'translateY(12px)' : 'translateY(-100%) translateY(-12px)'}`,
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-1">
                  Mise à jour du statut
                </div>
                <div className="text-lg font-semibold text-charcoal-800 capitalize">
                  {displayDate}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-charcoal-800 hover:bg-cream-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <SoftButton
                variant={status === 'PRESENT' ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => handleStatusClick('PRESENT')}
                icon={<Check size={16} />}
                className={status === 'PRESENT' ? 'shadow-soft-lg' : '!border-success-200 !text-success-600 hover:!border-success-300'}
              >
                Présent
              </SoftButton>
              <SoftButton
                variant={status === 'ABSENT' ? 'danger' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => handleStatusClick('ABSENT')}
                icon={<X size={16} />}
                className={status === 'ABSENT' ? 'shadow-soft-lg' : '!border-alert-200 !text-alert-500 hover:!border-alert-300'}
              >
                Absent
              </SoftButton>
            </div>

            {status === 'ABSENT' && (
              <div className="space-y-3 bg-cream-50 border border-cream-200 rounded-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                  <MessageSquare size={14} />
                  Sélectionnez un motif
                </div>
                <div className="flex flex-col gap-2">
                  {JUSTIFICATIONS.map((j) => (
                    <button
                      key={j}
                      onClick={() => handleJustificationClick(j)}
                      className={`w-full px-4 py-3 rounded-input border text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                        justification === j
                          ? 'bg-alert-50 border-alert-200 text-alert-600 shadow-soft'
                          : 'bg-white border-cream-200 text-neutral-600 hover:border-golden-300 hover:bg-cream-50'
                      }`}
                    >
                      <span className="truncate">{j}</span>
                      {justification === j && <Check size={16} className="text-alert-500" />}
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
                className="w-full mt-4 text-sm font-medium text-neutral-500 hover:text-alert-500 hover:bg-alert-50 rounded-input py-2 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Minus size={14} />
                Effacer le statut
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
