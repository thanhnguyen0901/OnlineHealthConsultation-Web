import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadDoctorAppointmentsRequested,
  updateDoctorAppointmentRequested,
} from '../redux/doctor.slice';
import {
  selectDoctorAppointments,
  selectDoctorLoading,
  selectDoctorError,
} from '../redux/doctor.selectors';
import { useToast } from '@/hooks/useToast';
import type { DoctorAppointment } from '../types';

/** Returns the status options the doctor can transition to from the current status. */
const getNextStatuses = (
  current: DoctorAppointment['status']
): { label: string; value: string }[] => {
  switch (current) {
    case 'pending':
      return [
        { label: 'Confirm', value: 'confirmed' },
        { label: 'Cancel', value: 'cancelled' },
      ];
    case 'confirmed':
      return [
        { label: 'Complete', value: 'completed' },
        { label: 'Cancel', value: 'cancelled' },
      ];
    default:
      return [];
  }
};

export const DoctorAppointmentsPage: React.FC = () => {
  const { t } = useTranslation('doctor');
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectDoctorAppointments);
  const loading = useAppSelector(selectDoctorLoading);
  const doctorError = useAppSelector(selectDoctorError);
  const { showError } = useToast();

  useEffect(() => {
    dispatch(loadDoctorAppointmentsRequested());
  }, [dispatch]);

  useEffect(() => {
    if (doctorError) showError(doctorError);
  }, [doctorError, showError]);

  const statusTemplate = (rowData: DoctorAppointment) => {
    const statusMap: Record<
      string,
      { severity: 'success' | 'warning' | 'danger' | 'info'; label: string }
    > = {
      pending: { severity: 'warning', label: t('pending') },
      confirmed: { severity: 'info', label: t('confirmed') },
      completed: { severity: 'success', label: t('completed') },
      cancelled: { severity: 'danger', label: t('cancelled') },
    };
    const config = statusMap[rowData.status] || { severity: 'info', label: rowData.status };
    return <Tag value={config.label} severity={config.severity} />;
  };

  const dateTemplate = (rowData: DoctorAppointment) =>
    new Date(rowData.date).toLocaleDateString('vi-VN');

  const actionsTemplate = (rowData: DoctorAppointment) => {
    const options = getNextStatuses(rowData.status);
    if (options.length === 0) return <span className="text-gray-400 text-sm italic">—</span>;

    return (
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <Button
            key={opt.value}
            label={opt.label}
            size="sm"
            variant={opt.value === 'cancelled' ? 'danger' : 'primary'}
            onClick={() =>
              dispatch(
                updateDoctorAppointmentRequested({ id: rowData.id, status: opt.value })
              )
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('appointments')}
          </h1>
          <Button
            label={t('refresh') || 'Refresh'}
            icon="pi pi-refresh"
            size="sm"
            variant="secondary"
            onClick={() => dispatch(loadDoctorAppointmentsRequested())}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <DataTable
            value={appointments}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noAppointments')}
            className="primereact-table"
            sortField="date"
            sortOrder={1}
          >
            <Column
              field="patientName"
              header={t('patient')}
              sortable
              style={{ width: '180px' }}
            />
            <Column
              field="specialtyName"
              header={t('specialty')}
              sortable
              style={{ width: '160px' }}
            />
            <Column
              field="date"
              header={t('date')}
              body={dateTemplate}
              sortable
              style={{ width: '120px' }}
            />
            <Column field="time" header={t('time')} style={{ width: '100px' }} />
            <Column field="reason" header={t('reason')} />
            <Column
              field="status"
              header={t('status')}
              body={statusTemplate}
              sortable
              style={{ width: '140px' }}
            />
            <Column
              body={actionsTemplate}
              header={t('actions')}
              style={{ width: '200px' }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};
