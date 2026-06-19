import type { NavigateFunction } from 'react-router-dom';
import { ROUTE_PATHS } from '@/constants/routePaths';
import type { PublicDoctor, PublicSpecialty } from '../types';

export const specialtyName = (specialty: PublicSpecialty, language: string) =>
  language === 'vi' ? specialty.nameVi : specialty.nameEn;

export const doctorSpecialtyText = (doctor: PublicDoctor, language: string) =>
  doctor.specialties.map((specialty) => specialtyName(specialty, language)).join(', ') ||
  (language === 'vi' ? 'Nội tổng quát' : 'General Medicine');

export const ratingText = (avgRating: number | null, ratingCount: number, language = 'en') => {
  if (!ratingCount || avgRating === null) {
    return language === 'vi' ? 'Chưa có đánh giá' : 'No ratings yet';
  }
  return `${avgRating.toFixed(1)} / 5 (${ratingCount})`;
};

export const redirectGuestToLogin = (
  navigate: NavigateFunction,
  intent: 'book' | 'ask',
  doctorId?: string
) => {
  const params = new URLSearchParams();
  params.set('intent', intent);
  if (doctorId) params.set('doctorId', doctorId);

  navigate(`${ROUTE_PATHS.LOGIN}?${params.toString()}`, {
    state: {
      returnUrl:
        intent === 'book' ? ROUTE_PATHS.BOOK_APPOINTMENT : ROUTE_PATHS.ASK_QUESTION,
      intent,
      doctorId,
    },
  });
};
