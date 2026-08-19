export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SPECIALTIES: '/specialties',
  DOCTORS: '/doctors',
  DOCTOR_DETAIL: '/doctors/:doctorId',

  // Patient routes
  PATIENT_DASHBOARD: '/patient',
  ASK_QUESTION: '/patient/ask-question',
  BOOK_APPOINTMENT: '/patient/book-appointment',
  CONSULTATION_HISTORY: '/patient/history',
  PATIENT_CONSULTATION_SESSION: '/patient/consultations/:appointmentId',
  PATIENT_PROFILE: '/patient/profile',

  // Doctor routes
  DOCTOR_DASHBOARD: '/doctor',
  INBOX_QUESTIONS: '/doctor/inbox',
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_APPOINTMENTS: '/doctor/appointments',
  DOCTOR_CONSULTATION_SESSION: '/doctor/consultations/:appointmentId',
  SCHEDULE: '/doctor/schedule',
  DOCTOR_RATINGS: '/doctor/ratings',
  DOCTOR_PROFILE: '/doctor/profile',

  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  MANAGE_USERS: '/admin/users',
  MANAGE_PATIENTS: '/admin/patients',
  MANAGE_DOCTORS: '/admin/doctors',
  MANAGE_SPECIALTIES: '/admin/specialties',
  MANAGE_APPOINTMENTS: '/admin/appointments',
  MODERATION: '/admin/moderation',

  // Reports
  REPORTS: '/reports',

  // Error pages
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
} as const;
