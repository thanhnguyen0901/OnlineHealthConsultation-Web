export interface ReportData extends Record<string, string | number> {
  date: string;
  appointments: number;
  questions: number;
  users: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Statistics {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  totalQuestions: number;
  activeUsers: number;
}
