import Dexie, { Table } from 'dexie';
import { User, Backup } from './types';

export class NeoPresenceDB extends Dexie {
  users!: Table<User, string>;
  backups!: Table<Backup, number>;

  constructor() {
    super('NeoPresenceDB');
    (this as any).version(1).stores({
      users: 'id, group, name',
      backups: '++id, timestamp, name'
    });
  }
}

export const db = new NeoPresenceDB();

// Initialize with some dummy data if empty (Optional, for first run)
(db as any).on('populate', () => {
  // We can leave it empty or add the default users here.
  // For this app, we'll let the App.tsx handle empty states or defaults.
});

// --- Backup & Restore Logic ---

export const createSnapshot = async (customName?: string): Promise<void> => {
  try {
    const allUsers = await db.users.toArray();
    const timestamp = Date.now();
    const name = customName || `AUTO-BACKUP-${new Date(timestamp).toLocaleTimeString()}`;
    
    await db.backups.add({
      timestamp,
      name,
      data: allUsers,
      version: '1.0'
    });
    
    // Keep only last 10 backups to save space
    const count = await db.backups.count();
    if (count > 10) {
      const oldest = await db.backups.orderBy('timestamp').first();
      if (oldest && oldest.id) {
        await db.backups.delete(oldest.id);
      }
    }
  } catch (error) {
    console.error("Failed to create snapshot:", error);
  }
};

export const restoreSnapshot = async (backupId: number): Promise<boolean> => {
  try {
    const backup = await db.backups.get(backupId);
    if (!backup) return false;

    await (db as any).transaction('rw', db.users, async () => {
      await db.users.clear();
      await db.users.bulkAdd(backup.data);
    });
    return true;
  } catch (error) {
    console.error("Failed to restore snapshot:", error);
    return false;
  }
};

export const exportToJSON = async () => {
  const allUsers = await db.users.toArray();
  const dataStr = JSON.stringify(allUsers, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `neo-presence-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFromJSON = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json) as User[];
        
        if (!Array.isArray(data)) throw new Error("Format invalide");

        // Create a backup before importing
        await createSnapshot(`PRE-IMPORT-${new Date().toLocaleTimeString()}`);

        await (db as any).transaction('rw', db.users, async () => {
            await db.users.clear();
            await db.users.bulkAdd(data);
        });
        resolve(true);
      } catch (err) {
        console.error(err);
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
};