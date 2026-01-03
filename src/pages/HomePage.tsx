import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { ROUTE_PATHS } from '@/constants/routePaths';
import apiClient from '@/apis/core/apiClient';

interface FeaturedDoctor {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  bio: string;
  avatar?: string;
}

export const HomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<FeaturedDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedDoctors = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: FeaturedDoctor[] }>(
          '/doctors/featured'
        );
        setDoctors(response.data.data || []);
      } catch (error) {
        // Silently fail - featured doctors are optional on home page
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
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
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">
              {t('home.noDoctorsAvailable')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-xl transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                      {doctor.avatar ? (
                        <img
                          src={doctor.avatar}
                          alt={doctor.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <i className="pi pi-user text-4xl text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {doctor.specialty}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {doctor.experienceYears} {t('home.yearsExperience')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{doctor.bio}</p>
                  </div>
                </Card>
              ))}
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
            className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100"
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
