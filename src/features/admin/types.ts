import type { Id, User } from '@/types/common';

export interface Doctor extends User {
  specialtyId: Id;
  specialtyName: string;
  bio?: string;
}

export interface Specialty {
  id: Id;
  name: string;
  description?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  totalQuestions: number;
}
