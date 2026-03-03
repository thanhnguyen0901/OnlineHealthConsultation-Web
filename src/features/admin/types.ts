import type { Id, User } from '@/types/common';

export interface Doctor extends User {
  specialtyId: Id;
  specialtyName: string;
  bio?: string;
}

export interface Specialty {
  id: Id;
  /** @deprecated Not returned by BE — use nameEn or nameVi instead */
  name?: string;
  nameEn: string;
  nameVi: string;
  description?: string;
  isActive?: boolean;
}

/** Mirrors BE ReportService.getOverallStats() response */
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
