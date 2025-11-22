
import React, { useState, useMemo, useEffect } from 'react';
import { User, AttendanceRecord, UserGroup } from './types';
import { DATE_CONFIG, formatDayName, formatDate, DEFAULT_USERS } from './constants';
import { NeoCard } from './components/NeoCard';
import { NeoButton } from './components/NeoButton';
import { UserForm } from './components/UserForm';
import { AttendanceCell } from './components/AttendanceCell';
import { StatsView } from './components/StatsView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LayoutGrid, List, Download, Filter, UserCircle2, Trash2 } from 'lucide-react';
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

  const handleAttendanceChange = (userId: string, date: string, status: 'PRESENT' | 'ABSENT', justification?: string) => {
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
    <div className="min-h-screen p-4 md:p-8 bg-[#e0e0e0] text-dark font-sans selection:bg-neon selection:text-dark">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={!!userToDelete}
        title="SUPPRESSION DÉFINITIVE"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Toutes les données de présence associées seront perdues."
        onConfirm={executeDelete}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2" style={{ textShadow: '4px 4px 0px #fff' }}>
            PRESENCE<span className="text-neon stroke-black" style={{ WebkitTextStroke: '2px black' }}>.TRACKER</span>
            </h1>
            <div className="bg-dark text-white inline-block px-4 py-2 font-bold font-mono transform -rotate-2">
            PÉRIODE : 22/11/2025 → 06/12/2025
            </div>
        </div>
        
        <div className="flex gap-4 flex-wrap">
            <NeoButton onClick={() => setViewMode('TABLE')} variant={viewMode === 'TABLE' ? 'primary' : 'secondary'} icon={<List size={20} />}>
                TABLEAU
            </NeoButton>
            <NeoButton onClick={() => setViewMode('STATS')} variant={viewMode === 'STATS' ? 'primary' : 'secondary'} icon={<LayoutGrid size={20} />}>
                STATS
            </NeoButton>
            <NeoButton onClick={exportXLSX} variant="secondary" icon={<Download size={20} />}>
                XLSX
            </NeoButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-8">
        
        {/* Stats Summary visible everywhere */}
        {viewMode === 'STATS' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StatsView users={users} />
             </div>
        )}

        {viewMode === 'TABLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Add User */}
            <div className="lg:col-span-1">
              <UserForm onAddUser={handleAddUser} />
            </div>

            {/* Right Column: Table */}
            <div className="lg:col-span-3">
              <NeoCard className="" title="FEUILLE D'ÉMARGEMENT">
                
                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center gap-6 border-b-2 border-gray-200 pb-6">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Filter size={20} />
                        <span className="font-black text-sm uppercase">FILTRES</span>
                    </div>

                    {/* Group Filter */}
                    <div className="flex items-center gap-2">
                         <span className="text-xs font-bold uppercase mr-1">Groupe:</span>
                         <div className="flex gap-1">
                             <button 
                                onClick={() => setFilterGroup('ALL')}
                                className={`px-2 py-1 text-[10px] font-bold uppercase border-2 border-dark transition-all ${filterGroup === 'ALL' ? 'bg-dark text-white shadow-neo-sm' : 'bg-white hover:bg-gray-100'}`}
                             >
                                Tous
                             </button>
                             <button 
                                onClick={() => setFilterGroup('Groupe Matin')}
                                className={`px-2 py-1 text-[10px] font-bold uppercase border-2 border-dark transition-all ${filterGroup === 'Groupe Matin' ? 'bg-white text-dark shadow-neo-sm' : 'bg-white hover:bg-gray-100 opacity-60 hover:opacity-100'}`}
                             >
                                Matin
                             </button>
                             <button 
                                onClick={() => setFilterGroup('Groupe Soir')}
                                className={`px-2 py-1 text-[10px] font-bold uppercase border-2 border-dark transition-all ${filterGroup === 'Groupe Soir' ? 'bg-dark text-neon shadow-neo-sm' : 'bg-white hover:bg-gray-100 opacity-60 hover:opacity-100'}`}
                             >
                                Soir
                             </button>
                         </div>
                    </div>

                    {/* Separator */}
                    <div className="hidden md:block w-px h-8 bg-gray-300"></div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase mr-1">Statut:</span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setFilterStatus('ALL')}
                                className={`px-2 py-1 text-[10px] font-bold uppercase border-2 border-dark transition-all ${filterStatus === 'ALL' ? 'bg-dark text-white shadow-neo-sm' : 'bg-white hover:bg-gray-100'}`}
                            >
                                Tous
                            </button>
                            <button 
                                onClick={() => setFilterStatus('PRESENT')}
                                className={`px-2 py-1 text-[10px] font-bold uppercase border-2 border-dark transition-all ${filterStatus === 'PRESENT' ? 'bg-neon text-dark shadow-neo-sm' : 'bg-white hover:bg-gray-100'}`}
                            >
                                Présent
                            </button>
                            <button 
                                onClick={() => setFilterStatus('ABSENT')}
                                className={`px-2 py-1 text-[10px] font-bold uppercase border-2 border-dark transition-all ${filterStatus === 'ABSENT' ? 'bg-alert text-white shadow-neo-sm' : 'bg-white hover:bg-gray-100'}`}
                            >
                                Absent
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-20 bg-white border-b-4 border-dark p-3 text-left min-w-[240px]">
                            <div className="flex items-center gap-2 text-dark">
                                <UserCircle2 /> MEMBRE
                            </div>
                        </th>
                        {DATE_CONFIG.dates.map(date => (
                          <th key={date} className="bg-white border-b-4 border-dark p-2 min-w-[100px] text-center align-bottom">
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="text-[10px] font-mono text-dark uppercase">{formatDayName(date)}</span>
                                <span className="text-sm font-bold text-dark">{formatDate(date)}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, idx) => (
                        <tr key={user.id} className={`group hover:bg-gray-50 transition-colors border-b border-gray-200`}>
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r-2 border-dark p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar} alt="" className="w-10 h-10 bg-white rounded-full border-2 border-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
                                    <div className="w-full">
                                        <div className="font-black text-sm leading-tight truncate max-w-[120px]">{user.name}</div>
                                        <div className={`text-[9px] font-bold uppercase px-1.5 py-0.5 mt-1 inline-block border border-dark ${user.group === 'Groupe Matin' ? 'bg-white text-dark' : 'bg-dark text-neon'}`}>
                                            {user.group}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => confirmDeleteUser(e, user.id)}
                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 w-8 h-8 flex items-center justify-center border-2 border-dark bg-white text-gray-400 hover:bg-alert hover:text-white hover:shadow-neo-sm hover:-translate-y-0.5"
                                    title="Supprimer le membre"
                                >
                                    <Trash2 size={16} strokeWidth={3} />
                                </button>
                            </div>
                          </td>
                          {DATE_CONFIG.dates.map(date => (
                            <td key={date} className="p-2 text-center border-r border-gray-100">
                              <div className="flex justify-center">
                                <AttendanceCell 
                                    date={formatDate(date)}
                                    record={user.attendance[date]}
                                    onChange={(status, just) => handleAttendanceChange(user.id, date, status, just)}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {users.length === 0 && (
                    <div className="text-center py-12 font-bold text-gray-400 uppercase tracking-widest">
                        Aucune donnée disponible
                    </div>
                  )}
                  
                  {users.length > 0 && filteredUsers.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 m-4 bg-gray-50">
                        <div className="font-bold text-gray-400 uppercase tracking-widest">Aucun résultat</div>
                        <div className="text-xs text-gray-400 mt-1">Essayez de modifier les filtres</div>
                    </div>
                  )}
                </div>
              </NeoCard>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-12 border-t-4 border-dark pt-6 flex justify-between items-center text-xs font-bold uppercase tracking-widest opacity-60">
        <div>© 2025 CORPORATE OS</div>
        <div>SECURE SYSTEM • v.2.0.4</div>
      </footer>
    </div>
  );
};

export default App;
