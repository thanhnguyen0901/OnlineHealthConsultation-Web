import type { TFunction } from 'i18next';
import i18n from '@/i18n/initI18n';

export type EnumGroup = 'gender' | 'status' | 'role' | 'type' | 'specialty';

const normalizeText = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const ENUM_ALIASES: Record<EnumGroup, Record<string, string>> = {
  gender: {
    male: 'male',
    female: 'female',
    other: 'other',
    nam: 'male',
    nu: 'female',
    khac: 'other',
  },
  status: {
    pending: 'pending',
    confirmed: 'confirmed',
    completed: 'completed',
    cancelled: 'cancelled',
    answered: 'answered',
    moderated: 'moderated',
    approved: 'approved',
    rejected: 'rejected',
    visible: 'visible',
    hidden: 'hidden',
    dang_cho: 'pending',
    da_xac_nhan: 'confirmed',
    hoan_thanh: 'completed',
    da_huy: 'cancelled',
    da_tra_loi: 'answered',
    da_kiem_duyet: 'moderated',
    da_phe_duyet: 'approved',
    da_tu_choi: 'rejected',
  },
  role: {
    patient: 'patient',
    doctor: 'doctor',
    admin: 'admin',
    benh_nhan: 'patient',
    bac_si: 'doctor',
    quan_tri_vien: 'admin',
  },
  type: {
    question: 'question',
    answer: 'answer',
    rating: 'rating',
    cau_hoi: 'question',
    tra_loi: 'answer',
    danh_gia: 'rating',
  },
  specialty: {
    cardiology: 'cardiology',
    dermatology: 'dermatology',
    pediatrics: 'pediatrics',
    orthopedics: 'orthopedics',
    general_medicine: 'general_medicine',
    internal_medicine: 'general_medicine',
    general_practice: 'general_medicine',
    tim_mach: 'cardiology',
    da_lieu: 'dermatology',
    nhi_khoa: 'pediatrics',
    chan_thuong_chinh_hinh: 'orthopedics',
    da_khoa: 'general_medicine',
  },
};

export const normalizeEnumValue = (group: EnumGroup, value: string): string => {
  const normalized = normalizeText(value);
  return ENUM_ALIASES[group][normalized] ?? normalized;
};

export const translateEnumValue = (
  t: TFunction,
  group: EnumGroup,
  value: string | null | undefined
): string => {
  if (!value) return '';
  const normalized = normalizeEnumValue(group, value);
  const key = `common:${group}.${normalized}`;
  const translated = t(key, { defaultValue: value });
  if (import.meta.env.DEV && !i18n.exists(key)) {
    // Dev-only hint to catch missing translations for newly introduced enum values.
    console.warn(`[i18n] Missing enum key: ${key} (fallback="${value}")`);
  }
  return translated;
};
