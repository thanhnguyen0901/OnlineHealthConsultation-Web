/** One day's appointment counts — mirrors BE getAppointmentsChart row */
export interface AppointmentChartRow {
  date: string;       // "YYYY-MM-DD"
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

/** One day's question counts — mirrors BE getQuestionsChart row */
export interface QuestionChartRow {
  date: string;
  total: number;
  pending: number;
  answered: number;
  moderated: number;
}

/** Kept for backward compatibility with components not yet migrated */
export interface ReportData extends Record<string, string | number> {
  date: string;
}

/** Generic pie/bar chart slice */
export interface ChartData {
  name: string;
  value: number;
}

/** Mirrors BE getOverallStats / getStatistics response */
export interface Statistics {
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
