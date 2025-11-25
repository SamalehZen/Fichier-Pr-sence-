import React, { useState, useMemo, useEffect } from 'react';
import { User, AttendanceRecord, UserGroup, AttendanceStatus } from './types';
import { DATE_CONFIG, formatDayName, formatDate, DEFAULT_USERS } from './constants';
import { ModernCard } from './components/ModernCard';
import { SoftButton } from './components/SoftButton';
import { UserForm } from './components/UserForm';
import { AttendanceCell } from './components/AttendanceCell';
import { StatsView } from './components/StatsView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Toast } from './components/Toast';
import { SkeletonCard } from './components/SkeletonCard';
import {
  LayoutGrid,
  BarChart3,
  Download,
  Filter,
  UserCircle2,
  Trash2,
  CalendarDays,
  Users,
  Menu,
  X,
  UserPlus
} from 'lucide-react';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'neo-presence-users-v3';

const formatRangeDate = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date);

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return DEFAULT_USERS;
  });

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [filterGroup, setFilterGroup] = useState<'ALL' | UserGroup>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'STATS'>('TABLE');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timeout);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  const handleAddUser = (name: string, group: UserGroup) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    const newUser: User = {
      id: Math.random().toString(36).slice(2, 11),
      name: cleanName,
      group,
      avatar: `https://avatar.iran.liara.run/public?username=${cleanName.replace(/\s/g, '')}`,
      attendance: {}
    };

    setUsers((prev) => [...prev, newUser]);
    showToast(`${cleanName} ajouté avec succès !`);
  };

  const confirmDeleteUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setUserToDelete(userId);
  };

  const executeDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      setUserToDelete(null);
      showToast('Membre supprimé', 'warning');
    }
  };

  const handleAttendanceChange = (
    userId: string,
    date: string,
    status: AttendanceStatus,
    justification?: string
  ) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        return {
          ...user,
          attendance: {
            ...user.attendance,
            [date]: { date, status, justification }
          }
        };
      })
    );

    if (status === 'PRESENT') {
      showToast('Présence enregistrée');
    } else if (status === 'ABSENT') {
      showToast(
        `Absence enregistrée${justification ? ` · ${justification}` : ''}`,
        'warning'
      );
    } else {
      showToast('Statut réinitialisé', 'warning');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesGroup = filterGroup === 'ALL' || user.group === filterGroup;

      let matchesStatus = true;
      if (filterStatus === 'ABSENT') {
        matchesStatus = Object.values(user.attendance).some(
          (record: AttendanceRecord) => record.status === 'ABSENT'
        );
      } else if (filterStatus === 'PRESENT') {
        matchesStatus = Object.values(user.attendance).some(
          (record: AttendanceRecord) => record.status === 'PRESENT'
        );
      }

      return matchesGroup && matchesStatus;
    });
  }, [users, filterStatus, filterGroup]);

  const exportToExcel = () => {
    const dateHeaders = DATE_CONFIG.dates.map((date) => `${formatDayName(date)} ${formatDate(date)}`);
    const headers = ['Nom', 'Groupe', ...dateHeaders, 'Total présence', 'Taux'];

    const rows = users.map((user) => {
      const row: Record<string, string | number> = {
        Nom: user.name,
        Groupe: user.group
      };

      DATE_CONFIG.dates.forEach((date, index) => {
        const headerKey = dateHeaders[index];
        const record: AttendanceRecord | undefined = user.attendance[date];
        if (!record) {
          row[headerKey] = '';
          return;
        }

        if (record.status === 'PRESENT') {
          row[headerKey] = 'Présent';
        } else if (record.status === 'ABSENT') {
          row[headerKey] = `Absent${record.justification ? ` (${record.justification})` : ''}`;
        } else {
          row[headerKey] = 'En attente';
        }
      });

      const presentCount = Object.values(user.attendance).filter(
        (record: AttendanceRecord) => record.status === 'PRESENT'
      ).length;
      const totalPossible = DATE_CONFIG.dates.length;

      row['Total présence'] = `${presentCount} / ${totalPossible}`;
      row['Taux'] = totalPossible > 0 ? `${Math.round((presentCount / totalPossible) * 100)}%` : '0%';

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const columnWidths = [
      { wch: 28 },
      { wch: 16 },
      ...DATE_CONFIG.dates.map(() => ({ wch: 18 })),
      { wch: 18 },
      { wch: 10 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suivi Présence');
    XLSX.writeFile(workbook, 'presence-tracker.xlsx');
    showToast('Export Excel généré', 'success');
  };

  const scrollToForm = () => {
    const form = document.getElementById('user-form');
    form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-10 md:py-12 text-charcoal-800">
      <ConfirmationModal
        isOpen={!!userToDelete}
        title="Supprimer le membre"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Toutes ses données de présence seront perdues définitivement."
        onConfirm={executeDelete}
        onCancel={() => setUserToDelete(null)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {!isLoaded && (
        <div className="max-w-7xl mx-auto space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      <main
        className={`max-w-7xl mx-auto space-y-12 transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <header className="mb-4 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 w-full">
            <div className="flex-1">
              <div className="flex items-center justify-between w-full md:hidden">
                <div>
                  <h1 className="text-3xl font-bold text-charcoal-800 mb-1">
                    Gestion de{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-golden-500 to-golden-600">
                      présence
                    </span>
                  </h1>
                  <p className="text-sm text-neutral-500">Suivi quotidien des équipes</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                  aria-label="Ouvrir le menu"
                >
                  <Menu size={24} className="text-charcoal-800" />
                </button>
              </div>

              <div className="hidden md:block">
                <h1 className="text-4xl md:text-5xl font-bold text-charcoal-800 mb-2">
                  Gestion de{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-golden-500 to-golden-600">
                    présence
                  </span>
                </h1>
                <div className="text-neutral-500">Suivi quotidien des équipes</div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm mt-4 md:mt-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-golden-50 to-golden-100 border border-golden-300 text-golden-700 rounded-badge font-semibold shadow-soft">
                  <CalendarDays size={16} />
                  {formatRangeDate(DATE_CONFIG.start)} - {formatRangeDate(DATE_CONFIG.end)}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-cream-200 text-neutral-600 rounded-badge font-medium shadow-soft">
                  <Users size={16} />
                  {users.length} membres
                </span>
              </div>
            </div>

            <div className="hidden md:flex flex-wrap gap-3">
              <SoftButton
                variant={viewMode === 'TABLE' ? 'primary' : 'outline'}
                size="md"
                icon={<LayoutGrid size={20} />}
                onClick={() => setViewMode('TABLE')}
              >
                Tableau
              </SoftButton>
              <SoftButton
                variant={viewMode === 'STATS' ? 'primary' : 'outline'}
                size="md"
                icon={<BarChart3 size={20} />}
                onClick={() => setViewMode('STATS')}
              >
                Statistiques
              </SoftButton>
              <SoftButton variant="secondary" size="md" icon={<Download size={20} />} onClick={exportToExcel}>
                Exporter
              </SoftButton>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
            <div
              className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="relative bg-white h-full w-72 shadow-soft-xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal-800">Navigation</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X size={20} />
                </button>
              </div>
              <SoftButton
                variant={viewMode === 'TABLE' ? 'primary' : 'outline'}
                fullWidth
                icon={<LayoutGrid size={18} />}
                onClick={() => {
                  setViewMode('TABLE');
                  setMobileMenuOpen(false);
                }}
              >
                Tableau
              </SoftButton>
              <SoftButton
                variant={viewMode === 'STATS' ? 'primary' : 'outline'}
                fullWidth
                icon={<BarChart3 size={18} />}
                onClick={() => {
                  setViewMode('STATS');
                  setMobileMenuOpen(false);
                }}
              >
                Statistiques
              </SoftButton>
              <SoftButton
                variant="secondary"
                fullWidth
                icon={<Download size={18} />}
                onClick={() => {
                  exportToExcel();
                  setMobileMenuOpen(false);
                }}
              >
                Exporter en Excel
              </SoftButton>
            </div>
          </div>
        )}

        {viewMode === 'TABLE' && (
          <section className="space-y-8 animate-fade-in">
            <ModernCard variant="glass">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Filter size={20} />
                  <span className="font-semibold">Filtres :</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterGroup('ALL')}
                    className={`px-4 py-2 rounded-badge text-sm font-semibold transition-all duration-200 ${
                      filterGroup === 'ALL'
                        ? 'bg-golden-500 text-white shadow-soft'
                        : 'bg-white border border-cream-200 text-neutral-600 hover:border-golden-300'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setFilterGroup('Groupe Matin')}
                    className={`px-4 py-2 rounded-badge text-sm font-semibold transition-all duration-200 ${
                      filterGroup === 'Groupe Matin'
                        ? 'bg-golden-500 text-white shadow-soft'
                        : 'bg-white border border-cream-200 text-neutral-600 hover:border-golden-300'
                    }`}
                  >
                    🌅 Matin
                  </button>
                  <button
                    onClick={() => setFilterGroup('Groupe Soir')}
                    className={`px-4 py-2 rounded-badge text-sm font-semibold transition-all duration-200 ${
                      filterGroup === 'Groupe Soir'
                        ? 'bg-golden-500 text-white shadow-soft'
                        : 'bg-white border border-cream-200 text-neutral-600 hover:border-golden-300'
                    }`}
                  >
                    🌙 Soir
                  </button>
                </div>

                <div className="hidden sm:block h-8 w-px bg-cream-200"></div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-4 py-2 rounded-badge text-sm font-semibold transition-all duration-200 ${
                      filterStatus === 'ALL'
                        ? 'bg-charcoal-800 text-white shadow-soft'
                        : 'bg-white border border-cream-200 text-neutral-600 hover:border-charcoal-300'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setFilterStatus('PRESENT')}
                    className={`px-4 py-2 rounded-badge text-sm font-semibold transition-all duration-200 ${
                      filterStatus === 'PRESENT'
                        ? 'bg-success-500 text-white shadow-soft'
                        : 'bg-white border border-cream-200 text-neutral-600 hover:border-success-300'
                    }`}
                  >
                    ✓ Présents
                  </button>
                  <button
                    onClick={() => setFilterStatus('ABSENT')}
                    className={`px-4 py-2 rounded-badge text-sm font-semibold transition-all duration-200 ${
                      filterStatus === 'ABSENT'
                        ? 'bg-alert-500 text-white shadow-soft'
                        : 'bg-white border border-cream-200 text-neutral-600 hover:border-alert-300'
                    }`}
                  >
                    ✗ Absents
                  </button>
                </div>
              </div>
            </ModernCard>

            {!isLoaded ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <SkeletonCard />
                <div className="lg:col-span-3 space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div id="user-form" className="lg:col-span-1">
                  <UserForm onAddUser={handleAddUser} />
                </div>

                <div className="lg:col-span-3">
                  <ModernCard
                    title="Feuille d'émargement"
                    subtitle={`${filteredUsers.length} membre${
                      filteredUsers.length > 1 ? 's' : ''
                    } affiché${filteredUsers.length > 1 ? 's' : ''}`}
                  >
                    {filteredUsers.length > 0 ? (
                      <>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead className="bg-cream-100 sticky top-0 z-10">
                              <tr>
                                <th className="sticky left-0 bg-cream-100 px-6 py-4 text-left border-r border-cream-200 shadow-soft-md z-20">
                                  <div className="flex items-center gap-2">
                                    <UserCircle2 size={18} className="text-golden-600" />
                                    <span className="text-sm font-bold text-charcoal-800 uppercase tracking-wider">
                                      Membre
                                    </span>
                                  </div>
                                </th>
                                {DATE_CONFIG.dates.map((date) => (
                                  <th key={date} className="px-3 py-4 text-center border-l border-cream-200 min-w-[60px]">
                                    <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                      {formatDayName(date)}
                                    </div>
                                    <div className="text-sm font-bold text-charcoal-800 mt-1">
                                      {new Date(date).getDate()}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {filteredUsers.map((user) => (
                                <tr
                                  key={user.id}
                                  className="group border-t border-cream-200 hover:bg-cream-50 transition-colors duration-150"
                                >
                                  <td className="sticky left-0 bg-white group-hover:bg-cream-50 px-6 py-4 border-r border-cream-200 shadow-soft-md z-10">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full border-2 border-golden-400 object-cover shadow-soft"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-charcoal-800 text-sm truncate">
                                          {user.name}
                                        </div>
                                        <div
                                          className={`text-xs font-medium px-2 py-0.5 rounded-badge inline-block mt-1 ${
                                            user.group === 'Groupe Matin'
                                              ? 'bg-golden-100 text-golden-700'
                                              : 'bg-charcoal-800 text-golden-400'
                                          }`}
                                        >
                                          {user.group === 'Groupe Matin' ? '🌅 Matin' : '🌙 Soir'}
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => confirmDeleteUser(e, user.id)}
                                        className="p-2 text-alert-500 hover:bg-alert-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        aria-label="Supprimer le membre"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                  {DATE_CONFIG.dates.map((date) => (
                                    <td key={date} className="px-2 py-2 text-center border-l border-cream-200">
                                      <div className="flex justify-center">
                                        <AttendanceCell
                                          date={date}
                                          record={user.attendance[date]}
                                          onChange={(status, justification) =>
                                            handleAttendanceChange(user.id, date, status, justification)
                                          }
                                        />
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="md:hidden space-y-4">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="rounded-card border border-cream-200 bg-white shadow-soft p-4 space-y-4"
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-12 h-12 rounded-full border-2 border-golden-400 object-cover shadow-soft"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <div className="font-semibold text-charcoal-800 truncate">
                                        {user.name}
                                      </div>
                                      <div
                                        className={`text-xs font-medium px-2 py-0.5 rounded-badge inline-block mt-1 ${
                                          user.group === 'Groupe Matin'
                                            ? 'bg-golden-100 text-golden-700'
                                            : 'bg-charcoal-800 text-golden-400'
                                        }`}
                                      >
                                        {user.group === 'Groupe Matin' ? '🌅 Matin' : '🌙 Soir'}
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => confirmDeleteUser(e, user.id)}
                                      className="p-2 text-alert-500 hover:bg-alert-50 rounded-lg transition-colors"
                                      aria-label="Supprimer le membre"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-5 gap-2">
                                {DATE_CONFIG.dates.slice(0, 10).map((date) => (
                                  <AttendanceCell
                                    key={date}
                                    date={date}
                                    record={user.attendance[date]}
                                    onChange={(status, justification) =>
                                      handleAttendanceChange(user.id, date, status, justification)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-cream-100 rounded-full mb-6">
                          <Users size={40} className="text-neutral-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-charcoal-800 mb-2">
                          Aucun membre trouvé
                        </h3>
                        <p className="text-neutral-500 mb-6">
                          Commencez par ajouter des membres à votre équipe ou ajustez vos filtres.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <SoftButton
                            variant="primary"
                            icon={<UserPlus size={20} />}
                            onClick={scrollToForm}
                          >
                            Ajouter un membre
                          </SoftButton>
                          <SoftButton
                            variant="outline"
                            onClick={() => {
                              setFilterGroup('ALL');
                              setFilterStatus('ALL');
                            }}
                          >
                            Réinitialiser les filtres
                          </SoftButton>
                        </div>
                      </div>
                    )}
                  </ModernCard>
                </div>
              </div>
            )}
          </section>
        )}

        {viewMode === 'STATS' && (
          <section className="animate-fade-in">
            {isLoaded ? <StatsView users={users} /> : <SkeletonCard />}
          </section>
        )}

        <footer className="mt-12 pt-8 border-t border-cream-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p className="font-medium">© 2025 Presence Tracker · Fait avec ❤️</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="px-3 py-1 bg-cream-100 rounded-badge font-mono">v3.0.0</span>
              <a href="#" className="hover:text-golden-600 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-golden-600 transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
