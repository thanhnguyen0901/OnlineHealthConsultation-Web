import apiClient from '@/apis/core/apiClient';
import type { User, Id } from '@/types/common';
import type { Doctor, Patient, Specialty, AdminStats } from '../types';

interface BackendUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  isActive?: boolean;
}

interface BackendDoctorProfile {
  id: Id;
  user?: BackendUser;
  userId?: Id;
  firstName?: string;
  lastName?: string;
  email?: string;
  specialtyId?: Id;
  specialtyName?: string;
  specialtyNameVi?: string;
  bio?: string | null;
  qualificationSummary?: string | null;
  consultationDescription?: string | null;
  yearsOfExperience?: number | null;
  approvalStatus?: string;
  isActive?: boolean;
  specialties?: { specialty?: Specialty }[];
}

export interface BackendPatient {
  id: Id;
  profileId: Id;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  role: 'PATIENT';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface DoctorListParams {
  page?: number;
  limit?: number;
  approvalStatus?: string;
  isActive?: boolean;
  keyword?: string;
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface Appointment {
  id: Id;
  patientId: Id;
  patientName: string;
  doctorId: Id;
  doctorName: string;
  specialtyId: Id;
  specialtyName: string;
  specialtyNameVi?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ModerationItem {
  id: string;
  type: 'QUESTION' | 'ANSWER' | 'RATING';
  contentPreview: string;
  content: string;
  author: string;
  authorId: Id;
  createdAt: string;
  status: string;
  entityId: Id;
  context?: Record<string, unknown>;
}

const defaultPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

const unwrap = <T>(payload: T | { data: T }): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const getMeta = (payload: any): PaginationMeta => payload?.meta ?? defaultPagination;

const fullName = (firstName?: string | null, lastName?: string | null) =>
  `${firstName ?? ''} ${lastName ?? ''}`.trim();

const normalizeUser = (backendUser: BackendUser): User => ({
  ...backendUser,
  firstName: backendUser.firstName ?? '',
  lastName: backendUser.lastName ?? '',
  name: fullName(backendUser.firstName, backendUser.lastName) || backendUser.email,
});

const normalizeDoctor = (backendDoctor: BackendDoctorProfile): Doctor => {
  const user = backendDoctor.user;
  const firstSpecialty = backendDoctor.specialties?.[0]?.specialty;
  const firstName = user?.firstName ?? backendDoctor.firstName ?? '';
  const lastName = user?.lastName ?? backendDoctor.lastName ?? '';
  const email = user?.email ?? backendDoctor.email ?? '';

  return {
    id: backendDoctor.id,
    userId: user?.id ?? backendDoctor.userId,
    firstName,
    lastName,
    email,
    role: 'DOCTOR',
    name: fullName(firstName, lastName) || email,
    specialtyId: backendDoctor.specialtyId ?? firstSpecialty?.id ?? '',
    specialtyName: backendDoctor.specialtyName ?? firstSpecialty?.nameEn ?? '',
    specialtyNameVi: backendDoctor.specialtyNameVi ?? firstSpecialty?.nameVi,
    bio: backendDoctor.bio ?? undefined,
    qualificationSummary: backendDoctor.qualificationSummary ?? undefined,
    consultationDescription:
      backendDoctor.consultationDescription ?? backendDoctor.bio ?? undefined,
    yearsOfExperience: backendDoctor.yearsOfExperience ?? undefined,
    ...(user?.isActive !== undefined ? { isActive: user.isActive } : {}),
    ...(backendDoctor.isActive !== undefined ? { doctorProfileActive: backendDoctor.isActive } : {}),
    ...(backendDoctor.approvalStatus ? { approvalStatus: backendDoctor.approvalStatus } : {}),
  } as Doctor;
};

const normalizePatient = (p: BackendPatient): Patient => ({
  ...p,
  name: fullName(p.firstName, p.lastName) || p.email,
});

const normalizeStats = (raw: any): AdminStats => {
  const statusCounts = (raw?.appointmentsByStatus ?? []).reduce(
    (acc: Record<string, number>, row: { status?: string; count?: number }) => {
      if (row.status) acc[row.status.toUpperCase()] = row.count ?? 0;
      return acc;
    },
    {}
  );

  return {
    totalConsultations: raw?.totalConsultations ?? raw?.completedAppointments ?? 0,
    totalUsers: raw?.totalUsers ?? raw?.totalActiveUsers ?? 0,
    totalDoctors: raw?.totalDoctors ?? raw?.totalActiveDoctors ?? 0,
    totalPatients: raw?.totalPatients ?? raw?.totalActivePatients ?? 0,
    totalSpecialties: raw?.totalSpecialties ?? 0,
    totalAppointments: raw?.totalAppointments ?? 0,
    totalQuestions: raw?.totalQuestions ?? 0,
    totalRatings: raw?.totalRatings ?? 0,
    pendingAppointments: raw?.pendingAppointments ?? statusCounts.PENDING ?? 0,
    completedAppointments: raw?.completedAppointments ?? statusCounts.COMPLETED ?? 0,
    answeredQuestions: raw?.answeredQuestions ?? 0,
    pendingQuestions: raw?.pendingQuestions ?? 0,
    activePatients: raw?.activePatients ?? raw?.totalActivePatients ?? 0,
    activeDoctors: raw?.activeDoctors ?? raw?.totalActiveDoctors ?? 0,
    totalActiveUsers: raw?.totalActiveUsers ?? 0,
  };
};

const normalizeAppointmentStatus = (status?: string): Appointment['status'] => {
  switch ((status ?? '').toUpperCase()) {
    case 'CONFIRMED':
      return 'confirmed';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
};

const normalizeAppointment = (item: any): Appointment => {
  const scheduledAt = item.scheduledAt ?? item.date;
  const date = scheduledAt ? new Date(scheduledAt) : null;
  const patientUser = item.patient?.user ?? item.patient;
  const doctorUser = item.doctor?.user ?? item.doctor;
  const specialty = item.doctor?.specialties?.[0]?.specialty ?? item.specialty;

  return {
    id: item.id,
    patientId: item.patientId ?? item.patient?.id ?? '',
    patientName: item.patientName ?? fullName(patientUser?.firstName, patientUser?.lastName),
    doctorId: item.doctorId ?? item.doctor?.id ?? '',
    doctorName: item.doctorName ?? fullName(doctorUser?.firstName, doctorUser?.lastName),
    specialtyId: item.specialtyId ?? specialty?.id ?? '',
    specialtyName: item.specialtyName ?? specialty?.nameEn ?? '',
    specialtyNameVi: item.specialtyNameVi ?? specialty?.nameVi,
    date: date ? date.toISOString() : '',
    time: date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    status: normalizeAppointmentStatus(item.status),
    notes: item.notes ?? item.reason,
  };
};

export const getStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get('/reports/dashboard');
  return normalizeStats(unwrap(response.data));
};

export const getUsers = async (params?: UserListParams): Promise<PagedResult<User>> => {
  const response = await apiClient.get('/admin/users', {
    params: { ...params, keyword: params?.search },
  });
  const payload: any = response.data;
  return {
    data: (payload.data ?? []).map(normalizeUser),
    pagination: getMeta(payload),
  };
};

export const createUser = async (data: Partial<User> & { password: string }): Promise<User> => {
  const response = await apiClient.post('/admin/users', data);
  return normalizeUser(unwrap(response.data) as BackendUser);
};

export const updateUser = async (id: Id, data: Partial<User>): Promise<User> => {
  const response = await apiClient.patch(`/admin/users/${id}`, data);
  return normalizeUser(unwrap(response.data) as BackendUser);
};

export const deleteUser = async (id: Id): Promise<void> => {
  await apiClient.delete(`/admin/users/${id}`);
};

export const getDoctors = async (params?: DoctorListParams): Promise<PagedResult<Doctor>> => {
  const response = await apiClient.get('/admin/doctors', { params });
  const payload: any = response.data;
  return {
    data: (payload.data ?? []).map(normalizeDoctor),
    pagination: getMeta(payload),
  };
};

export const createDoctor = async (
  data: Partial<Doctor> & { password: string }
): Promise<Doctor> => {
  const response = await apiClient.post('/admin/users', { ...data, role: 'DOCTOR' });
  const user = normalizeUser(unwrap(response.data) as BackendUser);
  return {
    ...user,
    specialtyId: data.specialtyId ?? '',
    specialtyName: '',
    bio: data.bio,
    qualificationSummary: data.qualificationSummary,
    consultationDescription: data.consultationDescription,
    yearsOfExperience: data.yearsOfExperience,
  } as Doctor;
};

export const updateDoctor = async (id: Id, data: Partial<Doctor>): Promise<Doctor> => {
  let latest: BackendDoctorProfile | null = null;

  if (data.userId && (data.firstName !== undefined || data.lastName !== undefined || data.email !== undefined)) {
    await apiClient.patch(`/admin/users/${data.userId}`, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    });
  }

  if (
    data.bio !== undefined ||
    data.qualificationSummary !== undefined ||
    data.consultationDescription !== undefined ||
    data.yearsOfExperience !== undefined
  ) {
    const response = await apiClient.patch(`/admin/doctors/${id}/profile`, {
      bio: data.bio,
      qualificationSummary: data.qualificationSummary,
      consultationDescription: data.consultationDescription,
      yearsOfExperience: data.yearsOfExperience,
    });
    latest = unwrap(response.data) as BackendDoctorProfile;
  }

  if (data.specialtyId) {
    const response = await apiClient.patch(`/admin/doctors/${id}/specialties`, {
      specialtyIds: [data.specialtyId],
    });
    latest = unwrap(response.data) as BackendDoctorProfile;
  }

  if (data.approvalStatus || typeof (data as any).isActive === 'boolean') {
    const response = await apiClient.patch(`/admin/doctors/${id}/approval`, {
      approvalStatus: (data as any).approvalStatus ?? 'APPROVED',
      ...(typeof (data as any).isActive === 'boolean' ? { isActive: (data as any).isActive } : {}),
    });
    latest = unwrap(response.data) as BackendDoctorProfile;
  }

  if (!latest) {
    const response = await apiClient.get('/admin/doctors', { params: { limit: 100 } });
    const payload: any = response.data;
    latest = (payload.data ?? []).find((doctor: BackendDoctorProfile) => doctor.id === id) ?? null;
  }

  return normalizeDoctor(latest ?? ({ id, ...data } as BackendDoctorProfile));
};

export const deleteDoctor = async (id: Id): Promise<void> => {
  await apiClient.patch(`/admin/doctors/${id}/approval`, {
    approvalStatus: 'REJECTED',
    isActive: false,
  });
};

export const getPatients = async (params?: PatientListParams): Promise<PagedResult<Patient>> => {
  const response = await apiClient.get('/admin/users', {
    params: {
      page: params?.page,
      limit: params?.limit,
      keyword: params?.search,
      role: 'PATIENT',
      isActive: params?.isActive,
    },
  });
  const payload: any = response.data;
  return {
    data: (payload.data ?? []).map((u: BackendUser) =>
      normalizePatient({
        ...u,
        profileId: u.id,
        isActive: u.isActive ?? true,
        role: 'PATIENT',
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
      } as BackendPatient)
    ),
    pagination: getMeta(payload),
  };
};

export const updatePatient = async (id: Id, data: Partial<Patient>): Promise<Patient> => {
  const response = await apiClient.patch(`/admin/users/${id}`, data);
  const user = unwrap(response.data) as BackendUser;
  return normalizePatient({
    ...user,
    profileId: user.id,
    isActive: user.isActive ?? true,
    role: 'PATIENT',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
  } as BackendPatient);
};

export const createPatient = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
}): Promise<Patient> => {
  const response = await apiClient.post('/admin/users', { ...data, role: 'PATIENT' });
  const user = unwrap(response.data) as BackendUser;
  return normalizePatient({
    ...user,
    profileId: user.id,
    isActive: user.isActive ?? true,
    role: 'PATIENT',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
  } as BackendPatient);
};

