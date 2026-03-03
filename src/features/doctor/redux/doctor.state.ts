import type { DoctorQuestion, DoctorAppointment, DoctorProfile, DoctorRating, RatingsPagination, Schedule } from '../types';

export interface DoctorState {
  profile: DoctorProfile | null;
  questions: DoctorQuestion[];
  appointments: DoctorAppointment[];
  schedules: Schedule[];
  ratings: DoctorRating[];
  ratingsPagination: RatingsPagination | null;
  loading: boolean;
  error: string | null;
  /** Set true by answerQuestionSucceeded; cleared by clearAnswerSubmitted. */
  answerSubmitted: boolean;
  /** Set true by updateScheduleSucceeded; cleared by clearScheduleUpdated. */
  scheduleUpdated: boolean;
  /** Set true by rescheduleAppointmentSucceeded; cleared by clearRescheduleSubmitted. */
  rescheduleSubmitted: boolean;
}

export const initialDoctorState: DoctorState = {
  profile: null,
  questions: [],
  appointments: [],
  schedules: [],
  ratings: [],
  ratingsPagination: null,
  loading: false,
  error: null,
  answerSubmitted: false,
  scheduleUpdated: false,
  rescheduleSubmitted: false,
};
