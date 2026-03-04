import type { RootState } from '@/types/redux';

export const selectAdmin = (state: RootState) => state.admin;
export const selectAdminStats = (state: RootState) => state.admin.stats;
export const selectAdminUsers = (state: RootState) => state.admin.users;
export const selectAdminPatients = (state: RootState) => state.admin.patients;
export const selectAdminDoctors = (state: RootState) => state.admin.doctors;
export const selectAdminSpecialties = (state: RootState) => state.admin.specialties;
export const selectAdminAppointments = (state: RootState) => state.admin.appointments;
export const selectAdminModerationItems = (state: RootState) => state.admin.moderationItems;
export const selectAdminLoading = (state: RootState) => state.admin.loading;
export const selectAdminError   = (state: RootState) => state.admin.error;
export const selectAdminUsersPagination        = (state: RootState) => state.admin.usersPagination;
export const selectAdminPatientsPagination     = (state: RootState) => state.admin.patientsPagination;
export const selectAdminDoctorsPagination      = (state: RootState) => state.admin.doctorsPagination;
export const selectAdminAppointmentsPagination = (state: RootState) => state.admin.appointmentsPagination;
