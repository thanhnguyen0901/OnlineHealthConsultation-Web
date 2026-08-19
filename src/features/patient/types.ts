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
  durationMinutes?: number;
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

export interface ConsultationParticipant {
  id: Id;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
}

export interface ConsultationMessage {
  id?: Id;
  consultationSessionId?: Id;
  senderUserId?: Id;
  content: string;
  messageType?: string;
  createdAt?: string;
  sender?: ConsultationParticipant;
}

export interface ConsultationJoinResult {
  appointmentId: Id;
  sessionId: Id;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | string;
  channel: 'CHAT' | 'VIDEO' | string;
  message?: string;
}

export interface ConsultationResult {
  appointment: {
    id: Id;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
    reason?: string;
    notes?: string | null;
    patient?: { user?: ConsultationParticipant };
    doctor?: { user?: ConsultationParticipant };
  };
  consultation: {
    id: Id;
    status: string;
    startedAt?: string | null;
    endedAt?: string | null;
    summary?: string | null;
    channel?: string | null;
  } | null;
  prescription: {
    notes?: string | null;
    items?: {
      id?: Id;
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string;
      notes?: string | null;
    }[];
  } | null;
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
