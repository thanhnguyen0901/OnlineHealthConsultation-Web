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
};
