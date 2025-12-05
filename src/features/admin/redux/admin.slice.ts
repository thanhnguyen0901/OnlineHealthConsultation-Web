import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialAdminState } from './admin.state';
import type { User, Id } from '@/types/common';
import type { Doctor, Specialty, AdminStats } from '../types';

const adminSlice = createSlice({
  name: 'admin',
  initialState: initialAdminState,
  reducers: {
    loadStatsRequested: (state) => {
      state.loading = true;
    },
    loadStatsSucceeded: (state, action: PayloadAction<AdminStats>) => {
      state.loading = false;
      state.stats = action.payload;
    },
    loadStatsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadUsersRequested: (state) => {
      state.loading = true;
    },
    loadUsersSucceeded: (state, action: PayloadAction<User[]>) => {
      state.loading = false;
      state.users = action.payload;
    },
    loadUsersFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadDoctorsRequested: (state) => {
      state.loading = true;
    },
    loadDoctorsSucceeded: (state, action: PayloadAction<Doctor[]>) => {
      state.loading = false;
      state.doctors = action.payload;
    },
    loadDoctorsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadSpecialtiesRequested: (state) => {
      state.loading = true;
    },
    loadSpecialtiesSucceeded: (state, action: PayloadAction<Specialty[]>) => {
      state.loading = false;
      state.specialties = action.payload;
    },
    loadSpecialtiesFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // User CRUD
    createUserRequested: (state, _action: PayloadAction<Partial<User> & { password: string }>) => {
      state.loading = true;
    },
    createUserSucceeded: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.users.push(action.payload);
    },
    createUserFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserRequested: (state, _action: PayloadAction<{ id: string; data: Partial<User> }>) => {
      state.loading = true;
    },
    updateUserSucceeded: (state, action: PayloadAction<User>) => {
      state.loading = false;
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) state.users[index] = action.payload;
    },
    updateUserFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserRequested: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    deleteUserSucceeded: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    deleteUserFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Doctor CRUD
    createDoctorRequested: (state, _action: PayloadAction<Partial<Doctor> & { password: string }>) => {
      state.loading = true;
    },
    createDoctorSucceeded: (state, action: PayloadAction<Doctor>) => {
      state.loading = false;
      state.doctors.push(action.payload);
    },
    createDoctorFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDoctorRequested: (state, _action: PayloadAction<{ id: string; data: Partial<Doctor> }>) => {
      state.loading = true;
    },
    updateDoctorSucceeded: (state, action: PayloadAction<Doctor>) => {
      state.loading = false;
      const index = state.doctors.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) state.doctors[index] = action.payload;
    },
    updateDoctorFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDoctorRequested: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    deleteDoctorSucceeded: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.doctors = state.doctors.filter((d) => d.id !== action.payload);
    },
    deleteDoctorFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Specialty CRUD
    createSpecialtyRequested: (state, _action: PayloadAction<Partial<Specialty>>) => {
      state.loading = true;
    },
    createSpecialtySucceeded: (state, action: PayloadAction<Specialty>) => {
      state.loading = false;
      state.specialties.push(action.payload);
    },
    createSpecialtyFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSpecialtyRequested: (state, _action: PayloadAction<{ id: string; data: Partial<Specialty> }>) => {
      state.loading = true;
    },
    updateSpecialtySucceeded: (state, action: PayloadAction<Specialty>) => {
      state.loading = false;
      const index = state.specialties.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.specialties[index] = action.payload;
    },
    updateSpecialtyFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteSpecialtyRequested: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    deleteSpecialtySucceeded: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.specialties = state.specialties.filter((s) => s.id !== action.payload);
    },
    deleteSpecialtyFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Appointments
    loadAppointmentsRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadAppointmentsSucceeded: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.appointments = action.payload;
    },
    loadAppointmentsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateAppointmentStatusRequested: (state, _action: PayloadAction<{ id: Id; status: string }>) => {
      state.loading = true;
      state.error = null;
    },
    updateAppointmentStatusSucceeded: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const index = state.appointments.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    updateAppointmentStatusFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Moderation
    loadModerationItemsRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadModerationItemsSucceeded: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.moderationItems = action.payload;
    },
    loadModerationItemsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    approveModerationRequested: (state, _action: PayloadAction<Id>) => {
      state.loading = true;
      state.error = null;
    },
    approveModerationSucceeded: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const index = state.moderationItems.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.moderationItems[index] = action.payload;
      }
    },
    approveModerationFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    rejectModerationRequested: (state, _action: PayloadAction<Id>) => {
      state.loading = true;
      state.error = null;
    },
    rejectModerationSucceeded: (state, action: PayloadAction<any>) => {
      state.loading = false;
      const index = state.moderationItems.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.moderationItems[index] = action.payload;
      }
    },
    rejectModerationFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loadStatsRequested,
  loadStatsSucceeded,
  loadStatsFailed,
  loadUsersRequested,
  loadUsersSucceeded,
  loadUsersFailed,
  loadDoctorsRequested,
  loadDoctorsSucceeded,
  loadDoctorsFailed,
  loadSpecialtiesRequested,
  loadSpecialtiesSucceeded,
  loadSpecialtiesFailed,
  createUserRequested,
  createUserSucceeded,
  createUserFailed,
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  deleteUserRequested,
  deleteUserSucceeded,
  deleteUserFailed,
  createDoctorRequested,
  createDoctorSucceeded,
  createDoctorFailed,
  updateDoctorRequested,
  updateDoctorSucceeded,
  updateDoctorFailed,
  deleteDoctorRequested,
  deleteDoctorSucceeded,
  deleteDoctorFailed,
  createSpecialtyRequested,
  createSpecialtySucceeded,
  createSpecialtyFailed,
  updateSpecialtyRequested,
  updateSpecialtySucceeded,
  updateSpecialtyFailed,
  deleteSpecialtyRequested,
  deleteSpecialtySucceeded,
  deleteSpecialtyFailed,
  loadAppointmentsRequested,
  loadAppointmentsSucceeded,
  loadAppointmentsFailed,
  updateAppointmentStatusRequested,
  updateAppointmentStatusSucceeded,
  updateAppointmentStatusFailed,
  loadModerationItemsRequested,
  loadModerationItemsSucceeded,
  loadModerationItemsFailed,
  approveModerationRequested,
  approveModerationSucceeded,
  approveModerationFailed,
  rejectModerationRequested,
  rejectModerationSucceeded,
  rejectModerationFailed,
} = adminSlice.actions;

export default adminSlice.reducer;
