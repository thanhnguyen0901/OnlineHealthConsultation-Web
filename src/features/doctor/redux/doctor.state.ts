import type { DoctorQuestion, Schedule } from '../types';

export interface DoctorState {
  questions: DoctorQuestion[];
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
}

export const initialDoctorState: DoctorState = {
  questions: [],
  schedules: [],
  loading: false,
  error: null,
};
