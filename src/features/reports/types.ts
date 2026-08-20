export interface AppointmentChartRow {
  date: string; // YYYY-MM-DD
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface QuestionChartRow {
  date: string;
  total: number;
  pending: number;
  answered: number;
  moderated: number;
}

export interface ReportData extends Record<string, string | number> {
  date: string;
}

export interface ReportFilters {
  from?: string;
  to?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface Statistics {
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
