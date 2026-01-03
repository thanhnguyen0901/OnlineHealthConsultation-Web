import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialPatientState } from './patient.state';
import type { Question, Appointment, PatientProfile, Rating } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';

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
    loadProfileRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadProfileSucceeded: (state, action: PayloadAction<PatientProfile>) => {
      state.loading = false;
      state.profile = action.payload;
    },
    loadProfileFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileRequested: (state, _action: PayloadAction<Partial<PatientProfile>>) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSucceeded: (state, action: PayloadAction<PatientProfile>) => {
      state.loading = false;
      state.profile = action.payload;
    },
    updateProfileFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    rateConsultationRequested: (state, _action: PayloadAction<{ consultationId: string; doctorId: string; rating: number; comment?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    rateConsultationSucceeded: (state, action: PayloadAction<Rating>) => {
      state.loading = false;
      state.ratings.unshift(action.payload);
    },
    rateConsultationFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadSpecialtiesRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadSpecialtiesSucceeded: (state, action: PayloadAction<Specialty[]>) => {
      state.loading = false;
      state.specialties = action.payload;
    },
    loadSpecialtiesFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadDoctorsBySpecialtyRequested: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    loadDoctorsBySpecialtySucceeded: (state, action: PayloadAction<Doctor[]>) => {
      state.loading = false;
      state.doctors = action.payload;
    },
    loadDoctorsBySpecialtyFailed: (state, action: PayloadAction<string>) => {
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
  loadProfileRequested,
  loadProfileSucceeded,
  loadProfileFailed,
  updateProfileRequested,
  updateProfileSucceeded,
  updateProfileFailed,
  rateConsultationRequested,
  rateConsultationSucceeded,
  rateConsultationFailed,
  loadSpecialtiesRequested,
  loadSpecialtiesSucceeded,
  loadSpecialtiesFailed,
  loadDoctorsBySpecialtyRequested,
  loadDoctorsBySpecialtySucceeded,
  loadDoctorsBySpecialtyFailed,
} = patientSlice.actions;

export default patientSlice.reducer;
