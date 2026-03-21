import type {
  DoctorQuestion,
  DoctorAppointment,
  DoctorPatient,
  DoctorProfile,
  DoctorRating,
  DoctorPatientsPagination,
  RatingsPagination,
  Schedule,
} from '../types';

export interface DoctorState {
  profile: DoctorProfile | null;
  questions: DoctorQuestion[];
  appointments: DoctorAppointment[];
  patients: DoctorPatient[];
  patientsPagination: DoctorPatientsPagination | null;
  schedules: Schedule[];
  ratings: DoctorRating[];
  ratingsPagination: RatingsPagination | null;
  loading: boolean;
  error: string | null;
  answerSubmitted: boolean;
  scheduleUpdated: boolean;
  rescheduleSubmitted: boolean;
  profileUpdated: boolean;
  appointmentUpdated: boolean;
}

export const initialDoctorState: DoctorState = {
  profile: null,
  questions: [],
  appointments: [],
  patients: [],
  patientsPagination: null,
  schedules: [],
  ratings: [],
  ratingsPagination: null,
  loading: false,
  error: null,
  answerSubmitted: false,
  scheduleUpdated: false,
  rescheduleSubmitted: false,
  profileUpdated: false,
  appointmentUpdated: false,
};
