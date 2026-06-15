import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from '@/components/common/Button';
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

  return (
    <main
      data-testid="doctor-detail-page"
      className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-900"
    >
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
            <EmptyState title="Doctor not found" action={<Button onClick={() => navigate('/doctors')}>Back to doctors</Button>} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
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
                      {ratingText(doctor.avgRating, doctor.ratingCount)}
                    </p>
                  </div>
                </div>

                <section>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Biography</h2>
                  <p className="mt-2 whitespace-pre-line text-gray-600 dark:text-gray-300">
                    {doctor.bio || 'No biography has been provided yet.'}
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                    Specialties
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

                {doctor.schedule ? (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                      Schedule
                    </h2>
                    <pre className="mt-2 max-h-52 overflow-auto rounded-lg bg-gray-100 p-3 text-sm text-gray-700 dark:bg-slate-800 dark:text-gray-200">
                      {JSON.stringify(doctor.schedule, null, 2)}
                    </pre>
                  </section>
                ) : null}
              </div>
            </Card>

            <aside className="space-y-4">
              <Card>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                    <p className="text-lg font-semibold text-gray-950 dark:text-white">
                      {doctor.yearsOfExperience ?? 0} years
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => redirectGuestToLogin(navigate, 'book', doctor.id)}
                    data-testid="book-appointment-guest"
                  >
                    Book appointment
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => redirectGuestToLogin(navigate, 'ask', doctor.id)}
                    data-testid="ask-question-guest"
                  >
                    Ask question
                  </Button>
                  <Button className="w-full" outlined onClick={() => navigate('/doctors')}>
                    Back to doctors
                  </Button>
                </div>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};
