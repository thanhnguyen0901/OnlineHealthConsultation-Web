import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from '@/components/common/Button';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { Spinner } from '@/components/common/Spinner';
import { InlineAlert } from '@/components/common/InlineAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { extractErrorMessage } from '@/utils/errorMessage';
import {
  getPublicDoctors,
  getPublicHome,
  getPublicSpecialties,
} from '@/features/public/apis/public.api';
import type { PublicDoctor, PublicSpecialty } from '@/features/public/types';
import {
  doctorSpecialtyText,
  ratingText,
  redirectGuestToLogin,
  specialtyName,
} from '@/features/public/pages/publicPageUtils';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [specialties, setSpecialties] = useState<PublicSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchPublicHome = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [, doctorResult, specialtyList] = await Promise.all([
        getPublicHome(),
        getPublicDoctors({ page: 1, limit: 6 }),
        getPublicSpecialties(),
      ]);
      setDoctors(doctorResult.data);
      setSpecialties(specialtyList.slice(0, 6));
    } catch (error) {
      setDoctors([]);
      setSpecialties([]);
      setLoadError(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicHome();
  }, []);

  return (
    <div
      data-testid="home-page"
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <div className="absolute right-4 top-4 z-10">
        <LanguageToggle />
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate(ROUTE_PATHS.LOGIN)} className="px-8 py-3 text-lg">
              {t('login')}
            </Button>
            <Button
              onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              className="px-8 py-3 text-lg"
              outlined
            >
              {t('register')}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-12 dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('home.specialtiesTitle')}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {t('home.specialtiesSubtitle')}
              </p>
            </div>
            <Button outlined onClick={() => navigate('/specialties')}>
              {t('home.viewAll')}
            </Button>
          </div>

          {loading ? (
            <div data-testid="loading-state" className="py-8">
              <Spinner size="lg" />
            </div>
          ) : specialties.length === 0 && !loadError ? (
            <div data-testid="empty-state">
              <EmptyState title={t('home.noSpecialtiesAvailable')} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {specialties.map((specialty) => (
                <button
                  key={specialty.id}
                  type="button"
                  data-testid={`specialty-card-${specialty.id}`}
                  onClick={() => navigate(`/doctors?specialtyId=${specialty.id}`)}
                  className="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <span className="text-lg font-semibold text-gray-950 dark:text-white">
                    {specialtyName(specialty, i18n.language)}
                  </span>
                  {specialty.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {specialty.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t('home.featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 rounded-full p-6 mb-4">
                  <i className="pi pi-question-circle text-4xl text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {t('home.feature1Title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{t('home.feature1Desc')}</p>
              </div>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center">
                <div className="bg-green-500 rounded-full p-6 mb-4">
                  <i className="pi pi-calendar-plus text-4xl text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {t('home.feature2Title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{t('home.feature2Desc')}</p>
              </div>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 rounded-full p-6 mb-4">
                  <i className="pi pi-comments text-4xl text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {t('home.feature3Title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{t('home.feature3Desc')}</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t('home.featuredDoctors')}
          </h2>

          {loading ? (
            <div data-testid="loading-state" className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : loadError ? (
            <div data-testid="error-alert">
              <InlineAlert
                variant="warning"
                title={t('error')}
                message={loadError}
                onRetry={fetchPublicHome}
              />
            </div>
          ) : doctors.length === 0 ? (
            <div data-testid="empty-state">
              <EmptyState title={t('home.noDoctorsAvailable')} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  data-testid="home-doctor-card"
                >
                  <div className="flex h-full flex-col items-center text-center">
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <i className="pi pi-user text-4xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {doctorSpecialtyText(doctor, i18n.language)}
                    </p>
                    {doctor.yearsOfExperience !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {doctor.yearsOfExperience} {t('home.yearsExperience')}
                      </p>
                    )}
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {ratingText(doctor.avgRating, doctor.ratingCount, i18n.language)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                      {doctor.bio || t('home.noBiographyAvailable')}
                    </p>
                    <div className="mt-auto grid w-full grid-cols-1 gap-3 pt-6 sm:grid-cols-3">
                      <Button
                        size="sm"
                        outlined
                        className="w-full"
                        onClick={() => navigate(`/doctors/${doctor.id}`)}
                      >
                        {t('home.detail')}
                      </Button>
                      <Button
                        size="sm"
                        className="w-full"
                        data-testid="home-book-cta"
                        onClick={() => redirectGuestToLogin(navigate, 'book', doctor.id)}
                      >
                        {t('home.book')}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        data-testid="home-ask-cta"
                        onClick={() => redirectGuestToLogin(navigate, 'ask', doctor.id)}
                      >
                        {t('home.ask')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !loadError && doctors.length > 0 && (
            <div className="mt-8 text-center">
              <Button outlined onClick={() => navigate('/doctors')}>
                {t('home.viewAllDoctors')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">{t('home.ctaTitle')}</h2>
          <p className="text-xl text-blue-100 mb-8">{t('home.ctaSubtitle')}</p>
          <Button
            onClick={() => navigate(ROUTE_PATHS.REGISTER)}
            className="px-8 py-3 text-lg !bg-white !text-blue-700 hover:!bg-blue-50"
          >
            {t('home.getStarted')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{t('pageNotFound')}</p>
        <Button onClick={() => navigate(ROUTE_PATHS.HOME)}>{t('backToHome')}</Button>
      </div>
    </div>
  );
};
