const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

export const appointments = {
  appointmentId: process.env.E2E_APPOINTMENT_ID || '',
  confirmedAppointmentId: process.env.E2E_CONFIRMED_APPOINTMENT_ID || '',
  completedAppointmentId: process.env.E2E_COMPLETED_APPOINTMENT_ID || '',
  consultationAppointmentId: process.env.E2E_CONSULTATION_APPOINTMENT_ID || '',
  cancellableAppointmentId: process.env.E2E_CANCELLABLE_APPOINTMENT_ID || '',
  scheduledDate: process.env.E2E_APPOINTMENT_DATE || tomorrow.toISOString().slice(0, 10),
  scheduledTime: process.env.E2E_APPOINTMENT_TIME || '09:00',
  reason: process.env.E2E_APPOINTMENT_REASON || 'Automated E2E consultation booking',
};
