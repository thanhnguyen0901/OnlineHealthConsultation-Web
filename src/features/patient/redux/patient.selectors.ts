import type { RootState } from '@/types/redux';

export const selectPatient = (state: RootState) => state.patient;
export const selectQuestions = (state: RootState) => state.patient.questions;
export const selectAppointments = (state: RootState) => state.patient.appointments;
export const selectProfile = (state: RootState) => state.patient.profile;
export const selectRatings = (state: RootState) => state.patient.ratings;
export const selectSpecialties = (state: RootState) => state.patient.specialties;
export const selectDoctors = (state: RootState) => state.patient.doctors;
export const selectPatientLoading = (state: RootState) => state.patient.loading;
export const selectPatientError = (state: RootState) => state.patient.error;
