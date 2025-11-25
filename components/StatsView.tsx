import React from 'react';
import { User, AttendanceRecord } from '../types';
import { DATE_CONFIG } from '../constants';
import { NeoCard } from './NeoCard';
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

  users.forEach(user => {
    DATE_CONFIG.dates.forEach(date => {
      const record = user.attendance[date];
      if (record?.status === 'PRESENT') totalPresent++;
      else if (record?.status === 'ABSENT') totalAbsent++;
      else totalPending++;
    });
  });

  const globalRate = totalPossible > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-dark rounded-glass-lg p-6 backdrop-blur-glass border border-white/10 shadow-glass hover:shadow-glass-lg hover:scale-105 transition-all duration-300 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-glass shadow-glass">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">Effectif</div>
            <div className="text-4xl font-bold text-white mt-1">{users.length}</div>
          </div>
        </div>

        <div className="glass-dark rounded-glass-lg p-6 backdrop-blur-glass border border-white/10 shadow-glass hover:shadow-glass-lg hover:scale-105 transition-all duration-300 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-glass shadow-glass">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Présences</div>
            <div className="text-4xl font-bold text-white mt-1">{totalPresent}</div>
          </div>
        </div>

        <div className="glass-dark rounded-glass-lg p-6 backdrop-blur-glass border border-white/10 shadow-glass hover:shadow-glass-lg hover:scale-105 transition-all duration-300 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-glass shadow-glass">
            <AlertTriangle size={28} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-red-300 uppercase tracking-wider">Absences</div>
            <div className="text-4xl font-bold text-white mt-1">{totalAbsent}</div>
          </div>
        </div>

        <div className="glass-dark rounded-glass-lg p-6 backdrop-blur-glass border border-white/10 shadow-glass hover:shadow-glass-lg hover:scale-105 transition-all duration-300 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-glass shadow-glass">
            <BarChart3 size={28} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">Taux Global</div>
            <div className="text-4xl font-bold text-white mt-1">{globalRate}%</div>
          </div>
        </div>
      </div>

      <NeoCard title="PERFORMANCE INDIVIDUELLE">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map(user => {
            const userPresent = Object.values(user.attendance).filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
            const userAbsent = Object.values(user.attendance).filter((r: AttendanceRecord) => r.status === 'ABSENT').length;

            return (
              <div
                key={user.id}
                className="flex items-start gap-4 p-4 glass rounded-glass-lg hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20 hover:shadow-glass"
              >
                <div className="relative group/avatar">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full border-2 border-white/20 shadow-glass object-cover transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:border-primary-from/50"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-from/30 to-primary-to/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-white truncate pr-2">{user.name}</span>
                    <span
                      className={`text-xs font-semibold uppercase px-3 py-1 rounded-full border ${
                        user.group === 'Groupe Matin'
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-400/30'
                          : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 border-pink-400/30'
                      }`}
                    >
                      {user.group === 'Groupe Matin' ? 'MATIN' : 'SOIR'}
                    </span>
                  </div>

                  <ProgressBar present={userPresent} absent={userAbsent} total={totalDays} />
                </div>
              </div>
            );
          })}
          {users.length === 0 && <p className="text-white/60 italic text-sm">Aucun membre enregistré.</p>}
        </div>
      </NeoCard>
    </div>
  );
};