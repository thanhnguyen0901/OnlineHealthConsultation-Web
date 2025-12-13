import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { BarChartWidget } from '@/components/charts/BarChartWidget';
import { Spinner } from '@/components/common/Spinner';
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
} from '../redux/reports.selectors';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const statistics = useAppSelector(selectReportsStatistics);
  const appointmentsChart = useAppSelector(selectReportsAppointmentsChart);
  const questionsChart = useAppSelector(selectReportsQuestionsChart);
  const loading = useAppSelector(selectReportsLoading);

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
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">{t('reports')}</h1>
        
        {/* Statistics Cards */}
        {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-users text-5xl mb-3 opacity-90"></i>
              <p className="text-blue-100 text-sm font-medium mb-2">{t('totalUsers')}</p>
              <p className="text-4xl font-bold">{statistics.totalUsers}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-user-plus text-5xl mb-3 opacity-90"></i>
              <p className="text-green-100 text-sm font-medium mb-2">{t('totalDoctors')}</p>
              <p className="text-4xl font-bold">{statistics.totalDoctors}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-calendar text-5xl mb-3 opacity-90"></i>
              <p className="text-purple-100 text-sm font-medium mb-2">{t('totalAppointments')}</p>
              <p className="text-4xl font-bold">{statistics.totalAppointments}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-question-circle text-5xl mb-3 opacity-90"></i>
              <p className="text-orange-100 text-sm font-medium mb-2">{t('totalQuestions')}</p>
              <p className="text-4xl font-bold">{statistics.totalQuestions}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-900 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            {t('questionsDistribution')}
          </h2>
          <div className="p-4">
            {questionsChart.length > 0 ? (
              <PieChartWidget data={questionsChart} />
            ) : (
              <div className="text-center py-12">
                <i className="pi pi-chart-pie text-5xl text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            {t('appointmentsTrends')}
          </h2>
          <div className="p-4">
            {appointmentsChart.length > 0 ? (
              <BarChartWidget
                data={appointmentsChart}
                dataKeys={['appointments', 'questions']}
                xAxisKey="date"
              />
            ) : (
              <div className="text-center py-12">
                <i className="pi pi-chart-bar text-5xl text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
};
