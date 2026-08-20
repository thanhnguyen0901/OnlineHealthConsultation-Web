export interface PublicSpecialty {
  id: string;
  nameEn: string;
  nameVi: string;
  description?: string | null;
  isActive?: boolean;
}

export interface PublicDoctor {
  id: string;
  userId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  qualificationSummary?: string | null;
  consultationDescription?: string | null;
  yearsOfExperience?: number | null;
  schedule?: unknown;
  specialties: PublicSpecialty[];
  avgRating: number | null;
  ratingCount: number;
}

export interface PublicDoctorListParams {
  keyword?: string;
  specialtyId?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicDoctorListResult {
  data: PublicDoctor[];
  meta: PaginationMeta;
}
