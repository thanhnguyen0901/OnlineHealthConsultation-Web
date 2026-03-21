import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { BarChartWidget } from '@/components/charts/BarChartWidget';
import { Spinner } from '@/components/common/Spinner';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadStatisticsRequested,
  loadAppointmentsChartRequested,
  loadQuestionsChartRequested,
} from '../redux/reports.slice';
import {
  selectReportsStatistics,
  selectReportsAppointmentsChart,
  selectReportsQuestionsChart,
  selectReportsLoading,
  selectReportsError,
} from '../redux/reports.selectors';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';

export const ReportsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const dispatch = useAppDispatch();
  const statistics = useAppSelector(selectReportsStatistics);
  const appointmentsChart = useAppSelector(selectReportsAppointmentsChart);
  const questionsChart = useAppSelector(selectReportsQuestionsChart);
  const loading = useAppSelector(selectReportsLoading);
  const error = useAppSelector(selectReportsError);

  const localizedQuestionsChart = questionsChart.map((entry) => ({
    ...entry,
    name: translateEnumValue(t, 'status', entry.name),
  }));

  useEffect(() => {
    dispatch(loadStatisticsRequested());
    dispatch(loadAppointmentsChartRequested());
    dispatch(loadQuestionsChartRequested());
  }, [dispatch]);

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('admin:reports')}
        </h1>
        {error && (
          <InlineAlert
            variant="error"
            title={
              isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')
            }
            message={error}
            onRetry={() => {
              dispatch(loadStatisticsRequested());
              dispatch(loadAppointmentsChartRequested());
              dispatch(loadQuestionsChartRequested());
            }}
            className="mb-4"
          />
        )}

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-users text-5xl mb-3 opacity-90"></i>
                <p className="text-blue-100 text-sm font-medium mb-2">{t('admin:totalUsers')}</p>
                <p className="text-4xl font-bold">{statistics.totalUsers}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-user-plus text-5xl mb-3 opacity-90"></i>
                <p className="text-green-100 text-sm font-medium mb-2">{t('admin:totalDoctors')}</p>
                <p className="text-4xl font-bold">{statistics.totalDoctors}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-calendar text-5xl mb-3 opacity-90"></i>
                <p className="text-purple-100 text-sm font-medium mb-2">{t('admin:totalAppointments')}</p>
                <p className="text-4xl font-bold">{statistics.totalAppointments}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-question-circle text-5xl mb-3 opacity-90"></i>
                <p className="text-orange-100 text-sm font-medium mb-2">{t('admin:totalQuestions')}</p>
                <p className="text-4xl font-bold">{statistics.totalQuestions}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-bolt text-5xl mb-3 opacity-90"></i>
                <p className="text-cyan-100 text-sm font-medium mb-2">{t('admin:totalActiveUsers')}</p>
                <p className="text-4xl font-bold">{statistics.totalActiveUsers}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-clock text-5xl mb-3 opacity-90"></i>
                <p className="text-amber-100 text-sm font-medium mb-2">
                  {t('admin:pendingAppointments')}
                </p>
                <p className="text-4xl font-bold">{statistics.pendingAppointments}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-check-circle text-5xl mb-3 opacity-90"></i>
                <p className="text-emerald-100 text-sm font-medium mb-2">
                  {t('admin:completedAppointments')}
                </p>
                <p className="text-4xl font-bold">{statistics.completedAppointments}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-star text-5xl mb-3 opacity-90"></i>
                <p className="text-pink-100 text-sm font-medium mb-2">{t('admin:totalRatings')}</p>
                <p className="text-4xl font-bold">{statistics.totalRatings}</p>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-slate-900 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
              {t('common:questionsDistribution')}
            </h2>
            <div className="p-4">
              {questionsChart.length > 0 ? (
                <PieChartWidget data={localizedQuestionsChart} />
              ) : (
                <div className="text-center py-12">
                  <i className="pi pi-chart-pie text-5xl text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('common:noData')}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
              {t('common:appointmentsTrends')}
            </h2>
            <div className="p-4">
              {appointmentsChart.length > 0 ? (
                <BarChartWidget
                  key={`reports-bar-${i18n.language}`}
                  data={appointmentsChart}
                  dataKeys={['appointments', 'questions']}
                  xAxisKey="date"
                  seriesLabels={{
                    appointments: t('admin:totalAppointments'),
                    questions: t('admin:totalQuestions'),
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <i className="pi pi-chart-bar text-5xl text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('common:noData')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
