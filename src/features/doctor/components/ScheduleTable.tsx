import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button as PrimeButton } from 'primereact/button';
import type { Schedule } from '../types';

/** Schedule slot augmented with a stable local key for React editing. */
export interface EditableSlot extends Schedule {
  _key: string;
}

interface ScheduleTableProps {
  slots: EditableSlot[];
  loading?: boolean;
  onChange: (key: string, field: keyof Schedule, value: string | boolean) => void;
  onDelete: (key: string) => void;
}

const TIME_CLASS = [
  'border border-gray-300 dark:border-gray-600 rounded px-2 py-1',
  'text-center w-24 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100',
  'focus:outline-none focus:ring-2 focus:ring-blue-500',
].join(' ');

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  slots,
  loading = false,
  onChange,
  onDelete,
}) => {
  const { t } = useTranslation('doctor');

  const dateTemplate = (rowData: EditableSlot) => (
    <span className="text-gray-800 dark:text-gray-200 tabular-nums">
      {new Date(rowData.date + 'T00:00:00').toLocaleDateString('vi-VN')}
    </span>
  );

  const startTimeTemplate = (rowData: EditableSlot) => (
    <input
      type="time"
      value={rowData.startTime}
      onChange={(e) => onChange(rowData._key, 'startTime', e.target.value)}
      className={TIME_CLASS}
    />
  );

  const endTimeTemplate = (rowData: EditableSlot) => (
    <input
      type="time"
      value={rowData.endTime}
      onChange={(e) => onChange(rowData._key, 'endTime', e.target.value)}
      className={TIME_CLASS}
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

