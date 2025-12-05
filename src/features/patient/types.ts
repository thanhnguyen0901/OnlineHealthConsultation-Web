import type { Id } from '@/types/common';

export interface Question {
  id: Id;
  patientId: Id;
  doctorId?: Id;
  question: string;
  answer?: string;
  status: 'pending' | 'answered';
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
  notes?: string;
}

export interface ConsultationHistory {
  questions: Question[];
  appointments: Appointment[];
}

export interface PatientProfile {
  id: Id;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  chronicDiseases?: string;
}

export interface Rating {
  id: Id;
  consultationId: Id;
  rating: number;
  comment?: string;
  createdAt: string;
}
