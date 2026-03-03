import type { RootState } from '@/types/redux';

export const selectDoctor = (state: RootState) => state.doctor;
export const selectDoctorProfile = (state: RootState) => state.doctor.profile;
export const selectQuestions = (state: RootState) => state.doctor.questions;
export const selectDoctorQuestions = (state: RootState) => state.doctor.questions;
export const selectSchedules = (state: RootState) => state.doctor.schedules;
export const selectDoctorSchedules = (state: RootState) => state.doctor.schedules;
export const selectDoctorLoading = (state: RootState) => state.doctor.loading;
export const selectDoctorError   = (state: RootState) => state.doctor.error;
export const selectDoctorAppointments = (state: RootState) => state.doctor.appointments;
export const selectAnswerSubmitted = (state: RootState) => state.doctor.answerSubmitted;
export const selectScheduleUpdated = (state: RootState) => state.doctor.scheduleUpdated;
export const selectDoctorRatings = (state: RootState) => state.doctor.ratings;
export const selectDoctorRatingsPagination = (state: RootState) => state.doctor.ratingsPagination;
export const selectRescheduleSubmitted = (state: RootState) => state.doctor.rescheduleSubmitted;
