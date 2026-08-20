import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialDoctorState } from './doctor.state';
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

export type UpdateProfilePayload = {
  bio?: string;
  qualificationSummary?: string;
  consultationDescription?: string;
  yearsOfExperience?: number;
  specialtyId?: string;
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState: initialDoctorState,
  reducers: {
    loadProfileRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadProfileSucceeded: (state, action: PayloadAction<DoctorProfile>) => {
      state.loading = false;
      state.profile = action.payload;
    },
    loadProfileFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadQuestionsRequested: (state) => {
      state.loading = true;
    },
    loadQuestionsSucceeded: (state, action: PayloadAction<DoctorQuestion[]>) => {
      state.loading = false;
      state.questions = action.payload;
    },
    loadQuestionsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    answerQuestionRequested: (
      state,
      _action: PayloadAction<{ questionId: string; answer: string }>
    ) => {
      state.loading = true;
      state.answerSubmitted = false;
    },
    answerQuestionSucceeded: (state, action: PayloadAction<{ questionId: string }>) => {
      state.loading = false;
      state.answerSubmitted = true;
      // Optimistic update; server resync follows via loadQuestionsRequested.
      const idx = state.questions.findIndex((q) => q.id === action.payload.questionId);
      if (idx !== -1) {
        state.questions[idx] = { ...state.questions[idx], status: 'answered' };
      }
    },
    answerQuestionFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.answerSubmitted = false;
    },
    clearAnswerSubmitted: (state) => {
      state.answerSubmitted = false;
    },
    loadDoctorAppointmentsRequested: (
      state,
      _action: PayloadAction<{ status?: string } | undefined>
    ) => {
      state.loading = true;
      state.error = null;
    },
    loadDoctorAppointmentsSucceeded: (state, action: PayloadAction<DoctorAppointment[]>) => {
      state.loading = false;
      state.appointments = action.payload;
    },
    loadDoctorAppointmentsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadDoctorPatientsRequested: (
      state,
      _action: PayloadAction<{ page?: number; limit?: number; search?: string } | undefined>
    ) => {
      state.loading = true;
      state.error = null;
    },
    loadDoctorPatientsSucceeded: (
      state,
      action: PayloadAction<{
        patients: DoctorPatient[];
        pagination: DoctorPatientsPagination | null;
      }>
    ) => {
      state.loading = false;
      state.patients = action.payload.patients;
      state.patientsPagination = action.payload.pagination;
    },
    loadDoctorPatientsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDoctorAppointmentRequested: (
      state,
      _action: PayloadAction<{ id: string; status: string; notes?: string }>
    ) => {
      state.loading = true;
      state.appointmentUpdated = false;
    },
    updateDoctorAppointmentSucceeded: (state, action: PayloadAction<DoctorAppointment>) => {
      state.loading = false;
      const idx = state.appointments.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.appointments[idx] = action.payload;
      }
      state.appointmentUpdated = true;
    },
    updateDoctorAppointmentFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.appointmentUpdated = false;
    },
    clearAppointmentUpdated: (state) => {
      state.appointmentUpdated = false;
    },
    loadScheduleRequested: (state) => {
      state.loading = true;
    },
    loadScheduleSucceeded: (state, action: PayloadAction<Schedule[]>) => {
      state.loading = false;
      state.schedules = action.payload;
    },
    loadScheduleFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadRatingsRequested: (
      state,
      _action: PayloadAction<{ page?: number; limit?: number } | undefined>
    ) => {
      state.loading = true;
      state.error = null;
    },
    loadRatingsSucceeded: (
      state,
      action: PayloadAction<{ ratings: DoctorRating[]; pagination: RatingsPagination | null }>
    ) => {
      state.loading = false;
      state.ratings = action.payload.ratings;
      state.ratingsPagination = action.payload.pagination;
    },
    loadRatingsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileRequested: (state, _action: PayloadAction<UpdateProfilePayload>) => {
      state.loading = true;
      state.error = null;
      state.profileUpdated = false;
    },
    updateProfileSucceeded: (state, action: PayloadAction<Partial<DoctorProfile>>) => {
      state.loading = false;
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      } else {
        state.profile = action.payload as DoctorProfile;
      }
      state.profileUpdated = true;
    },
    updateProfileFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.profileUpdated = false;
    },
    clearProfileUpdated: (state) => {
      state.profileUpdated = false;
    },
    updateScheduleRequested: (state, _action: PayloadAction<Schedule[]>) => {
      state.loading = true;
      state.error = null;
      state.scheduleUpdated = false;
    },
    updateScheduleSucceeded: (state, action: PayloadAction<Schedule[]>) => {
      state.loading = false;
      state.schedules = action.payload;
      state.scheduleUpdated = true;
    },
    updateScheduleFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearScheduleUpdated: (state) => {
      state.scheduleUpdated = false;
    },
    rescheduleAppointmentRequested: (
      state,
      _action: PayloadAction<{ id: string; scheduledAt: string }>
    ) => {
      state.loading = true;
      state.error = null;
      state.rescheduleSubmitted = false;
    },
    rescheduleAppointmentSucceeded: (state, action: PayloadAction<DoctorAppointment>) => {
      state.loading = false;
      state.rescheduleSubmitted = true;
      const idx = state.appointments.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.appointments[idx] = action.payload;
      }
    },
    rescheduleAppointmentFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearRescheduleSubmitted: (state) => {
      state.rescheduleSubmitted = false;
    },
  },
});

export const {
  loadProfileRequested,
  loadProfileSucceeded,
  loadProfileFailed,
  loadQuestionsRequested,
  loadQuestionsSucceeded,
  loadQuestionsFailed,
  answerQuestionRequested,
  answerQuestionSucceeded,
  answerQuestionFailed,
  clearAnswerSubmitted,
  loadDoctorAppointmentsRequested,
  loadDoctorAppointmentsSucceeded,
  loadDoctorAppointmentsFailed,
  loadDoctorPatientsRequested,
  loadDoctorPatientsSucceeded,
  loadDoctorPatientsFailed,
  updateDoctorAppointmentRequested,
  updateDoctorAppointmentSucceeded,
  updateDoctorAppointmentFailed,
  clearAppointmentUpdated,
  loadScheduleRequested,
  loadScheduleSucceeded,
  loadScheduleFailed,
  loadRatingsRequested,
  loadRatingsSucceeded,
  loadRatingsFailed,
  updateProfileRequested,
  updateProfileSucceeded,
  updateProfileFailed,
  clearProfileUpdated,
  updateScheduleRequested,
  updateScheduleSucceeded,
  updateScheduleFailed,
  clearScheduleUpdated,
  rescheduleAppointmentRequested,
  rescheduleAppointmentSucceeded,
  rescheduleAppointmentFailed,
  clearRescheduleSubmitted,
} = doctorSlice.actions;

export default doctorSlice.reducer;
