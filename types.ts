
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'PENDING';

export type UserGroup = 'Groupe Matin' | 'Groupe Soir';

export interface AttendanceRecord {
  date: string; // ISO Date string YYYY-MM-DD
  status: AttendanceStatus;
  justification?: string;
}

export interface User {
  id: string;
  name: string;
  group: UserGroup;
  avatar: string;
  attendance: Record<string, AttendanceRecord>; // Key is date string
}

export interface Backup {
  id?: number;
  timestamp: number;
  name: string;
  data: User[];
  version: string;
}

export interface DateRange {
  start: Date;
  end: Date;
  dates: string[]; // Array of ISO strings
}

export const JUSTIFICATIONS = [
  "Maladie",
  "Retard",
  "Autres"
];