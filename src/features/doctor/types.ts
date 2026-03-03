import type { Id } from '@/types/common';

export interface DoctorStats {
  questionCount: number;
  appointmentCount: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface DoctorProfile {
  id: Id;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string | null;
  yearsOfExperience?: number | null;
  specialtyId?: string | null;
  specialty?: { id: Id; nameEn: string; nameVi: string } | null;
  ratingAverage: number;
  ratingCount: number;
  stats: DoctorStats;
}

export interface DoctorQuestion {
  id: Id;
  patientId: Id;
  patientName: string;
  question: string;
  createdAt: string;
  status: 'pending' | 'answered' | 'moderated';
  /** Doctor's answer content, present when status is 'answered' or 'moderated'. */
  answer?: string | null;
  /** Patient's medical history, shown in the answer dialog to help the doctor. */
  patientMedicalHistory?: string | null;
}

export interface DoctorAppointment {
  id: Id;
  patientId: Id;
  patientName: string;
  specialtyName?: string;
  /** ISO date-time string from the server (replaces separate date/time fields) */
  scheduledAt: string;
  reason?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface DoctorRating {
  id: Id;
  score: number;
  comment?: string | null;
  status: string;
  createdAt: string;
  patientId?: string | null;
  appointmentId?: string | null;
  patient?: { user?: { firstName?: string; lastName?: string } } | null;
  appointment?: { id: string; scheduledAt?: string | null } | null;
}

export interface RatingsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
