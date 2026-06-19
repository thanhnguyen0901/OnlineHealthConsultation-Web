import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineAlert } from '@/components/common/InlineAlert';
import { Spinner } from '@/components/common/Spinner';
import { getPublicDoctorDetail } from '../apis/public.api';
import type { PublicDoctor } from '../types';
import {
  doctorSpecialtyText,
  ratingText,
  redirectGuestToLogin,
  specialtyName,
} from './publicPageUtils';

type WeeklyScheduleItem = {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
};

const getWeeklySchedule = (schedule: unknown): WeeklyScheduleItem[] => {
  if (!schedule || typeof schedule !== 'object') return [];

  const weekly = (schedule as { weekly?: unknown }).weekly;
  if (!Array.isArray(weekly)) return [];

  return weekly
    .filter((item): item is WeeklyScheduleItem => item !== null && typeof item === 'object')
    .filter(
      (item) =>
        typeof item.dayOfWeek === 'number' &&
        typeof item.startTime === 'string' &&
        typeof item.endTime === 'string'
    )
    .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0));
};

export const DoctorDetailPage: React.FC = () => {
  const { doctorId } = useParams();
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [doctor, setDoctor] = React.useState<PublicDoctor | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDoctor = React.useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      setDoctor(await getPublicDoctorDetail(doctorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpectedError'));
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [doctorId, t]);

  React.useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  const weeklySchedule = React.useMemo(() => getWeeklySchedule(doctor?.schedule), [doctor]);

  return (
    <main
      data-testid="doctor-detail-page"
      className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-900"
    >
      <div className="absolute right-4 top-4 z-10">
        <LanguageToggle />
      </div>
      <div className="mx-auto max-w-5xl">
        {loading ? (
          <div data-testid="loading-state" className="py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div data-testid="error-alert">
            <InlineAlert variant="error" title={t('error')} message={error} onRetry={loadDoctor} />
          </div>
        ) : !doctor ? (
          <div data-testid="empty-state">
            <EmptyState
              title={t('home.doctorNotFound')}
              action={
                <Button onClick={() => navigate('/doctors')}>{t('home.backToDoctors')}</Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <i className="pi pi-user text-4xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-950 dark:text-white">
                      {doctor.name}
                    </h1>
                    <p className="mt-2 text-emerald-700 dark:text-emerald-300">
                      {doctorSpecialtyText(doctor, i18n.language)}
                    </p>
                    <p
                      data-testid="doctor-rating-summary"
                      className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      {ratingText(doctor.avgRating, doctor.ratingCount, i18n.language)}
                    </p>
                  </div>
                </div>

                <section>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                    {t('home.biography')}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-gray-600 dark:text-gray-300">
                    {doctor.bio || t('home.noBiographyAvailable')}
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                    {t('home.specialtiesDetailTitle')}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {doctor.specialties.map((specialty) => (
                      <span
                        key={specialty.id}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                      >
                        {specialtyName(specialty, i18n.language)}
                      </span>
                    ))}
                  </div>
                </section>

                {weeklySchedule.length > 0 ? (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                      {t('home.schedule')}
                    </h2>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {weeklySchedule.map((item) => (
                        <div
                          key={`${item.dayOfWeek}-${item.startTime}-${item.endTime}`}
                          className="rounded-lg border border-gray-200 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-slate-900"
                        >
                          <p className="font-medium text-gray-950 dark:text-white">
                            {t(`weekdays.${item.dayOfWeek ?? 0}`)}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {item.startTime} - {item.endTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('home.experience')}
                    </p>
                    <p className="text-lg font-semibold text-gray-950 dark:text-white">
                      {doctor.yearsOfExperience ?? 0} {t('home.yearsExperience')}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => redirectGuestToLogin(navigate, 'book', doctor.id)}
                    data-testid="book-appointment-guest"
                  >
                    {t('home.bookAppointment')}
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => redirectGuestToLogin(navigate, 'ask', doctor.id)}
                    data-testid="ask-question-guest"
                  >
                    {t('home.askQuestion')}
                  </Button>
                  <Button className="w-full" outlined onClick={() => navigate('/doctors')}>
                    {t('home.backToDoctors')}
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};
