import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadAppointmentsRequested, updateAppointmentStatusRequested } from '../redux/admin.slice';
import { selectAdminAppointments, selectAdminLoading } from '../redux/admin.selectors';

export const AppointmentsManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectAdminAppointments);
  const loading = useAppSelector(selectAdminLoading);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<Date[]>([]);

  useEffect(() => {
    dispatch(loadAppointmentsRequested());
  }, [dispatch]);

  const statusOptions = [
    { label: t('all'), value: '' },
    { label: t('pending'), value: 'pending' },
    { label: t('confirmed'), value: 'confirmed' },
    { label: t('completed'), value: 'completed' },
    { label: t('cancelled'), value: 'cancelled' },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter && apt.status !== statusFilter) return false;
    if (dateRange.length === 2) {
      const aptDate = new Date(apt.date);
      if (aptDate < dateRange[0] || aptDate > dateRange[1]) return false;
    }
    return true;
  });

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    dispatch(updateAppointmentStatusRequested({ id: appointmentId, status: newStatus }));
  };

  const statusBodyTemplate = (rowData: any) => {
    return (
      <Dropdown
        value={rowData.status}
        options={statusOptions.filter((opt) => opt.value !== '')}
        onChange={(e) => handleStatusChange(rowData.id, e.value)}
        className="w-full"
      />
    );
  };

  const dateBodyTemplate = (rowData: any) => {
    return new Date(rowData.date).toLocaleDateString();
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('manageAppointments')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <div className="mb-6 flex gap-4 flex-wrap items-end">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('status')}
              </label>
              <Dropdown
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => setStatusFilter(e.value)}
                className="w-48"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('dateRange')}
              </label>
              <Calendar
                value={dateRange}
                onChange={(e) => setDateRange(e.value as Date[])}
                selectionMode="range"
                readOnlyInput
                showIcon
                className="w-72"
              />
            </div>
            {(statusFilter || dateRange.length > 0) && (
              <div>
                <Button
                  icon="pi pi-times"
                  variant="secondary"
                  onClick={() => {
                    setStatusFilter('');
                    setDateRange([]);
                  }}
                >
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </div>
          <DataTable
            value={filteredAppointments}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noAppointments')}
            className="text-sm"
          >
            <Column field="id" header="ID" style={{ width: '80px' }} sortable />
            <Column field="patientName" header={t('patient')} sortable />
            <Column field="doctorName" header={t('doctor')} sortable />
            <Column
              field="specialtyName"
              header={t('specialty')}
              sortable
              style={{ width: '150px' }}
            />
            <Column
              field="date"
              header={t('date')}
              body={dateBodyTemplate}
              sortable
              style={{ width: '120px' }}
            />
            <Column field="time" header={t('time')} sortable style={{ width: '100px' }} />
            <Column
              field="status"
              header={t('status')}
              body={statusBodyTemplate}
              style={{ width: '200px' }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};
