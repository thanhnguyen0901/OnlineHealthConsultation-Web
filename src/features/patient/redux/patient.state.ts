import type { Question, Appointment, PatientProfile, Rating } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';

export interface PatientState {
  questions: Question[];
  appointments: Appointment[];
  profile: PatientProfile | null;
  ratings: Rating[];
  specialties: Specialty[];
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  /** Set to true by askQuestionSucceeded; cleared by clearQuestionSubmitted. */
  questionSubmitted: boolean;
  /** Set to true by bookAppointmentSucceeded; cleared by clearAppointmentSubmitted. */
  appointmentSubmitted: boolean;
}

export const initialPatientState: PatientState = {
  questions: [],
  appointments: [],
  profile: null,
  ratings: [],
  specialties: [],
  doctors: [],
  loading: false,
  error: null,
  questionSubmitted: false,
  appointmentSubmitted: false,
};
