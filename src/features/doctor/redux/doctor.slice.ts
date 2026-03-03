import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialDoctorState } from './doctor.state';
import type { DoctorQuestion, DoctorAppointment, Schedule } from '../types';

const doctorSlice = createSlice({
  name: 'doctor',
  initialState: initialDoctorState,
  reducers: {
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
      // Optimistically mark as answered (server resync via loadQuestionsRequested follows).
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
    // Doctor appointments
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
    updateDoctorAppointmentRequested: (
      state,
      _action: PayloadAction<{ id: string; status: string; notes?: string }>
    ) => {
      state.loading = true;
    },
    updateDoctorAppointmentSucceeded: (
      state,
      action: PayloadAction<DoctorAppointment>
    ) => {
      state.loading = false;
      const idx = state.appointments.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.appointments[idx] = action.payload;
      }
    },
    updateDoctorAppointmentFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
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
  },
});

export const {
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
  updateDoctorAppointmentRequested,
  updateDoctorAppointmentSucceeded,
  updateDoctorAppointmentFailed,
  loadScheduleRequested,
  loadScheduleSucceeded,
  loadScheduleFailed,
} = doctorSlice.actions;

export default doctorSlice.reducer;
