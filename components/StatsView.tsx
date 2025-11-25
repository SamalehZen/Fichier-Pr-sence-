import React from 'react';
import { User, AttendanceRecord } from '../types';
import { DATE_CONFIG } from '../constants';
import { ModernCard } from './ModernCard';
import { ProgressBar } from './ProgressBar';
import { BarChart3, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StatsViewProps {
  users: User[];
}

export const StatsView: React.FC<StatsViewProps> = ({ users }) => {
  const totalDays = DATE_CONFIG.dates.length;
  const totalPossible = users.length * totalDays;

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalPending = 0;

  users.forEach((user) => {
    DATE_CONFIG.dates.forEach((date) => {
      const record = user.attendance[date];
      if (record?.status === 'PRESENT') totalPresent++;
      else if (record?.status === 'ABSENT') totalAbsent++;
      else totalPending++;
    });
  });

  const globalRate = totalPossible > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent || 1)) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernCard hover variant="gradient" className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-golden-400 to-golden-600 text-white rounded-2xl shadow-soft">
            <Users size={28} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Effectif total
            </div>
            <div className="text-4xl font-bold text-charcoal-800">{users.length}</div>
          </div>
        </ModernCard>

        <ModernCard hover variant="gradient" className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-success-400 to-success-600 text-white rounded-2xl shadow-soft">
            <CheckCircle2 size={28} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Présences enregistrées
            </div>
            <div className="text-4xl font-bold text-charcoal-800">{totalPresent}</div>
          </div>
        </ModernCard>

        <ModernCard hover variant="gradient" className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-alert-400 to-alert-600 text-white rounded-2xl shadow-soft">
            <AlertTriangle size={28} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Absences
            </div>
            <div className="text-4xl font-bold text-charcoal-800">{totalAbsent}</div>
          </div>
        </ModernCard>

        <ModernCard hover variant="gradient" className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-charcoal-700 to-charcoal-800 text-white rounded-2xl shadow-soft">
            <BarChart3 size={28} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Taux global
            </div>
            <div className="text-4xl font-bold text-charcoal-800">{globalRate}%</div>
          </div>
        </ModernCard>
      </div>

      <ModernCard title="Performance individuelle" subtitle={`${users.length} membres`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => {
            const userPresent = Object.values(user.attendance).filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
            const userAbsent = Object.values(user.attendance).filter((r: AttendanceRecord) => r.status === 'ABSENT').length;

            return (
              <div
                key={user.id}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-cream-50 transition-all duration-200 border border-transparent hover:border-cream-200"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-golden-400 object-cover shrink-0 shadow-soft hover:scale-105 transition-transform duration-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-base text-charcoal-800 truncate pr-2">
                      {user.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-badge flex items-center gap-1.5 ${
                        user.group === 'Groupe Matin'
                          ? 'bg-golden-100 text-golden-700 border border-golden-300'
                          : 'bg-charcoal-800 text-golden-400 border border-charcoal-700'
                      }`}
                    >
                      {user.group === 'Groupe Matin' ? '🌅 Matin' : '🌙 Soir'}
                    </span>
                  </div>

                  <ProgressBar present={userPresent} absent={userAbsent} total={totalDays} height="sm" />
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="col-span-full text-center py-8 text-neutral-500">
              Aucun membre enregistré pour le moment.
            </div>
          )}
        </div>
      </ModernCard>
    </div>
  );
};
