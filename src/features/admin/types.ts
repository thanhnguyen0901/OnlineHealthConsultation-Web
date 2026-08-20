import type { Id, User } from '@/types/common';

export interface Patient extends User {
  profileId: Id; // PatientProfile.id
  isActive: boolean;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  role: 'PATIENT';
}

export interface Doctor extends User {
  userId?: Id;
  specialtyId: Id;
  specialtyName: string;
  specialtyNameVi?: string;
  bio?: string;
  qualificationSummary?: string;
  consultationDescription?: string;
  yearsOfExperience?: number;
  approvalStatus?: string;
  isActive?: boolean;
  doctorProfileActive?: boolean;
}

export interface Specialty {
  id: Id;
  nameEn: string;
  nameVi: string;
  description?: string;
  isActive?: boolean;
}

export interface AdminStats {
  totalConsultations: number;
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
  activePatients: number;
  activeDoctors: number;
  totalActiveUsers: number;
}
