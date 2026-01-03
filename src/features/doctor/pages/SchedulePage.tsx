import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadScheduleRequested } from '../redux/doctor.slice';
import { selectSchedules, selectDoctorLoading } from '../redux/doctor.selectors';
import type { Schedule } from '../types';

export const SchedulePage: React.FC = () => {
  const { t } = useTranslation('doctor');
  const dispatch = useAppDispatch();
  const schedules = useAppSelector(selectSchedules);
  const loading = useAppSelector(selectDoctorLoading);

  useEffect(() => {
    dispatch(loadScheduleRequested());
  }, [dispatch]);

  const dateTemplate = (rowData: Schedule) => {
    return new Date(rowData.date).toLocaleDateString('vi-VN');
  };

  const statusTemplate = (rowData: Schedule) => {
    return rowData.available ? (
      <Tag value={t('available')} severity="success" />
    ) : (
      <Tag value={t('booked')} severity="warning" />
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('schedule')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <DataTable
            value={schedules}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noSchedule')}
            sortField="date"
            sortOrder={1}
            className="primereact-table"
          >
            <Column
              field="date"
              header={t('date')}
              body={dateTemplate}
              sortable
              style={{ width: '180px' }}
            />
            <Column field="startTime" header={t('startTime')} style={{ width: '140px' }} />
            <Column field="endTime" header={t('endTime')} style={{ width: '140px' }} />
            <Column
              field="available"
              header={t('status')}
              body={statusTemplate}
              style={{ width: '150px' }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};
