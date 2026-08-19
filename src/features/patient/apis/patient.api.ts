import apiClient from '@/apis/core/apiClient';
import type {
  Question,
  Appointment,
  PatientProfile,
  Rating,
  DoctorAvailability,
  ConsultationJoinResult,
  ConsultationMessage,
  ConsultationResult,
} from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';
import { getPublicDoctors, getPublicSpecialties } from '@/features/public/apis/public.api';

const unwrap = <T>(payload: unknown): T => {
  const candidate = payload as { data?: unknown };
  return (candidate?.data !== undefined ? candidate.data : payload) as T;
};

const normalizeStatus = (status?: string): Appointment['status'] => {
  const value = (status ?? '').toLowerCase();
  if (value === 'pending_confirmation') return 'pending';
  if (value === 'confirmed') return 'confirmed';
  if (value === 'completed') return 'completed';
  if (value === 'cancelled') return 'cancelled';
  return 'pending';
};

const fullName = (user?: { firstName?: string | null; lastName?: string | null }) =>
  `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

const normalizeAppointment = (raw: any): Appointment => {
  const scheduledAt = raw.scheduledAt ?? raw.date;
  const doctorName = raw.doctorName ?? fullName(raw.doctor?.user) ?? 'Doctor';
  const specialty = raw.doctor?.specialties?.[0]?.specialty;

  return {
    id: raw.id,
    patientId: raw.patientId,
    doctorId: raw.doctorId,
    doctorName,
    specialtyId: specialty?.id ?? raw.specialtyId ?? '',
    specialtyName: specialty?.nameEn ?? raw.specialtyName ?? '',
    date: scheduledAt,
    time: scheduledAt ? new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    status: normalizeStatus(raw.status),
    durationMinutes: raw.durationMinutes,
    reason: raw.reason,
    notes: raw.notes,
    hasRating: Boolean(raw.hasRating ?? raw.rating),
  };
};

const normalizeQuestionStatus = (status?: string): Question['status'] => {
  const value = (status ?? '').toLowerCase();
  if (value === 'answered') return 'answered';
  if (value === 'moderated' || value === 'closed') return 'moderated';
  return 'pending';
};

const normalizeQuestion = (raw: any): Question => {
  const firstAnswer = raw.answers?.[0];
  return {
    id: raw.id,
    patientId: raw.patientId,
    doctorId: raw.doctorId,
    doctorName: raw.doctorName,
    title: raw.title,
    question: raw.content ?? raw.question ?? raw.title ?? '',
    answer: firstAnswer?.content ?? raw.answer,
    answers: raw.answers ?? [],
    status: normalizeQuestionStatus(raw.status),
    createdAt: raw.createdAt,
    answeredAt: firstAnswer?.createdAt ?? raw.answeredAt,
  };
};

const normalizeGender = (value?: string | null): PatientProfile['gender'] | undefined => {
  const lower = value?.toLowerCase();
  return lower === 'male' || lower === 'female' || lower === 'other' ? lower : undefined;
};

const normalizeProfile = (raw: any): PatientProfile => ({
  id: raw.id,
  firstName: raw.user?.firstName ?? raw.firstName ?? '',
  lastName: raw.user?.lastName ?? raw.lastName ?? '',
  email: raw.user?.email ?? raw.email,
  dateOfBirth: raw.dateOfBirth,
  gender: normalizeGender(raw.gender),
  phone: raw.phone ?? undefined,
  address: raw.address ?? undefined,
  medicalHistory: raw.medicalHistory ?? undefined,
});

export const askQuestion = async (data: {
  title: string;
  content: string;
  doctorId?: string;
}): Promise<Question> => {
  const response = await apiClient.post('/questions', data);
  return normalizeQuestion(unwrap(response.data));
};

export const bookAppointment = async (data: {
  doctorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  reason: string;
  notes?: string;
}): Promise<Appointment> => {
  const response = await apiClient.post('/appointments', data);
  return normalizeAppointment(unwrap(response.data));
};

export const getDoctorAvailability = async (params: {
  doctorId: string;
  date: string;
  durationMinutes?: number;
}): Promise<DoctorAvailability> => {
  const response = await apiClient.get(`/public/doctors/${params.doctorId}/availability`, {
    params: {
      date: params.date,
      durationMinutes: params.durationMinutes,
    },
  });
  return unwrap<DoctorAvailability>(response.data);
};

export const getHistory = async (): Promise<{
  questions: Question[];
  appointments: Appointment[];
}> => {
  const [questionsRes, appointmentsRes, ratingsRes] = await Promise.all([
    apiClient.get('/questions/mine'),
    apiClient.get('/appointments/mine'),
    apiClient.get('/ratings/mine'),
  ]);
  const ratings = unwrap<any[]>(ratingsRes.data) ?? [];
  const ratedAppointmentIds = new Set(ratings.map((rating) => rating.appointmentId));

  return {
    questions: (unwrap<any[]>(questionsRes.data) ?? []).map(normalizeQuestion),
    appointments: (unwrap<any[]>(appointmentsRes.data) ?? []).map((appointment) => ({
      ...normalizeAppointment(appointment),
      hasRating: Boolean(appointment.rating) || ratedAppointmentIds.has(appointment.id),
    })),
  };
};

export const getProfile = async (): Promise<PatientProfile> => {
  const response = await apiClient.get('/patients/me/profile');
  return normalizeProfile(unwrap(response.data));
};

export const updateProfile = async (data: Partial<PatientProfile>): Promise<PatientProfile> => {
  const response = await apiClient.patch('/patients/me/profile', {
    dateOfBirth: data.dateOfBirth,
    gender: data.gender?.toUpperCase(),
    phone: data.phone,
    address: data.address,
    medicalHistory: data.medicalHistory,
  });
  return normalizeProfile(unwrap(response.data));
};

export const rateConsultation = async (data: {
  appointmentId: string;
  score: number;
  comment?: string;
}): Promise<Rating> => {
  const response = await apiClient.post('/ratings', data);
  return unwrap<Rating>(response.data);
};

export const cancelAppointment = async (id: string): Promise<void> => {
  await apiClient.patch(`/appointments/${id}/cancel`);
};

export const getAppointmentDetail = async (id: string): Promise<Appointment> => {
  const response = await apiClient.get(`/appointments/${id}`);
  return normalizeAppointment(unwrap(response.data));
};

export const joinConsultation = async (appointmentId: string): Promise<ConsultationJoinResult> => {
  const response = await apiClient.post(`/consultations/${appointmentId}/join`);
  return unwrap<ConsultationJoinResult>(response.data);
};

export const getConsultationMessages = async (
  appointmentId: string
): Promise<ConsultationMessage[]> => {
  const response = await apiClient.get(`/consultations/${appointmentId}/messages`);
  return unwrap<ConsultationMessage[]>(response.data) ?? [];
};

export const sendConsultationMessage = async (
  appointmentId: string,
  content: string
): Promise<ConsultationMessage> => {
  const response = await apiClient.post(`/consultations/${appointmentId}/messages`, { content });
  return unwrap<ConsultationMessage>(response.data);
};

export const getConsultationResult = async (
  appointmentId: string
): Promise<ConsultationResult> => {
  const response = await apiClient.get(`/consultations/${appointmentId}/result`);
  return unwrap<ConsultationResult>(response.data);
};

export const getRatings = async (): Promise<Rating[]> => {
  const response = await apiClient.get('/ratings/mine');
  return unwrap<Rating[]>(response.data) ?? [];
};

export const getSpecialties = async (): Promise<Specialty[]> => {
  const specialties = await getPublicSpecialties();
  return specialties.map((specialty) => ({
    ...specialty,
    description: specialty.description ?? undefined,
  }));
};

export const getDoctorsBySpecialty = async (specialtyId: string): Promise<Doctor[]> => {
  const result = await getPublicDoctors({ specialtyId, limit: 100 });
  return result.data.map((doctor) => ({
    id: doctor.id,
    email: '',
    firstName: doctor.firstName ?? '',
    lastName: doctor.lastName ?? '',
    name: doctor.name,
    role: 'DOCTOR',
    specialtyId: doctor.specialties[0]?.id ?? '',
    specialtyName: doctor.specialties[0]?.nameEn ?? '',
    specialtyNameVi: doctor.specialties[0]?.nameVi,
    bio: doctor.bio ?? undefined,
  }));
};
