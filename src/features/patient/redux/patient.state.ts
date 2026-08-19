import type { Question, Appointment, PatientProfile, Rating, DoctorAvailability } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';

export interface PatientState {
  questions: Question[];
  appointments: Appointment[];
  profile: PatientProfile | null;
  ratings: Rating[];
  specialties: Specialty[];
  doctors: Doctor[];
  availability: DoctorAvailability | null;
  availabilityLoading: boolean;
  availabilityError: string | null;
  loading: boolean;
  error: string | null;
  questionSubmitted: boolean;
  appointmentSubmitted: boolean;
  profileUpdated: boolean;
}

export const initialPatientState: PatientState = {
  questions: [],
  appointments: [],
  profile: null,
  ratings: [],
  specialties: [],
  doctors: [],
  availability: null,
  availabilityLoading: false,
  availabilityError: null,
  loading: false,
  error: null,
  questionSubmitted: false,
  appointmentSubmitted: false,
  profileUpdated: false,
};
