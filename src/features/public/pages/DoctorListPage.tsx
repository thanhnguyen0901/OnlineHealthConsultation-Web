import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from '@/components/common/Button';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineAlert } from '@/components/common/InlineAlert';
import { Spinner } from '@/components/common/Spinner';
import { getPublicDoctors, getPublicSpecialties } from '../apis/public.api';
import type { PublicDoctor, PublicSpecialty } from '../types';
import {
  doctorSpecialtyText,
  ratingText,
  redirectGuestToLogin,
  specialtyName,
} from './publicPageUtils';

export const DoctorListPage: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = React.useState(searchParams.get('keyword') ?? '');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = React.useState(
    searchParams.get('specialtyId') ?? ''
  );
  const [specialties, setSpecialties] = React.useState<PublicSpecialty[]>([]);
  const [doctors, setDoctors] = React.useState<PublicDoctor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const specialtyOptions = React.useMemo(
    () => [
      { label: t('home.allSpecialties'), value: '' },
      ...specialties.map((specialty) => ({
        label: specialtyName(specialty, i18n.language),
        value: specialty.id,
      })),
    ],
    [i18n.language, specialties, t]
  );

  const loadDoctors = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data }, specialtyList] = await Promise.all([
        getPublicDoctors({
          keyword: keyword.trim() || undefined,
          specialtyId: selectedSpecialtyId || undefined,
          page: 1,
          limit: 12,
        }),
        getPublicSpecialties(),
      ]);
      setDoctors(data);
      setSpecialties(specialtyList);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpectedError'));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedSpecialtyId, t]);

  React.useEffect(() => {
    const next = new URLSearchParams();
    if (keyword.trim()) next.set('keyword', keyword.trim());
    if (selectedSpecialtyId) next.set('specialtyId', selectedSpecialtyId);
    setSearchParams(next, { replace: true });
  }, [keyword, selectedSpecialtyId, setSearchParams]);

  React.useEffect(() => {
    const timer = window.setTimeout(loadDoctors, 250);
    return () => window.clearTimeout(timer);
  }, [loadDoctors]);

  return (
    <main
      data-testid="doctor-list-page"
      className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-900"
    >
      <div className="absolute right-4 top-4 z-10">
        <LanguageToggle />
      </div>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-950 dark:text-white">
            {t('home.doctorListTitle')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('home.doctorListSubtitle')}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-slate-900 md:grid-cols-[1fr_280px]">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t('home.doctorSearchPlaceholder')}
              className="w-full"
              data-testid="doctor-search-input"
            />
          </span>
          <Dropdown
            value={selectedSpecialtyId}
            options={specialtyOptions}
            onChange={(event) => setSelectedSpecialtyId(event.value)}
            placeholder={t('home.specialtyFilterPlaceholder')}
            className="w-full"
            data-testid="specialty-filter"
          />
        </div>

        {loading ? (
          <div data-testid="loading-state" className="py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div data-testid="error-alert">
            <InlineAlert variant="error" title={t('error')} message={error} onRetry={loadDoctors} />
          </div>
        ) : doctors.length === 0 ? (
          <div data-testid="empty-state">
            <EmptyState
              title={t('home.noDoctorsFound')}
              description={t('home.tryAnotherDoctorFilter')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                data-testid={`doctor-card-${doctor.id}`}
              >
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <i className="pi pi-user text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                        {doctor.name}
                      </h2>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {doctorSpecialtyText(doctor, i18n.language)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {doctor.yearsOfExperience !== null && (
                      <p>
                        {doctor.yearsOfExperience} {t('home.yearsExperience')}
                      </p>
                    )}
                    <p data-testid="doctor-rating-summary">
                      {ratingText(doctor.avgRating, doctor.ratingCount, i18n.language)}
                    </p>
                    {doctor.bio && <p className="line-clamp-3">{doctor.bio}</p>}
                  </div>

                  <div className="mt-auto grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                    <Button
                      size="sm"
                      outlined
                      className="w-full"
                      onClick={() => navigate(`/doctors/${doctor.id}`)}
                      data-testid="doctor-detail-link"
                    >
                      {t('home.detail')}
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => redirectGuestToLogin(navigate, 'book', doctor.id)}
                      data-testid="book-appointment-guest"
                    >
                      {t('home.book')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => redirectGuestToLogin(navigate, 'ask', doctor.id)}
                      data-testid="ask-question-guest"
                    >
                      {t('home.ask')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
