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
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('reports')}</h1>
      
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('totalUsers')}</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalUsers}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('totalDoctors')}</p>
              <p className="text-3xl font-bold text-green-600">{statistics.totalDoctors}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('totalAppointments')}</p>
              <p className="text-3xl font-bold text-purple-600">{statistics.totalAppointments}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('totalQuestions')}</p>
              <p className="text-3xl font-bold text-orange-600">{statistics.totalQuestions}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title={t('questionsDistribution')}>
          {questionsChart.length > 0 ? (
            <PieChartWidget data={questionsChart} />
          ) : (
            <p className="text-center text-gray-500">{t('noData')}</p>
          )}
        </Card>
        <Card title={t('appointmentsTrends')}>
          {appointmentsChart.length > 0 ? (
            <BarChartWidget
              data={appointmentsChart}
              dataKeys={['appointments', 'questions']}
              xAxisKey="date"
            />
          ) : (
            <p className="text-center text-gray-500">{t('noData')}</p>
          )}
        </Card>
      </div>
    </div>
  );
};
