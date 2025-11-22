
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
  group: UserGroup; // Changed from role
  avatar: string;
  attendance: Record<string, AttendanceRecord>; // Key is date string
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
