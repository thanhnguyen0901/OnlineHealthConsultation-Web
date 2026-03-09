import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'primereact/dialog';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadScheduleRequested,
  updateScheduleRequested,
  clearScheduleUpdated,
} from '../redux/doctor.slice';
import {
  selectSchedules,
  selectDoctorLoading,
  selectScheduleUpdated,
} from '../redux/doctor.selectors';
import { ScheduleTable, type EditableSlot } from '../components/ScheduleTable';
import type { Schedule } from '../types';


let keyCounter = 0;
const makeKey = () => `slot-${++keyCounter}-${Date.now()}`;

const toEditable = (slots: Schedule[]): EditableSlot[] =>
  slots.map((s) => ({ ...s, _key: makeKey() }));

const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

const INPUT_BASE = [
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2',
  'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100',
  'focus:outline-none focus:ring-2 focus:ring-blue-500',
].join(' ');

// ── component ─────────────────────────────────────────────────────────────────
export const SchedulePage: React.FC = () => {
  const { t } = useTranslation('doctor');
  const dispatch = useAppDispatch();
  const serverSchedule = useAppSelector(selectSchedules);
  const loading = useAppSelector(selectDoctorLoading);
  const scheduleUpdated = useAppSelector(selectScheduleUpdated);

  const [localSlots, setLocalSlots] = useState<EditableSlot[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [addError, setAddError] = useState('');

  const initialised = useRef(false);

  useEffect(() => {
    dispatch(loadScheduleRequested());
  }, [dispatch]);

  // initialised guard prevents re-overwriting local edits on subsequent Redux updates.
  useEffect(() => {
    if (!initialised.current && serverSchedule.length >= 0) {
      setLocalSlots(toEditable(serverSchedule));
      initialised.current = true;
    }
  }, [serverSchedule]);

  useEffect(() => {
    if (scheduleUpdated) {
      setLocalSlots(toEditable(serverSchedule));
      setIsDirty(false);
      dispatch(clearScheduleUpdated());
    }
  }, [scheduleUpdated, serverSchedule, dispatch]);

  // ── slot mutation helpers ──────────────────────────────────────────────────
  const handleChange = (key: string, field: keyof Schedule, value: string | boolean) => {
    setLocalSlots((prev) =>
      prev.map((s) => (s._key === key ? { ...s, [field]: value } : s))
    );
    setIsDirty(true);
  };

  const handleDelete = (key: string) => {
    setLocalSlots((prev) => prev.filter((s) => s._key !== key));
    setIsDirty(true);
  };

  // ── add-slot dialog ────────────────────────────────────────────────────────
  const openAddDialog = () => {
    setNewDate('');
    setNewStart('08:00');
    setNewEnd('17:00');
    setAddError('');
    setAddDialogVisible(true);
  };

  const handleAddConfirm = () => {
    if (!newDate) { setAddError('Date is required'); return; }
    if (!isValidTime(newStart)) { setAddError('Start time must be HH:MM'); return; }
    if (!isValidTime(newEnd)) { setAddError('End time must be HH:MM'); return; }
    if (newEnd <= newStart) { setAddError('End time must be after start time'); return; }

    setLocalSlots((prev) => [
      ...prev,
      { _key: makeKey(), date: newDate, startTime: newStart, endTime: newEnd, available: true },
    ]);
    setIsDirty(true);
    setAddDialogVisible(false);
  };

  const handleSave = () => {
    const invalid = localSlots.some(
      (s) => !isValidTime(s.startTime) || !isValidTime(s.endTime) || s.endTime <= s.startTime
    );
    if (invalid) return;
    const payload: Schedule[] = localSlots.map(({ _key: _k, ...rest }) => rest);
    dispatch(updateScheduleRequested(payload));
  };

  const handleDiscard = () => {
    setLocalSlots(toEditable(serverSchedule));
    setIsDirty(false);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('schedule')}
          </h1>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              icon="pi pi-plus"
              label={t('addSlot')}
              size="sm"
              onClick={openAddDialog}
            />
            {isDirty && (
              <Button
                variant="secondary"
                icon="pi pi-times"
                label={t('discardChanges')}
                size="sm"
                onClick={handleDiscard}
                disabled={loading}
              />
            )}
            <Button
              icon="pi pi-save"
              label={t('saveSchedule')}
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || loading}
              loading={loading}
            />
          </div>
        </div>

        {isDirty && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-2 text-sm text-amber-800 dark:text-amber-300">
            <i className="pi pi-exclamation-triangle" />
            {t('unsavedChanges')}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <ScheduleTable
            slots={localSlots}
            loading={loading && !isDirty}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Dialog
        header={t('addSlotTitle')}
        visible={addDialogVisible}
        style={{ width: '380px' }}
        onHide={() => setAddDialogVisible(false)}
        modal
      >
        <div className="p-4 space-y-4">
          {addError && (
            <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('scheduleDate')}
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => { setNewDate(e.target.value); setAddError(''); }}
              className={INPUT_BASE}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('startTime')}
            </label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => { setNewStart(e.target.value); setAddError(''); }}
              className={INPUT_BASE}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('endTime')}
            </label>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => { setNewEnd(e.target.value); setAddError(''); }}
              className={INPUT_BASE}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setAddDialogVisible(false)}>
              {t('cancel')}
            </Button>
            <Button size="sm" onClick={handleAddConfirm}>
              {t('addSlot')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

