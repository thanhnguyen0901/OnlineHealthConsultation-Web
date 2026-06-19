import apiClient from '@/apis/core/apiClient';
import type {
  DoctorQuestion,
  DoctorProfile,
  Schedule,
  DoctorPatient,
  DoctorPatientsPagination,
  DoctorAppointment,
  DoctorRating,
} from '../types';

const unwrap = <T>(payload: unknown): T => {
  const candidate = payload as { data?: unknown };
  return (candidate?.data !== undefined ? candidate.data : payload) as T;
};

const fullName = (user?: { firstName?: string | null; lastName?: string | null }) =>
  `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

const normalizeStatus = (status?: string): DoctorAppointment['status'] => {
  const value = (status ?? '').toLowerCase();
  if (value === 'pending_confirmation') return 'pending';
  if (value === 'confirmed') return 'confirmed';
  if (value === 'completed') return 'completed';
  if (value === 'cancelled') return 'cancelled';
  return 'pending';
};

const normalizeProfile = (raw: any): DoctorProfile => {
  const firstSpecialty = raw.specialties?.[0]?.specialty;
  return {
    id: raw.id,
    firstName: raw.user?.firstName ?? raw.firstName ?? '',
    lastName: raw.user?.lastName ?? raw.lastName ?? '',
    email: raw.user?.email ?? raw.email ?? '',
    bio: raw.bio,
    yearsOfExperience: raw.yearsOfExperience,
    specialtyId: firstSpecialty?.id ?? raw.specialtyId,
    specialty: firstSpecialty ?? raw.specialty ?? null,
    ratingAverage: raw.avgRating ?? raw.ratingAverage ?? 0,
    ratingCount: raw.ratingCount ?? 0,
    stats: raw.stats ?? {
      questionCount: 0,
      appointmentCount: 0,
      ratingAverage: raw.avgRating ?? 0,
      ratingCount: raw.ratingCount ?? 0,
    },
  };
};

const normalizeQuestion = (raw: any): DoctorQuestion => ({
  id: raw.id,
  patientId: raw.patientId,
  patientName: raw.patientName ?? fullName(raw.patient?.user) ?? 'Patient',
  question: raw.content ?? raw.question ?? raw.title ?? '',
  createdAt: raw.createdAt,
  status: (raw.status ?? 'PENDING').toLowerCase() === 'answered' ? 'answered' : 'pending',
  answer: raw.answers?.[0]?.content ?? raw.answer,
  patientMedicalHistory: raw.patient?.medicalHistory,
});

const normalizeAppointment = (raw: any): DoctorAppointment => {
  const specialty = raw.doctor?.specialties?.[0]?.specialty;
  return {
    id: raw.id,
    patientId: raw.patientId,
    patientName: raw.patientName ?? fullName(raw.patient?.user) ?? 'Patient',
    specialtyName: raw.specialtyName ?? specialty?.nameEn,
    specialtyNameVi: raw.specialtyNameVi ?? specialty?.nameVi,
    scheduledAt: raw.scheduledAt,
    reason: raw.reason,
    notes: raw.notes,
    status: normalizeStatus(raw.status),
  };
};

export const getMe = async (): Promise<DoctorProfile> => {
  const response = await apiClient.get('/doctors/me/profile');
  return normalizeProfile(unwrap(response.data));
};

export const getQuestions = async (): Promise<DoctorQuestion[]> => {
  const response = await apiClient.get('/questions/assigned');
  return (unwrap<any[]>(response.data) ?? []).map(normalizeQuestion);
};

export const answerQuestion = async (data: {
  questionId: string;
  answer: string;
}): Promise<void> => {
  await apiClient.post(`/questions/${data.questionId}/answers`, { content: data.answer });
};

export const getSchedule = async (): Promise<Schedule[]> => {
  const response = await apiClient.get('/doctors/me/profile');
  const rawSchedule = (unwrap<any>(response.data) as any).schedule;
  return Array.isArray(rawSchedule) ? rawSchedule : [];
};

export const updateSchedule = async (schedule: Schedule[]): Promise<void> => {
  await apiClient.patch('/doctors/me/schedule', { schedule });
};

export const getAppointments = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: DoctorAppointment[]; meta?: unknown }> => {
  const status =
    params?.status === 'pending'
      ? 'PENDING_CONFIRMATION'
      : params?.status
        ? params.status.toUpperCase()
        : undefined;
  const response = await apiClient.get('/appointments/doctor/me', {
    params: { ...params, status },
  });
  return { data: (unwrap<any[]>(response.data) ?? []).map(normalizeAppointment) };
};

export const getPatients = async (_params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: DoctorPatient[]; meta?: DoctorPatientsPagination }> => {
  // TODO_BACKEND_API: no dedicated doctor patient list endpoint in current backend.
  return { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
};

export const updateAppointment = async (
  id: string,
  body: { status?: string; scheduledAt?: string; notes?: string }
): Promise<DoctorAppointment> => {
  if (body.status === 'confirmed') {
    const response = await apiClient.patch(`/appointments/${id}/confirm`);
    return normalizeAppointment(unwrap(response.data));
  }
  if (body.status === 'completed') {
    const response = await apiClient.patch(`/appointments/${id}/complete`);
    return normalizeAppointment(unwrap(response.data));
  }
  return getAppointmentDetail(id);
};

export const getAppointmentDetail = async (id: string): Promise<DoctorAppointment> => {
  const response = await apiClient.get(`/appointments/${id}`);
  return normalizeAppointment(unwrap(response.data));
};

export const rescheduleAppointment = async (id: string, _scheduledAt: string): Promise<unknown> => {
  // TODO_BACKEND_API: doctor reschedule is out of current backend MVP.
  return getAppointmentDetail(id);
};

export const getRatings = async (_params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: DoctorRating[]; meta?: unknown }> => {
  const response = await apiClient.get('/ratings/doctor/me');
  const ratings = unwrap<any[]>(response.data) ?? [];
  return { data: ratings };
};

export const updateProfile = async (data: {
  bio?: string;
  yearsOfExperience?: number;
  specialtyId?: string;
}): Promise<unknown> => {
  await apiClient.patch('/doctors/me/profile', {
    bio: data.bio,
    yearsOfExperience: data.yearsOfExperience,
  });
  if (data.specialtyId) {
    await apiClient.patch('/doctors/me/specialties', { specialtyIds: [data.specialtyId] });
  }
  return getMe();
};

export const startConsultation = async (appointmentId: string) =>
  unwrap((await apiClient.post(`/consultations/${appointmentId}/start`, { channel: 'CHAT' })).data);

export const joinConsultation = async (appointmentId: string) =>
  unwrap((await apiClient.post(`/consultations/${appointmentId}/join`)).data);

export const getMessages = async (appointmentId: string) =>
  unwrap<any[]>((await apiClient.get(`/consultations/${appointmentId}/messages`)).data) ?? [];

export const getConsultationResult = async (appointmentId: string) =>
  unwrap<any>((await apiClient.get(`/consultations/${appointmentId}/result`)).data);

export const sendMessage = async (appointmentId: string, content: string) =>
  unwrap((await apiClient.post(`/consultations/${appointmentId}/messages`, { content })).data);

export const endConsultation = async (appointmentId: string) =>
  unwrap((await apiClient.patch(`/consultations/${appointmentId}/end`)).data);

export const saveSummary = async (appointmentId: string, summary: string) =>
  unwrap((await apiClient.patch(`/consultations/${appointmentId}/summary`, { summary })).data);

export const createPrescription = async (
  appointmentId: string,
  data: { notes?: string; items: any[] }
) => unwrap((await apiClient.post(`/consultations/${appointmentId}/prescriptions`, data)).data);
