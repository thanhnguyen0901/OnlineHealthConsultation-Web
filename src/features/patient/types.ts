import type { Id } from '@/types/common';

export interface Question {
  id: Id;
  patientId: Id;
  doctorId?: Id;
  doctorName?: string;
  title?: string;
  question: string;
  answer?: string;
  answers?: { id: Id; content: string; createdAt?: string }[];
  // Lowercased by BE controller; matches QuestionStatus enum values.
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

export interface AppointmentAvailabilitySlot {
  start: string;
  end: string;
  label: string;
  available: boolean;
}

export interface DoctorAvailability {
  doctorId: Id;
  date: string;
  timezone: string;
  durationMinutes: number;
  slotStepMinutes: number;
  slots: AppointmentAvailabilitySlot[];
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
  medicalHistory?: string;
}

export interface Rating {
  id: Id;
  appointmentId: Id;
  // Integer 1–5.
  score: number;
  comment?: string;
  createdAt: string;
}
