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
        <NeoCard className="flex items-center gap-4">
          <div className="p-3 bg-dark text-white rounded-none">
            <Users size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase">Effectif</div>
            <div className="text-3xl font-black">{users.length}</div>
          </div>
        </NeoCard>

        <NeoCard className="flex items-center gap-4">
          <div className="p-3 bg-neon text-dark rounded-none border-2 border-dark">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase">Présences</div>
            <div className="text-3xl font-black">{totalPresent}</div>
          </div>
        </NeoCard>

        <NeoCard className="flex items-center gap-4">
          <div className="p-3 bg-alert text-white rounded-none border-2 border-dark">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase">Absences</div>
            <div className="text-3xl font-black">{totalAbsent}</div>
          </div>
        </NeoCard>

        <NeoCard className="flex items-center gap-4">
          <div className="p-3 bg-white text-dark rounded-none border-2 border-dark">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase">Taux Global</div>
            <div className="text-3xl font-black">{globalRate}%</div>
          </div>
        </NeoCard>
      </div>

      <NeoCard title="PERFORMANCE INDIVIDUELLE">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {users.map(user => {
            const userPresent = Object.values(user.attendance).filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
            const userAbsent = Object.values(user.attendance).filter((r: AttendanceRecord) => r.status === 'ABSENT').length;
            const userTotal = userPresent + userAbsent;
            // Use totalDays for the calculation base to show completion over the period
            const percentage = userTotal > 0 ? Math.round((userPresent / userTotal) * 100) : 0;

            return (
              <div key={user.id} className="flex items-center gap-4">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 border-2 border-dark grayscale hover:grayscale-0 transition-all"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{user.name}</span>
                    {userAbsent > 0 && <span className="text-[10px] bg-alert text-white px-1 font-bold">{userAbsent} ABS</span>}
                  </div>
                  <ProgressBar 
                    value={userPresent} 
                    max={Math.max(userTotal, 1)} 
                    colorClass={percentage < 50 ? 'bg-alert' : 'bg-neon'}
                  />
                </div>
              </div>
            );
          })}
          {users.length === 0 && <p className="text-gray-500 italic text-sm">Aucun membre enregistré.</p>}
        </div>
      </NeoCard>
    </div>
  );
};