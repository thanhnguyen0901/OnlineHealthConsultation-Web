import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Rating } from 'primereact/rating';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadRatingsRequested } from '../redux/doctor.slice';
import {
  selectDoctorRatings,
  selectDoctorRatingsPagination,
  selectDoctorLoading,
  selectDoctorProfile,
} from '../redux/doctor.selectors';
import type { DoctorRating } from '../types';

export const DoctorRatingsPage: React.FC = () => {
  const { t } = useTranslation('doctor');
  const dispatch = useAppDispatch();
  const ratings = useAppSelector(selectDoctorRatings);
  const pagination = useAppSelector(selectDoctorRatingsPagination);
  const loading = useAppSelector(selectDoctorLoading);
  const profile = useAppSelector(selectDoctorProfile);

  useEffect(() => {
    dispatch(loadRatingsRequested({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Prefer profile.stats for aggregates if loaded; fall back to pagination total.
  const avgRating: number =
    profile?.ratingAverage ??
    (ratings.length > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10) / 10
      : 0);
  const totalRatings: number = profile?.ratingCount ?? pagination?.total ?? ratings.length;

  const scoreTemplate = (rowData: DoctorRating) => (
    <Rating value={rowData.score} readOnly cancel={false} className="text-yellow-500" />
  );

  const patientTemplate = (rowData: DoctorRating) => {
    const u = rowData.patient?.user;
    if (!u?.firstName && !u?.lastName)
      return <span className="text-gray-400 italic">{t('anonymous')}</span>;
    return <span>{`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()}</span>;
  };

  const commentTemplate = (rowData: DoctorRating) =>
    rowData.comment ? (
      <span className="text-gray-800 dark:text-gray-200">{rowData.comment}</span>
    ) : (
      <span className="text-gray-400 italic">—</span>
    );

  const dateTemplate = (rowData: DoctorRating) =>
    new Date(rowData.createdAt).toLocaleDateString('vi-VN');

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('ratings')}
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('averageRating')}
            </span>
            <span className="text-4xl font-bold text-yellow-500">
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </span>
            {avgRating > 0 && <Rating value={Math.round(avgRating)} readOnly cancel={false} />}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('totalRatings')}
            </span>
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {totalRatings}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <DataTable
            value={ratings}
            paginator={pagination ? pagination.totalPages > 1 : false}
            rows={pagination?.limit ?? 20}
            totalRecords={pagination?.total ?? ratings.length}
            loading={loading}
            emptyMessage={t('noRatings')}
            className="primereact-table"
            lazy={false}
          >
            <Column header={t('ratingScore')} body={scoreTemplate} style={{ width: '180px' }} />
            <Column header={t('patientName')} body={patientTemplate} style={{ width: '180px' }} />
            <Column header={t('ratingComment')} body={commentTemplate} />
            <Column header={t('ratingDate')} body={dateTemplate} style={{ width: '140px' }} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};