export const deletePatient = async (id: Id): Promise<void> => {
  await apiClient.patch(`/admin/users/${id}/status`, { isActive: false });
};

export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get('/admin/specialties');
  return unwrap(response.data) as Specialty[];
};

export const createSpecialty = async (data: Partial<Specialty>): Promise<Specialty> => {
  const response = await apiClient.post('/admin/specialties', data);
  return unwrap(response.data) as Specialty;
};

export const updateSpecialty = async (id: Id, data: Partial<Specialty>): Promise<Specialty> => {
  const response = await apiClient.patch(`/admin/specialties/${id}`, data);
  return unwrap(response.data) as Specialty;
};

export const deleteSpecialty = async (id: Id): Promise<void> => {
  await apiClient.patch(`/admin/specialties/${id}/deactivate`);
};

export const getAppointments = async (
  filters?: AppointmentFilters
): Promise<PagedResult<Appointment>> => {
  const params: Record<string, any> = {};
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.status) params.status = filters.status.toUpperCase();
  if (filters?.startDate || filters?.fromDate) params.fromDate = filters.fromDate ?? filters.startDate;
  if (filters?.endDate || filters?.toDate) params.toDate = filters.toDate ?? filters.endDate;
  const response = await apiClient.get('/admin/appointments', { params });
  const payload: any = response.data;
  return {
    data: (payload.data ?? []).map(normalizeAppointment),
    pagination: getMeta(payload),
  };
};

export const updateAppointmentStatus = async (id: Id, status: string): Promise<Appointment> => {
  const response = await apiClient.patch(`/admin/appointments/${id}/status`, {
    status: status.toUpperCase(),
  });
  return normalizeAppointment(unwrap(response.data));
};

export const getModerationItems = async (): Promise<ModerationItem[]> => {
  const response = await apiClient.get('/admin/moderation/items');
  return unwrap(response.data) as ModerationItem[];
};

const parseModerationId = (id: Id) => {
  const [type, ...rest] = String(id).split('_');
  return { type, entityId: rest.join('_') };
};

const moderationActionEndpoint = (id: Id) => {
  const { type, entityId } = parseModerationId(id);
  return `/admin/moderation/items/${type}/${entityId}`;
};

export const approveModeration = async (id: Id): Promise<unknown> => {
  const response = await apiClient.patch(moderationActionEndpoint(id), { action: 'RESTORE' });
  return unwrap(response.data);
};

export const rejectModeration = async (id: Id): Promise<unknown> => {
  const response = await apiClient.patch(moderationActionEndpoint(id), { action: 'HIDE' });
  return unwrap(response.data);
};
