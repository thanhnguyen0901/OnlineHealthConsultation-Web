import type { Id } from '@/types/common';

export interface DoctorQuestion {
  id: Id;
  patientId: Id;
  patientName: string;
  question: string;
  createdAt: string;
  status: 'pending' | 'answered';
}

export interface Schedule {
  id: Id;
  doctorId: Id;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}
