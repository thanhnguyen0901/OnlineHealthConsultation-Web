import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Button } from '@/components/common/Button';

type PendingChange = {
  appointmentId: string;
  patientName: string;
  oldStatus: string;
  newStatus: string;
} | null;
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadAppointmentsRequested, updateAppointmentStatusRequested } from '../redux/admin.slice';
import { selectAdminAppointments, selectAdminLoading, selectAdminAppointmentsPagination } from '../redux/admin.selectors';

export const AppointmentsManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectAdminAppointments);
  const loading = useAppSelector(selectAdminLoading);
  const appointmentsPagination = useAppSelector(selectAdminAppointmentsPagination);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [first, setFirst] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pendingChange, setPendingChange] = useState<PendingChange>(null);

  useEffect(() => {
    const page = Math.floor(first / pageSize) + 1;
    const params: { page: number; limit: number; status?: string; startDate?: string; endDate?: string } = {
      page,
      limit: pageSize,
    };
    if (statusFilter && typeof statusFilter === 'string') params.status = statusFilter;
    if (dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].toISOString();
      params.endDate = dateRange[1].toISOString();
    }
    dispatch(loadAppointmentsRequested(params));
  }, [dispatch, first, pageSize, statusFilter, dateRange]);

  const statusOptions = [
    { label: t('all'), value: '' },
    { label: t('pending'), value: 'pending' },
    { label: t('confirmed'), value: 'confirmed' },
    { label: t('completed'), value: 'completed' },
    { label: t('cancelled'), value: 'cancelled' },
  ];

  // All filtering is now API-driven; no client-side filtering needed
  const filteredAppointments = appointments;

  const handleStatusChange = (rowData: any, newStatus: string) => {
    if (newStatus === rowData.status) return;
    setPendingChange({
      appointmentId: rowData.id,
      patientName: rowData.patientName ?? rowData.id,
      oldStatus: rowData.status,
      newStatus,
    });
  };

  const confirmChange = () => {
    if (!pendingChange) return;
    dispatch(updateAppointmentStatusRequested({ id: pendingChange.appointmentId, status: pendingChange.newStatus }));
    setPendingChange(null);
  };

  const cancelChange = () => setPendingChange(null);

  const statusBodyTemplate = (rowData: any) => {
    // Always reads from Redux state (rowData.status) — revert on cancel is free
    return (
      <Dropdown
        value={rowData.status}
        options={statusOptions.filter((opt) => opt.value !== '')}
        onChange={(e) => handleStatusChange(rowData, e.value)}
        disabled={pendingChange !== null}
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
                optionLabel="label"
                optionValue="value"
                onChange={(e) => { setFirst(0); setStatusFilter(e.value as string); }}
                placeholder={t('all')}
                className="w-48"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('dateRange')}
              </label>
              <Calendar
                value={dateRange}
                onChange={(e) => { setFirst(0); setDateRange(e.value as Date[]); }}
                selectionMode="range"
                readOnlyInput
                showIcon
                placeholder="Select date range"
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
            lazy
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 20, 50]}
            first={first}
            totalRecords={appointmentsPagination?.total ?? 0}
            onPage={(e: any) => { setFirst(e.first); setPageSize(e.rows); }}
            loading={loading}
            emptyMessage={t('noAppointments')}
            className="primereact-table"
          >
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

        <Dialog
          visible={pendingChange !== null}
          style={{ width: '32rem' }}
          header={t('statusChangeConfirmTitle', 'Confirm Status Change')}
          modal
          focusOnShow
          footer={
            <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
              <Button label={t('cancel')} variant="secondary" onClick={cancelChange} />
              <Button label={t('confirm')} onClick={confirmChange} />
            </div>
          }
          onHide={cancelChange}
          className="p-dialog-custom"
        >
          <div className="px-6 pt-2 pb-1 space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              {t('statusChangeConfirmBody', 'Are you sure you want to change this appointment\'s status?')}
            </p>
            <dl className="text-sm space-y-1">
              <div className="flex gap-2">
                <dt className="font-medium text-gray-600 dark:text-gray-400 w-28 shrink-0">{t('patient')}:</dt>
                <dd className="text-gray-900 dark:text-gray-100">{pendingChange?.patientName}</dd>
              </div>
              <div className="flex gap-2 items-center">
                <dt className="font-medium text-gray-600 dark:text-gray-400 w-28 shrink-0">{t('status')}:</dt>
                <dd className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="capitalize">{pendingChange?.oldStatus}</span>
                  <span className="text-gray-400">→</span>
                  <span className="capitalize font-semibold">{pendingChange?.newStatus}</span>
                </dd>
              </div>
            </dl>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
