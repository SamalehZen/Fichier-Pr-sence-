import React, { useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createSnapshot, restoreSnapshot, exportToJSON, importFromJSON } from '../db';
import { NeoButton } from './NeoButton';
import { NeoCard } from './NeoCard';
import { Save, Upload, Download, RotateCcw, Database, Trash, FileJson, Archive } from 'lucide-react';

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
    if (id && window.confirm("Restaurer cette sauvegarde écrasera les données actuelles. Continuer ?")) {
      await restoreSnapshot(id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Actions Rapides */}
      <NeoCard title="SYSTÈME DE DONNÉES" className="h-full">
        <div className="space-y-6">
            <div className="p-4 bg-gray-100 border-2 border-dark">
                <div className="flex items-center gap-3 mb-2 font-bold text-dark uppercase">
                    <Database size={20} />
                    Base de données Locale
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Vos données sont stockées en local via IndexedDB. 
                    Utilisez les options ci-dessous pour exporter, importer ou créer des points de restauration manuels.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NeoButton onClick={() => createSnapshot('MANUAL SNAPSHOT')} variant="primary" icon={<Save size={18} />}>
                    CRÉER SNAPSHOT
                </NeoButton>
                <NeoButton onClick={exportToJSON} variant="secondary" icon={<Download size={18} />}>
                    EXPORTER JSON
                </NeoButton>
                <div className="sm:col-span-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".json" 
                        className="hidden" 
                    />
                    <NeoButton onClick={handleImportClick} variant="secondary" className="w-full border-dashed" icon={<Upload size={18} />}>
                        IMPORTER SAUVEGARDE (.JSON)
                    </NeoButton>
                </div>
            </div>
        </div>
      </NeoCard>

      {/* Historique des Backups */}
      <NeoCard title="HISTORIQUE / RESTAURATION" className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
            {backups?.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest">
                    Aucune sauvegarde
                </div>
            )}
            {backups?.map((backup) => (
                <div key={backup.id} className="bg-white border-2 border-dark p-3 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark text-white flex items-center justify-center border border-dark">
                            <Archive size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-dark">{backup.name}</div>
                            <div className="text-[10px] font-mono text-gray-500">
                                {new Date(backup.timestamp).toLocaleString()} • {backup.data.length} Membres
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleRestore(backup.id)}
                            className="p-2 hover:bg-neon hover:text-dark border-2 border-transparent hover:border-dark transition-all"
                            title="Restaurer"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button 
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="p-2 hover:bg-alert hover:text-white border-2 border-transparent hover:border-dark transition-all"
                            title="Supprimer"
                        >
                            <Trash size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </NeoCard>
    </div>
  );
};