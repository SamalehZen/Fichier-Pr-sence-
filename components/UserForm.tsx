import React, { useState } from 'react';
import { NeoButton } from './NeoButton';
import { NeoCard } from './NeoCard';
import { UserPlus, Users } from 'lucide-react';
import { UserGroup } from '../types';

interface UserFormProps {
  onAddUser: (name: string, group: UserGroup) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onAddUser }) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<UserGroup>('Groupe Matin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddUser(name, group);
      setName('');
      setGroup('Groupe Matin'); // Reset to default
    }
  };

  return (
    <NeoCard title="NOUVEAU MEMBRE" className="h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold mb-2 uppercase">Nom Complet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-dark p-3 font-bold focus:outline-none focus:ring-2 focus:ring-neon focus:border-dark transition-all bg-gray-50 placeholder-gray-400"
            placeholder="ex: THOMAS ANDERSON"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 uppercase">Groupe</label>
          <div className="relative">
            <select
                value={group}
                onChange={(e) => setGroup(e.target.value as UserGroup)}
                className="w-full border-2 border-dark p-3 font-bold focus:outline-none focus:ring-2 focus:ring-neon focus:border-dark transition-all bg-gray-50 appearance-none cursor-pointer uppercase"
            >
                <option value="Groupe Matin">GROUPE MATIN</option>
                <option value="Groupe Soir">GROUPE SOIR</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark">
                <Users size={20} />
            </div>
          </div>
        </div>
        <div className="pt-2">
            <NeoButton type="submit" variant="primary" className="w-full" icon={<UserPlus size={18} />}>
            AJOUTER L'UTILISATEUR
            </NeoButton>
        </div>
      </form>
    </NeoCard>
  );
};