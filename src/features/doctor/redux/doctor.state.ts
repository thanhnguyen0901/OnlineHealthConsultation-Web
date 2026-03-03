import type { DoctorQuestion, DoctorAppointment, Schedule } from '../types';

export interface DoctorState {
  questions: DoctorQuestion[];
  appointments: DoctorAppointment[];
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  /** Set true by answerQuestionSucceeded; cleared by clearAnswerSubmitted. */
  answerSubmitted: boolean;
}

export const initialDoctorState: DoctorState = {
  questions: [],
  appointments: [],
  schedules: [],
  loading: false,
  error: null,
  answerSubmitted: false,
};
