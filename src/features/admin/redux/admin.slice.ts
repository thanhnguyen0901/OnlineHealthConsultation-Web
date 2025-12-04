import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialAdminState } from './admin.state';
import type { User } from '@/types/common';
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
} = adminSlice.actions;

export default adminSlice.reducer;
