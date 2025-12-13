import type { Role } from '@/types/common';

export const PERMISSIONS = {
  PATIENT: ['VIEW_DASHBOARD', 'ASK_QUESTION', 'BOOK_APPOINTMENT', 'VIEW_HISTORY'] as const,
  DOCTOR: ['VIEW_DASHBOARD', 'VIEW_QUESTIONS', 'ANSWER_QUESTION', 'MANAGE_SCHEDULE'] as const,
  ADMIN: [
    'VIEW_DASHBOARD',
    'MANAGE_USERS',
    'MANAGE_DOCTORS',
    'MANAGE_SPECIALTIES',
    'VIEW_REPORTS',
  ] as const,
} satisfies Record<Role, readonly string[]>;
