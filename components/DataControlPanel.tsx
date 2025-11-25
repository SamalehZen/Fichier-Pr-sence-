import React, { useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createSnapshot, restoreSnapshot, exportToJSON, importFromJSON } from '../db';
import { SoftButton } from './SoftButton';
import { ModernCard } from './ModernCard';
import { Save, Upload, Download, RotateCcw, Database, Trash, Archive } from 'lucide-react';

export const DataControlPanel: React.FC = () => {
  const backups = useLiveQuery(() => db.backups.orderBy('timestamp').reverse().toArray());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importFromJSON(file);
      if (success) alert("Import réussi ! Une sauvegarde automatique a été créée.");
      else alert("Erreur lors de l'import.");
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteBackup = (id?: number) => {
    if (id) db.backups.delete(id);
  };

  const handleRestore = async (id?: number) => {
    if (id && window.confirm('Restaurer cette sauvegarde écrasera les données actuelles. Continuer ?')) {
      await restoreSnapshot(id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ModernCard title="Gestion des données" subtitle="Exporter, importer ou sauvegarder" className="h-full">
        <div className="space-y-6">
          <div className="p-4 rounded-card bg-cream-50 border border-cream-200">
            <div className="flex items-center gap-3 mb-2 text-charcoal-800 font-semibold">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-golden-400 to-golden-600 text-white flex items-center justify-center shadow-soft">
                <Database size={20} />
              </div>
              <span>Base de données locale</span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Vos données sont stockées localement via IndexedDB. Créez des points de restauration ou transférez vos données facilement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SoftButton
              onClick={() => createSnapshot('MANUAL SNAPSHOT')}
              variant="primary"
              size="md"
              icon={<Save size={18} />}
            >
              Créer un snapshot
            </SoftButton>
            <SoftButton onClick={exportToJSON} variant="secondary" size="md" icon={<Download size={18} />}
            >
              Exporter en JSON
            </SoftButton>
            <div className="sm:col-span-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
              <SoftButton
                onClick={handleImportClick}
                variant="outline"
                size="md"
                fullWidth
                icon={<Upload size={18} />}
                className="border-dashed"
              >
                Importer une sauvegarde (.json)
              </SoftButton>
            </div>
          </div>
        </div>
      </ModernCard>

      <ModernCard title="Historique / restauration" subtitle="Dernières sauvegardes" className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto max-h-[400px] pr-1 space-y-3">
          {backups?.length === 0 && (
            <div className="text-center py-12 text-neutral-400 font-medium">
              Aucune sauvegarde disponible
            </div>
          )}
          {backups?.map((backup) => (
            <div
              key={backup.id}
              className="p-4 rounded-card border border-cream-200 bg-white shadow-soft hover:shadow-soft-lg transition-shadow flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-charcoal-700 to-charcoal-900 text-golden-400 flex items-center justify-center shadow-soft">
                  <Archive size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-charcoal-800 truncate">
                    {backup.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(backup.timestamp).toLocaleString()} • {backup.data.length} membres
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleRestore(backup.id)}
                  className="p-2 rounded-lg bg-cream-100 text-charcoal-700 hover:bg-golden-100 hover:text-golden-700 transition-colors"
                  title="Restaurer"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => handleDeleteBackup(backup.id)}
                  className="p-2 rounded-lg bg-alert-50 text-alert-500 hover:bg-alert-500 hover:text-white transition-colors"
                  title="Supprimer"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};
