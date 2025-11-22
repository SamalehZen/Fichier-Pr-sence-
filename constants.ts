
import { DateRange, User } from './types';

export const generateDateRange = (): DateRange => {
  const start = new Date('2025-11-22');
  const end = new Date('2025-12-06');
  const dates: string[] = [];

  let current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return { start, end, dates };
};

export const DATE_CONFIG = generateDateRange();

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date);
};

export const formatDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
};

export const DEFAULT_USERS: User[] = [
  // Groupe Matin
  {
    id: 'default-m-1',
    name: 'AHMED YOUSSOUF AHMED',
    group: 'Groupe Matin',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Ahmed', // Garçon
    attendance: {}
  },
  {
    id: 'default-m-2',
    name: 'HALIMA SOULEIMAN',
    group: 'Groupe Matin',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Halima', // Fille
    attendance: {}
  },
  {
    id: 'default-m-3',
    name: 'ABOU ABDALLAH',
    group: 'Groupe Matin',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Abou', // Garçon
    attendance: {}
  },
  // Groupe Soir
  {
    id: 'default-s-1',
    name: 'ALI SAID',
    group: 'Groupe Soir',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Ali', // Garçon
    attendance: {}
  },
  {
    id: 'default-s-2',
    name: 'FARAH ALALEH',
    group: 'Groupe Soir',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Farah', // Garçon
    attendance: {}
  },
  {
    id: 'default-s-3',
    name: 'KINAY YASSER ALI',
    group: 'Groupe Soir',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Kinay', // Fille
    attendance: {}
  }
];
