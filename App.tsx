
import React, { useState, useMemo, useEffect } from 'react';
import { User, AttendanceRecord, UserGroup, AttendanceStatus } from './types';
import { DATE_CONFIG, formatDayName, formatDate, DEFAULT_USERS } from './constants';
import { NeoCard } from './components/NeoCard';
import { UserForm } from './components/UserForm';
import { AttendanceCell } from './components/AttendanceCell';
import { StatsView } from './components/StatsView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LayoutGrid, List, Download, Filter, UserCircle2, Trash2, CalendarDays } from 'lucide-react';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  // --- State Management (Reverted from DB) ---
  const [users, setUsers] = useState<User[]>(() => {
    // Load from local storage if available to prevent data loss on refresh
    // Changed key to 'v3' to force reload of new default avatars and names
    const saved = localStorage.getItem('neo-presence-users-v3');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Simple check to see if it's an empty array from previous cleanups
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    }
    // If no data or empty array, load defaults
    return DEFAULT_USERS;
  });
  
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [filterGroup, setFilterGroup] = useState<'ALL' | UserGroup>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'STATS'>('TABLE');
  
  // State for deletion modal
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Save to local storage whenever users change
  useEffect(() => {
    localStorage.setItem('neo-presence-users-v3', JSON.stringify(users));
  }, [users]);

  const handleAddUser = (name: string, group: UserGroup) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      group: group,
      // Generate a consistent avatar style for new users
      avatar: `https://avatar.iran.liara.run/public?username=${name.replace(/\s/g, '')}`,
      attendance: {}
    };
    setUsers(prev => [...prev, newUser]);
  };

  // Triggered when trash button is clicked
  const confirmDeleteUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // Prevent any parent handlers from firing
    setUserToDelete(userId);
  };

  // Triggered when confirming in modal
  const executeDelete = () => {
    if (userToDelete) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete));
        setUserToDelete(null);
    }
  };

  const handleAttendanceChange = (userId: string, date: string, status: AttendanceStatus, justification?: string) => {
    setUsers(prev => prev.map(user => {
        if (user.id === userId) {
            return {
                ...user,
                attendance: {
                    ...user.attendance,
                    [date]: { date, status, justification }
                }
            };
        }
        return user;
    }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
        // 1. Group Filter
        const matchesGroup = filterGroup === 'ALL' || user.group === filterGroup;

        // 2. Status Filter
        let matchesStatus = true;
        if (filterStatus === 'ABSENT') {
            matchesStatus = Object.values(user.attendance).some((r: AttendanceRecord) => r.status === 'ABSENT');
        } else if (filterStatus === 'PRESENT') {
            matchesStatus = Object.values(user.attendance).some((r: AttendanceRecord) => r.status === 'PRESENT');
        }

        return matchesGroup && matchesStatus;
    });
  }, [users, filterStatus, filterGroup]);

  const exportXLSX = () => {
    // 1. Define Headers
    const dateHeaders = DATE_CONFIG.dates.map(date => `${formatDayName(date)} ${formatDate(date)}`);
    const headers = ['NOM', 'GROUPE', ...dateHeaders, 'TOTAL PRÉSENCE', 'TAUX'];

    // 2. Prepare Data
    const rows = users.map(user => {
        const row: Record<string, string | number> = {
            'NOM': user.name,
            'GROUPE': user.group,
        };

        DATE_CONFIG.dates.forEach((date, index) => {
            const headerKey = dateHeaders[index];
            const record: AttendanceRecord | undefined = user.attendance[date];
            
            if (!record) {
                row[headerKey] = '';
            } else if (record.status === 'PRESENT') {
                row[headerKey] = 'PRÉSENT';
            } else if (record.status === 'ABSENT') {
                row[headerKey] = `ABSENT${record.justification ? ` (${record.justification})` : ''}`;
            } else {
                row[headerKey] = '?';
            }
        });

        // Stats
        const presentCount = Object.values(user.attendance).filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
        const totalPossible = DATE_CONFIG.dates.length;
        row['TOTAL PRÉSENCE'] = `${presentCount} / ${totalPossible}`;
        row['TAUX'] = Math.round((presentCount / totalPossible) * 100) + '%';

        return row;
    });

    // 3. Create Worksheet with explicit header order
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

    // 4. Adjust Column Widths
    const colWidths = [
        { wch: 25 }, // Nom
        { wch: 15 }, // Groupe
    ];
    // Dates
    DATE_CONFIG.dates.forEach(() => colWidths.push({ wch: 15 }));
    // Stats
    colWidths.push({ wch: 15 }, { wch: 10 });

    worksheet['!cols'] = colWidths;

    // 5. Create Workbook and Export
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suivi Présences");
    
    XLSX.writeFile(workbook, "presence_neo_track.xlsx");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 text-white font-sans selection:bg-primary-to/30 selection:text-white relative">
      <ConfirmationModal
        isOpen={!!userToDelete}
        title="SUPPRESSION DÉFINITIVE"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Toutes les données de présence associées seront perdues."
        onConfirm={executeDelete}
        onCancel={() => setUserToDelete(null)}
      />

      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4 relative">
            <span className="gradient-text drop-shadow-2xl">
              PRESENCE.TRACKER
            </span>
            <div className="absolute -bottom-2 left-0 h-1 w-32 bg-gradient-to-r from-primary-from to-primary-to rounded-full"></div>
          </h1>
          <div className="glass-dark text-white inline-block px-6 py-3 rounded-glass font-semibold text-sm backdrop-blur-glass">
            <span className="text-white/60">PÉRIODE :</span> 22/11/2025 → 06/12/2025
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setViewMode('TABLE')}
            className={`${
              viewMode === 'TABLE'
                ? 'bg-gradient-to-r from-primary-from to-primary-to text-white border-white/20 shadow-glass-lg'
                : 'glass border-white/10 text-white/80 hover:glass-hover hover:text-white'
            } px-6 py-3 rounded-glass backdrop-blur-glass font-semibold text-sm transition-all duration-300 flex items-center gap-2 border`}
          >
            <List size={20} />
            TABLEAU
          </button>
          <button
            onClick={() => setViewMode('STATS')}
            className={`${
              viewMode === 'STATS'
                ? 'bg-gradient-to-r from-primary-from to-primary-to text-white border-white/20 shadow-glass-lg'
                : 'glass border-white/10 text-white/80 hover:glass-hover hover:text-white'
            } px-6 py-3 rounded-glass backdrop-blur-glass font-semibold text-sm transition-all duration-300 flex items-center gap-2 border`}
          >
            <LayoutGrid size={20} />
            STATS
          </button>
          <button
            onClick={exportXLSX}
            className="glass border border-white/10 text-white/80 hover:glass-hover hover:text-white px-6 py-3 rounded-glass backdrop-blur-glass font-semibold text-sm transition-all duration-300 flex items-center gap-2"
          >
            <Download size={20} />
            XLSX
          </button>
        </div>
      </header>

      <main className="space-y-8">
        {viewMode === 'STATS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsView users={users} />
          </div>
        )}

        {viewMode === 'TABLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1">
              <UserForm onAddUser={handleAddUser} />
            </div>

            <div className="lg:col-span-3 space-y-6">
              <NeoCard title="FEUILLE D'ÉMARGEMENT" className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6 glass-dark rounded-glass-lg p-6 backdrop-blur-glass border border-white/10">
                  <div className="flex items-center gap-2 text-white/60">
                    <Filter size={20} />
                    <span className="font-bold text-sm uppercase tracking-wider">FILTRES</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase text-white/60">Groupe:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterGroup('ALL')}
                        className={`${
                          filterGroup === 'ALL'
                            ? 'bg-gradient-to-r from-primary-from to-primary-to text-white border-white/20 shadow-glass'
                            : 'glass border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        } px-4 py-2 text-xs font-semibold uppercase rounded-full transition-all duration-300 border`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => setFilterGroup('Groupe Matin')}
                        className={`${
                          filterGroup === 'Groupe Matin'
                            ? 'bg-gradient-to-r from-primary-from to-primary-to text-white border-white/20 shadow-glass'
                            : 'glass border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        } px-4 py-2 text-xs font-semibold uppercase rounded-full transition-all duration-300 border`}
                      >
                        Matin
                      </button>
                      <button
                        onClick={() => setFilterGroup('Groupe Soir')}
                        className={`${
                          filterGroup === 'Groupe Soir'
                            ? 'bg-gradient-to-r from-secondary-from to-secondary-to text-white border-white/20 shadow-glass'
                            : 'glass border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        } px-4 py-2 text-xs font-semibold uppercase rounded-full transition-all duration-300 border`}
                      >
                        Soir
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-8 bg-white/10"></div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase text-white/60">Statut:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`${
                          filterStatus === 'ALL'
                            ? 'bg-gradient-to-r from-primary-from to-primary-to text-white border-white/20 shadow-glass'
                            : 'glass border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        } px-4 py-2 text-xs font-semibold uppercase rounded-full transition-all duration-300 border`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => setFilterStatus('PRESENT')}
                        className={`${
                          filterStatus === 'PRESENT'
                            ? 'bg-gradient-to-r from-success-from to-success-to text-white border-white/20 shadow-glass'
                            : 'glass border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        } px-4 py-2 text-xs font-semibold uppercase rounded-full transition-all duration-300 border`}
                      >
                        Présent
                      </button>
                      <button
                        onClick={() => setFilterStatus('ABSENT')}
                        className={`${
                          filterStatus === 'ABSENT'
                            ? 'bg-gradient-to-r from-danger-from to-danger-to text-white border-white/20 shadow-glass'
                            : 'glass border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        } px-4 py-2 text-xs font-semibold uppercase rounded-full transition-all duration-300 border`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-dark rounded-glass-lg p-6 backdrop-blur-glass overflow-hidden border border-white/10">
                  <div className="overflow-x-auto pb-4">
                    <table className="w-full border-collapse border-spacing-0">
                      <thead>
                        <tr>
                          <th className="sticky left-0 z-[60] p-0 align-bottom min-w-[260px]">
                            <div className="flex items-center gap-3 p-4 glass-dark rounded-tl-glass backdrop-blur-glass relative overflow-hidden group border-r border-white/10">
                              <div className="relative z-10 p-3 bg-gradient-to-br from-primary-from to-primary-to rounded-glass shadow-glass">
                                <UserCircle2 size={24} className="text-white" />
                              </div>
                              <div className="flex flex-col z-10">
                                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider leading-none mb-1">LISTE DES</span>
                                <span className="text-lg font-bold uppercase tracking-tight leading-none text-white">MEMBRES</span>
                              </div>
                            </div>
                          </th>

                          {DATE_CONFIG.dates.map(date => {
                            const isSpecialDay = ['ven.'].includes(formatDayName(date).toLowerCase());
                            return (
                              <th key={date} className="p-2 align-bottom min-w-[110px]">
                                <div
                                  className={`flex flex-col glass rounded-glass transition-all duration-300 group cursor-default overflow-hidden border border-white/10 ${
                                    isSpecialDay ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'hover:-translate-y-1 hover:shadow-glass'
                                  }`}
                                >
                                  <div
                                    className={`text-xs font-bold uppercase py-2 tracking-wider backdrop-blur-glass ${
                                      isSpecialDay ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white' : 'bg-white/5 text-white/80'
                                    }`}
                                  >
                                    {formatDayName(date)}
                                  </div>

                                  <div className="py-3 px-2 flex flex-col items-center justify-center gap-1 relative">
                                    <CalendarDays size={14} className="text-white/30 absolute top-1 right-1" />
                                    <span className="text-xl font-bold text-white leading-none">
                                      {formatDate(date).split('/')[0]}
                                    </span>
                                    <span className="text-xs font-medium text-white/50">
                                      /{formatDate(date).split('/')[1]}
                                    </span>
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="group hover:bg-white/5 transition-all duration-200 border-b border-white/5">
                            <td className="sticky left-0 z-[50] glass-dark group-hover:bg-white/10 backdrop-blur-glass border-r border-white/10 p-4 rounded-l-glass">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <img
                                      src={user.avatar}
                                      alt=""
                                      className="w-12 h-12 rounded-full border-2 border-white/20 shadow-glass object-cover"
                                    />
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-from/20 to-primary-to/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm leading-tight text-white truncate max-w-[140px]">{user.name}</div>
                                    <div
                                      className={`text-xs font-semibold uppercase px-3 py-1 mt-1.5 inline-block rounded-full border ${
                                        user.group === 'Groupe Matin'
                                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-400/30'
                                          : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 border-pink-400/30'
                                      }`}
                                    >
                                      {user.group}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={event => confirmDeleteUser(event, user.id)}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 w-9 h-9 flex items-center justify-center rounded-glass glass border border-white/10 text-white/60 hover:bg-red-500/80 hover:text-white hover:shadow-glass hover:scale-105"
                                  title="Supprimer le membre"
                                >
                                  <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                              </div>
                            </td>
                            {DATE_CONFIG.dates.map(date => {
                              const isSpecialDay = ['ven.'].includes(formatDayName(date).toLowerCase());
                              return (
                                <td key={date} className={`p-2 text-center border-r border-white/5 ${isSpecialDay ? 'bg-purple-500/5' : ''}`}>
                                  <div className="flex justify-center">
                                    <AttendanceCell
                                      date={formatDate(date)}
                                      record={user.attendance[date]}
                                      onChange={(status, just) => handleAttendanceChange(user.id, date, status, just)}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {users.length === 0 && (
                    <div className="glass rounded-glass-lg p-10 text-center text-white/70 border border-white/10">
                      <div className="text-lg font-bold uppercase tracking-widest">Aucune donnée disponible</div>
                      <div className="text-sm text-white/50 mt-2">Ajoutez un membre pour commencer le suivi.</div>
                    </div>
                  )}

                  {users.length > 0 && filteredUsers.length === 0 && (
                    <div className="glass rounded-glass-lg p-8 text-center border border-white/10">
                      <div className="text-lg font-bold uppercase tracking-widest text-white/70">Aucun résultat</div>
                      <div className="text-sm text-white/50 mt-2">Essayez de modifier les filtres.</div>
                    </div>
                  )}
                </div>
              </NeoCard>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 glass-dark rounded-glass-lg p-6 backdrop-blur-glass flex justify-between items-center text-sm font-semibold uppercase tracking-wider text-white/60 border border-white/10">
        <div>© 2025 CORPORATE OS</div>
        <div>SECURE SYSTEM • v.3.0.0</div>
      </footer>
    </div>
  );
};

export default App;
