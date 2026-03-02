export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type Id = string;

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Option {
  label: string;
  value: string | number;
}

export interface User {
  id: Id;
  role: Role;
  /** Computed display name: `${firstName} ${lastName}` */
  name: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
