export type E2ERole = 'patient' | 'doctor' | 'admin';

export type E2EAccount = {
  role: E2ERole;
  email?: string;
  password?: string;
};

const env = (key: string, fallback = '') => process.env[key] || fallback;

export const users = {
  patient: {
    role: 'patient',
    email: env('E2E_PATIENT_EMAIL'),
    password: env('E2E_PATIENT_PASSWORD'),
  },
  doctor: {
    role: 'doctor',
    email: env('E2E_DOCTOR_EMAIL'),
    password: env('E2E_DOCTOR_PASSWORD'),
  },
  admin: {
    role: 'admin',
    email: env('E2E_ADMIN_EMAIL', 'admin@healthcare.local'),
    password: env('E2E_ADMIN_PASSWORD', 'Admin@123'),
  },
} satisfies Record<E2ERole, E2EAccount>;

export const hasCredentials = (account: E2EAccount) =>
  Boolean(account.email?.trim() && account.password?.trim());
