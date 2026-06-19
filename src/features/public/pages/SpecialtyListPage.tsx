import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineAlert } from '@/components/common/InlineAlert';
import { Spinner } from '@/components/common/Spinner';
import { getPublicSpecialties } from '../apis/public.api';
import type { PublicSpecialty } from '../types';
import { specialtyName } from './publicPageUtils';

export const SpecialtyListPage: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [specialties, setSpecialties] = React.useState<PublicSpecialty[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadSpecialties = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSpecialties(await getPublicSpecialties());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpectedError'));
      setSpecialties([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);

  return (
    <main
      data-testid="specialty-list-page"
      className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Specialties</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Browse active medical specialties and find matching doctors.
            </p>
          </div>
          <Button onClick={() => navigate('/doctors')} outlined>
            View doctors
          </Button>
        </div>

        {loading ? (
          <div data-testid="loading-state" className="py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div data-testid="error-alert">
            <InlineAlert variant="error" title={t('error')} message={error} onRetry={loadSpecialties} />
          </div>
        ) : specialties.length === 0 ? (
          <div data-testid="empty-state">
            <EmptyState title="No specialties available" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specialties.map((specialty) => (
              <div
                key={specialty.id}
                className="flex min-h-48 flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                data-testid={`specialty-card-${specialty.id}`}
              >
                <div className="flex h-full flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                      {specialtyName(specialty, i18n.language)}
                    </h2>
                    {specialty.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                        {specialty.description}
                      </p>
                    )}
                  </div>
                  <Button
                    className="mt-auto w-full"
                    onClick={() => navigate(`/doctors?specialtyId=${specialty.id}`)}
                  >
                    Find doctors
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
