import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { BarChartWidget } from '@/components/charts/BarChartWidget';
import { Spinner } from '@/components/common/Spinner';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadStatisticsRequested,
  loadAppointmentsChartRequested,
} from '../redux/reports.slice';
import {
  selectReportsStatistics,
  selectReportsAppointmentsChart,
  selectReportsLoading,
  selectReportsError,
} from '../redux/reports.selectors';
import { isUnauthorizedMessage } from '@/utils/authz';
import type { ReportFilters } from '../types';

const toStartOfDayIso = (date: string) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined);
const toEndOfDayIso = (date: string) => (date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined);

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const dispatch = useAppDispatch();
  const statistics = useAppSelector(selectReportsStatistics);
  const appointmentsChart = useAppSelector(selectReportsAppointmentsChart);
  const loading = useAppSelector(selectReportsLoading);
  const error = useAppSelector(selectReportsError);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [groupBy, setGroupBy] = useState<ReportFilters['groupBy']>('day');

  const filters = useMemo<ReportFilters>(
    () => ({
      from: toStartOfDayIso(fromDate),
      to: toEndOfDayIso(toDate),
      groupBy,
    }),
    [fromDate, groupBy, toDate]
  );

  const loadReportData = (nextFilters = filters) => {
    dispatch(loadStatisticsRequested(nextFilters));
    dispatch(loadAppointmentsChartRequested(nextFilters));
  };

  useEffect(() => {
    loadReportData(filters);
  }, [dispatch]);

  const applyFilters = () => loadReportData(filters);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setGroupBy('day');
    loadReportData({ groupBy: 'day' });
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8" data-testid="reports-page">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('admin:reports')}
        </h1>
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => {
              loadReportData(filters);
            }}
            className="mb-4"
          />
        )}

        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_180px_auto_auto] md:items-end">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin:fromDate')}
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-slate-950 dark:text-gray-100"
              />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin:toDate')}
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-slate-950 dark:text-gray-100"
              />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin:groupBy')}
              <select
                value={groupBy}
                onChange={(event) => setGroupBy(event.target.value as ReportFilters['groupBy'])}
                className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-slate-950 dark:text-gray-100"
              >
                <option value="day">{t('admin:groupByDay')}</option>
                <option value="week">{t('admin:groupByWeek')}</option>
                <option value="month">{t('admin:groupByMonth')}</option>
              </select>
            </label>
            <button
              type="button"
              onClick={applyFilters}
              className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
            >
              {t('admin:applyFilters')}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded-md bg-gray-200 px-4 text-sm font-medium text-gray-900 hover:bg-gray-300 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              disabled={loading}
            >
              {t('admin:clearFilters')}
            </button>
          </div>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-users text-5xl mb-3 opacity-90"></i>
                <p className="text-blue-100 text-sm font-medium mb-2">
                  {t('admin:totalActiveUsers')}
                </p>
                <p className="text-4xl font-bold">{statistics.totalActiveUsers}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-user-plus text-5xl mb-3 opacity-90"></i>
                <p className="text-green-100 text-sm font-medium mb-2">
                  {t('admin:totalConsultations')}
                </p>
                <p className="text-4xl font-bold">{statistics.totalConsultations}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-calendar text-5xl mb-3 opacity-90"></i>
                <p className="text-purple-100 text-sm font-medium mb-2">
                  {t('admin:totalAppointments')}
                </p>
                <p className="text-4xl font-bold">{statistics.totalAppointments}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-question-circle text-5xl mb-3 opacity-90"></i>
                <p className="text-orange-100 text-sm font-medium mb-2">
                  {t('admin:completedAppointments')}
                </p>
                <p className="text-4xl font-bold">{statistics.completedAppointments}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg">
              <div className="text-center p-4">
                <i className="pi pi-bolt text-5xl mb-3 opacity-90"></i>
                <p className="text-cyan-100 text-sm font-medium mb-2">
                  {t('admin:totalActiveUsers')}
                </p>
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

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white dark:bg-slate-900 shadow-sm" data-testid="reports-chart">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
              {t('admin:consultationTrend')}
            </h2>
            <div className="p-4">
              {appointmentsChart.length > 0 ? (
                <BarChartWidget
                  data={appointmentsChart}
                  dataKeys={['consultations']}
                  xAxisKey="date"
                  seriesLabels={{
                    consultations: t('admin:totalConsultations'),
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
