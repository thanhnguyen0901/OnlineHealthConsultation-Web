/**
 * User Role Constants
 * Centralized role definitions to prevent typos and improve maintainability
 */
export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const;

/**
 * Type derived from ROLES constant
 * Ensures type safety when using roles throughout the application
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];
