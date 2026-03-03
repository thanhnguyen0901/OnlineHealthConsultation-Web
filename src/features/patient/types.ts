import type { Id } from '@/types/common';

export interface Question {
  id: Id;
  patientId: Id;
  doctorId?: Id;
  doctorName?: string;
  question: string;
  answer?: string;
  /** Matches BE QuestionStatus enum (lowercased by the controller). */
  status: 'pending' | 'answered' | 'moderated';
  createdAt: string;
  answeredAt?: string;
}

export interface Appointment {
  id: Id;
  patientId: Id;
  doctorId: Id;
  doctorName: string;
  specialtyId: Id;
  specialtyName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  hasRating?: boolean;
}

export interface ConsultationHistory {
  questions: Question[];
  appointments: Appointment[];
}

export interface PatientProfile {
  id: Id;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  /** Free-text medical history stored in PatientProfile.medicalHistory */
  medicalHistory?: string;
}

export interface Rating {
  id: Id;
  /** Matches BE `Rating.appointmentId` — the appointment this rating belongs to. */
  appointmentId: Id;
  /** Integer 1-5. Matches BE `Rating.score`. */
  score: number;
  comment?: string;
  createdAt: string;
}
