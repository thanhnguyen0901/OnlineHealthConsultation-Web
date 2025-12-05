export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Patient routes
  PATIENT_DASHBOARD: '/patient',
  ASK_QUESTION: '/patient/ask-question',
  BOOK_APPOINTMENT: '/patient/book-appointment',
  CONSULTATION_HISTORY: '/patient/history',
  PATIENT_PROFILE: '/patient/profile',
  
  // Doctor routes
  DOCTOR_DASHBOARD: '/doctor',
  INBOX_QUESTIONS: '/doctor/inbox',
  SCHEDULE: '/doctor/schedule',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  MANAGE_USERS: '/admin/users',
  MANAGE_DOCTORS: '/admin/doctors',
  MANAGE_SPECIALTIES: '/admin/specialties',
  MANAGE_APPOINTMENTS: '/admin/appointments',
  MODERATION: '/admin/moderation',
  
  // Reports
  REPORTS: '/reports',
  
  // Error pages
  NOT_FOUND: '/404',
} as const;
