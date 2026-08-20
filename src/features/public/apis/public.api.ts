import apiClient from '@/apis/core/apiClient';
import type {
  PaginationMeta,
  PublicDoctor,
  PublicDoctorListParams,
  PublicDoctorListResult,
  PublicSpecialty,
} from '../types';

interface BackendSpecialty {
  id: string;
  nameEn: string;
  nameVi: string;
  description?: string | null;
  isActive?: boolean;
}

interface BackendDoctorSpecialty {
  specialty?: BackendSpecialty;
}

interface BackendDoctor {
  id: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  qualificationSummary?: string | null;
  consultationDescription?: string | null;
  yearsOfExperience?: number | null;
  schedule?: unknown;
  specialties?: BackendDoctorSpecialty[] | BackendSpecialty[];
  avgRating?: number | null;
  ratingCount?: number | null;
}

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const unwrap = <T>(payload: unknown): T => {
  const candidate = payload as { data?: unknown };
  return (candidate && candidate.data !== undefined ? candidate.data : payload) as T;
};

const unwrapPaged = (payload: unknown): { data: BackendDoctor[]; meta?: PaginationMeta } => {
  const direct = payload as { data?: unknown; meta?: PaginationMeta };
  const root = (direct?.meta ? payload : unwrap<unknown>(payload)) as
    | { data?: BackendDoctor[]; meta?: PaginationMeta }
    | BackendDoctor[];

  if (Array.isArray(root)) {
    return { data: root };
  }

  return {
    data: root.data ?? [],
    meta: root.meta,
  };
};

const normalizeSpecialty = (specialty: BackendSpecialty): PublicSpecialty => ({
  id: specialty.id,
  nameEn: specialty.nameEn,
  nameVi: specialty.nameVi,
  description: specialty.description ?? null,
  isActive: specialty.isActive,
});

const isBackendSpecialty = (
  item: BackendSpecialty | BackendDoctorSpecialty
): item is BackendSpecialty => 'id' in item && 'nameEn' in item && 'nameVi' in item;

const normalizeDoctorSpecialties = (
  specialties?: BackendDoctor['specialties']
): PublicSpecialty[] => {
  if (!specialties) return [];

  return specialties
    .map((item): BackendSpecialty | undefined =>
      isBackendSpecialty(item) ? item : item.specialty
    )
    .filter((specialty): specialty is BackendSpecialty => Boolean(specialty?.id))
    .map(normalizeSpecialty);
};

export const normalizeDoctor = (doctor: BackendDoctor): PublicDoctor => {
  const firstName = doctor.user?.firstName ?? doctor.firstName ?? '';
  const lastName = doctor.user?.lastName ?? doctor.lastName ?? '';

  return {
    id: doctor.id,
    userId: doctor.user?.id,
    name: `${firstName} ${lastName}`.trim() || 'Doctor',
    firstName,
    lastName,
    bio: doctor.bio ?? null,
    qualificationSummary: doctor.qualificationSummary ?? null,
    consultationDescription: doctor.consultationDescription ?? doctor.bio ?? null,
    yearsOfExperience: doctor.yearsOfExperience ?? null,
    schedule: doctor.schedule,
    specialties: normalizeDoctorSpecialties(doctor.specialties),
    avgRating: doctor.avgRating ?? null,
    ratingCount: doctor.ratingCount ?? 0,
  };
};

export const getPublicHome = async () => {
  const response = await apiClient.get('/public/home');
  return unwrap(response.data);
};

export const getPublicSpecialties = async (): Promise<PublicSpecialty[]> => {
  const response = await apiClient.get('/public/specialties');
  const specialties = unwrap<BackendSpecialty[]>(response.data);
  return (specialties ?? []).map(normalizeSpecialty);
};

export const getPublicDoctors = async (
  params?: PublicDoctorListParams
): Promise<PublicDoctorListResult> => {
  const response = await apiClient.get('/public/doctors', { params });
  const result = unwrapPaged(response.data);

  return {
    data: result.data.map(normalizeDoctor),
    meta: result.meta ?? {
      ...defaultMeta,
      limit: params?.limit ?? defaultMeta.limit,
      total: result.data.length,
      totalPages: result.data.length > 0 ? 1 : 0,
    },
  };
};

export const getPublicDoctorDetail = async (doctorId: string): Promise<PublicDoctor> => {
  const response = await apiClient.get(`/public/doctors/${doctorId}`);
  return normalizeDoctor(unwrap<BackendDoctor>(response.data));
};
