import type { Question, Appointment } from '../types';

export interface PatientState {
  questions: Question[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

export const initialPatientState: PatientState = {
  questions: [],
  appointments: [],
  loading: false,
  error: null,
};
