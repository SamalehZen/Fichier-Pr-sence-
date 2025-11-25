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
      setGroup('Groupe Matin');
    }
  };

  return (
    <NeoCard title="NOUVEAU MEMBRE" className="h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-3 uppercase tracking-wider text-white/80">
            Nom Complet
          </label>
          <input
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            className="w-full glass border border-white/20 rounded-glass p-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary-from/50 focus:border-primary-from/50 transition-all backdrop-blur-glass placeholder-white/40 text-white"
            placeholder="ex: THOMAS ANDERSON"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-3 uppercase tracking-wider text-white/80">
            Groupe
          </label>
          <div className="relative">
            <select
              value={group}
              onChange={event => setGroup(event.target.value as UserGroup)}
              className="w-full glass border border-white/20 rounded-glass p-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary-from/50 focus:border-primary-from/50 transition-all backdrop-blur-glass appearance-none cursor-pointer uppercase text-white"
            >
              <option value="Groupe Matin" className="bg-slate-800 text-white">
                GROUPE MATIN
              </option>
              <option value="Groupe Soir" className="bg-slate-800 text-white">
                GROUPE SOIR
              </option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
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