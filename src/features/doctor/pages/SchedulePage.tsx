import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
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
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('schedule')}</h1>
      <Card>
        <DataTable
          value={schedules}
          paginator
          rows={10}
          loading={loading}
          emptyMessage={t('noSchedule')}
          sortField="date"
          sortOrder={1}
        >
          <Column field="date" header={t('date')} body={dateTemplate} sortable />
          <Column field="startTime" header={t('startTime')} />
          <Column field="endTime" header={t('endTime')} />
          <Column field="available" header={t('status')} body={statusTemplate} />
        </DataTable>
      </Card>
    </div>
  );
};
