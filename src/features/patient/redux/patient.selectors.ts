import type { RootState } from '@/types/redux';

export const selectPatient = (state: RootState) => state.patient;
export const selectQuestions = (state: RootState) => state.patient.questions;
export const selectAppointments = (state: RootState) => state.patient.appointments;
export const selectPatientLoading = (state: RootState) => state.patient.loading;
export const selectPatientError = (state: RootState) => state.patient.error;
