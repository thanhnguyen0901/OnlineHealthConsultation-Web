import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Button as PrimeButton } from 'primereact/button';
import type { Schedule } from '../types';

export interface EditableSlot extends Schedule {
  _key: string;
}

interface ScheduleTableProps {
  slots: EditableSlot[];
  loading?: boolean;
  onChange: (key: string, field: keyof Schedule, value: string | boolean) => void;
  onDelete: (key: string) => void;
}

const toTimeOnly = (value: string): Date | null => {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return new Date(1970, 0, 1, h, m, 0, 0);
};

const toTimeString = (value: Date | null): string => {
  if (!value || Number.isNaN(value.getTime())) return '';
  const h = String(value.getHours()).padStart(2, '0');
  const m = String(value.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  slots,
  loading = false,
  onChange,
  onDelete,
}) => {
  const { t, i18n } = useTranslation('doctor');

  const dateTemplate = (rowData: EditableSlot) => (
    <span className="text-gray-800 dark:text-gray-200 tabular-nums">
      {new Date(rowData.date + 'T00:00:00').toLocaleDateString(
        i18n.language === 'vi' ? 'vi-VN' : 'en-US'
      )}
    </span>
  );

  const startTimeTemplate = (rowData: EditableSlot) => (
    <Calendar
      value={toTimeOnly(rowData.startTime)}
      onChange={(e) => onChange(rowData._key, 'startTime', toTimeString((e.value as Date) ?? null))}
      timeOnly
      hourFormat="24"
      className="w-28"
    />
  );

  const endTimeTemplate = (rowData: EditableSlot) => (
    <Calendar
      value={toTimeOnly(rowData.endTime)}
      onChange={(e) => onChange(rowData._key, 'endTime', toTimeString((e.value as Date) ?? null))}
      timeOnly
      hourFormat="24"
      className="w-28"
    />
  );

  const availableTemplate = (rowData: EditableSlot) => (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={rowData.available}
        onChange={(e) => onChange(rowData._key, 'available', !!e.checked)}
        inputId={`avail-${rowData._key}`}
      />
      <label
        htmlFor={`avail-${rowData._key}`}
        className={`text-sm cursor-pointer select-none ${
          rowData.available
            ? 'text-green-600 dark:text-green-400 font-medium'
            : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {rowData.available ? t('available') : t('booked')}
      </label>
    </div>
  );

  const deleteTemplate = (rowData: EditableSlot) => (
    <PrimeButton
      icon="pi pi-trash"
      rounded
      text
      severity="danger"
      size="small"
      onClick={() => onDelete(rowData._key)}
      tooltip={t('deleteSlot')}
      tooltipOptions={{ position: 'left' }}
    />
  );

  return (
    <DataTable
      value={slots}
      loading={loading}
      emptyMessage={t('noSchedule')}
      sortField="date"
      sortOrder={1}
      className="primereact-table"
      scrollable
    >
      <Column
        field="date"
        header={t('scheduleDate')}
        body={dateTemplate}
        sortable
        style={{ width: '160px' }}
      />
      <Column
        field="startTime"
        header={t('startTime')}
        body={startTimeTemplate}
        style={{ width: '150px' }}
      />
      <Column
        field="endTime"
        header={t('endTime')}
        body={endTimeTemplate}
        style={{ width: '150px' }}
      />
      <Column
        field="available"
        header={t('available')}
        body={availableTemplate}
        style={{ width: '160px' }}
      />
      <Column body={deleteTemplate} style={{ width: '70px' }} />
    </DataTable>
  );
};
