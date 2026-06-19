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
  answer?: string | null;
  patientMedicalHistory?: string | null;
}

export interface DoctorPatient {
  id: Id;
  profileId: Id;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface DoctorAppointment {
  id: Id;
  patientId: Id;
  patientName: string;
  specialtyName?: string;
  specialtyNameVi?: string;
  // ISO date-time string (replaces separate date/time fields).
  scheduledAt: string;
  reason?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
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

export interface DoctorPatientsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Schedule {
  // YYYY-MM-DD
  date: string;
  // HH:MM 24-hour
  startTime: string;
  // HH:MM 24-hour
  endTime: string;
  available: boolean;
}
