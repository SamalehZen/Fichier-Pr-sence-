import { DateRange } from './types';

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