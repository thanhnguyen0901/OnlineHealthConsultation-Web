import type { Id } from '@/types/common';

export interface DoctorQuestion {
  id: Id;
  patientId: Id;
  patientName: string;
  question: string;
  createdAt: string;
  status: 'pending' | 'answered';
}

export interface DoctorAppointment {
  id: Id;
  patientId: Id;
  patientName: string;
  specialtyName: string;
  date: string;
  time: string;
  reason?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/** Mirrors ScheduleSlot from BE src/utils/schedule.ts */
export interface Schedule {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** HH:MM 24-hour start time */
  startTime: string;
  /** HH:MM 24-hour end time */
  endTime: string;
  available: boolean;
}
