import { appointments } from './appointments';
import { doctors } from './doctors';
import { hasCredentials, users } from './users';

export const seedData = {
  runSeeded: process.env.E2E_RUN_SEEDED === 'true',
  users,
  doctors,
  appointments,
  hasPatient: () => process.env.E2E_RUN_SEEDED === 'true' && hasCredentials(users.patient),
  hasDoctor: () => process.env.E2E_RUN_SEEDED === 'true' && hasCredentials(users.doctor),
  hasAdmin: () => process.env.E2E_RUN_SEEDED === 'true' && hasCredentials(users.admin),
  hasApprovedDoctor: () => Boolean(doctors.approvedDoctorId),
  hasPendingDoctor: () => Boolean(doctors.pendingDoctorId),
  hasAppointment: () => Boolean(appointments.appointmentId),
  hasConfirmedAppointment: () => Boolean(appointments.confirmedAppointmentId),
  hasCompletedAppointment: () => Boolean(appointments.completedAppointmentId),
  hasConsultationAppointment: () => Boolean(appointments.consultationAppointmentId),
};
