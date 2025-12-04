import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialPatientState } from './patient.state';
import type { Question, Appointment } from '../types';

const patientSlice = createSlice({
  name: 'patient',
  initialState: initialPatientState,
  reducers: {
    askQuestionRequested: (state, _action: PayloadAction<{ question: string; specialtyId?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    askQuestionSucceeded: (state, action: PayloadAction<Question>) => {
      state.loading = false;
      state.questions.unshift(action.payload);
    },
    askQuestionFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    bookAppointmentRequested: (state, _action: PayloadAction<{ doctorId: string; date: string; time: string; notes?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    bookAppointmentSucceeded: (state, action: PayloadAction<Appointment>) => {
      state.loading = false;
      state.appointments.unshift(action.payload);
    },
    bookAppointmentFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadHistoryRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadHistorySucceeded: (state, action: PayloadAction<{ questions: Question[]; appointments: Appointment[] }>) => {
      state.loading = false;
      state.questions = action.payload.questions;
      state.appointments = action.payload.appointments;
    },
    loadHistoryFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  askQuestionRequested,
  askQuestionSucceeded,
  askQuestionFailed,
  bookAppointmentRequested,
  bookAppointmentSucceeded,
  bookAppointmentFailed,
  loadHistoryRequested,
  loadHistorySucceeded,
  loadHistoryFailed,
} = patientSlice.actions;

export default patientSlice.reducer;
