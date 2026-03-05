import type { Id, User } from '@/types/common';

export interface Patient extends User {
  profileId: Id;  // PatientProfile.id
  isActive: boolean;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  role: 'PATIENT';
}

export interface Doctor extends User {
  specialtyId: Id;
  specialtyName: string;
  bio?: string;
}

export interface Specialty {
  id: Id;
  nameEn: string;
  nameVi: string;
  description?: string;
  isActive?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalSpecialties: number;
  totalAppointments: number;
  totalQuestions: number;
  totalRatings: number;
  pendingAppointments: number;
  completedAppointments: number;
  answeredQuestions: number;
  pendingQuestions: number;
}
