import React, { useState } from 'react';
import { SoftButton } from './SoftButton';
import { ModernCard } from './ModernCard';
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
      onAddUser(name.trim(), group);
      setName('');
      setGroup('Groupe Matin');
    }
  };

  return (
    <ModernCard title="Nouveau membre" subtitle="Ajouter un participant" className="h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Nom complet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-cream-200 rounded-input p-3 bg-white text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-golden-400 focus:border-golden-500 transition-all duration-200 hover:border-golden-300 placeholder-neutral-400"
            placeholder="ex: Thomas Anderson"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Groupe
          </label>
          <div className="relative">
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value as UserGroup)}
              className="w-full border border-cream-200 rounded-input p-3 bg-white text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-golden-400 focus:border-golden-500 transition-all duration-200 hover:border-golden-300 cursor-pointer appearance-none"
            >
              <option value="Groupe Matin">Groupe Matin</option>
              <option value="Groupe Soir">Groupe Soir</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-golden-500">
              <Users size={20} />
            </div>
          </div>
        </div>

        <SoftButton type="submit" variant="primary" size="md" fullWidth icon={<UserPlus size={20} />}>
          Ajouter le membre
        </SoftButton>
      </form>
    </ModernCard>
  );
};
