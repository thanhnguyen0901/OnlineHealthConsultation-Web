import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { FormikDropdown } from '@/components/form-controls/FormikDropdown';
import { FormikCalendar } from '@/components/form-controls/FormikCalendar';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadSpecialtiesRequested,
  loadDoctorsBySpecialtyRequested,
  bookAppointmentRequested,
  clearAppointmentSubmitted,
  loadDoctorAvailabilityRequested,
  clearDoctorAvailability,
} from '../redux/patient.slice';
import {
  selectSpecialties,
  selectDoctors,
  selectPatientLoading,
  selectAppointmentSubmitted,
  selectPatientError,
  selectDoctorAvailability,
  selectDoctorAvailabilityLoading,
  selectDoctorAvailabilityError,
} from '../redux/patient.selectors';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { isUnauthorizedMessage } from '@/utils/authz';

// Local calendar date, not UTC (avoids day-off-by-one for negative-UTC-offset timezones).
const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const appointmentSchema = Yup.object().shape({
  specialtyId: Yup.string().required(),
  doctorId: Yup.string().required(),
  date: Yup.date().required().nullable(),
  time: Yup.string().required(),
  reason: Yup.string().required(),
  notes: Yup.string(),
});

interface AppointmentFormValues {
  specialtyId: string;
  doctorId: string;
  date: Date | null;
  time: string;
  reason: string;
  notes: string;
}

const BookingAvailabilityFields: React.FC = () => {
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const { values, setFieldValue, touched, errors } = useFormikContext<AppointmentFormValues>();
  const availability = useAppSelector(selectDoctorAvailability);
  const availabilityLoading = useAppSelector(selectDoctorAvailabilityLoading);
  const availabilityError = useAppSelector(selectDoctorAvailabilityError);
  const selectedDate = useMemo(
    () => (values.date ? formatLocalDate(values.date) : ''),
    [values.date]
  );
  const slots =
    availability?.doctorId === values.doctorId && availability.date === selectedDate
      ? availability.slots
      : [];
  const canLoadSlots = Boolean(values.doctorId && selectedDate);

  useEffect(() => {
    setFieldValue('time', '', false);
    if (values.doctorId && selectedDate) {
      dispatch(loadDoctorAvailabilityRequested({ doctorId: values.doctorId, date: selectedDate }));
    } else {
      dispatch(clearDoctorAvailability());
    }
  }, [dispatch, selectedDate, setFieldValue, values.doctorId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormikCalendar
        name="date"
        label={t('appointmentDate')}
        minDate={new Date()}
        showIcon
        data-testid="appointment-date"
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('appointmentTime')}
        </label>
        <div
          data-testid="appointment-time"
          role="radiogroup"
          aria-label={t('appointmentTime')}
          className="min-h-[44px]"
        >
          {!canLoadSlots && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('selectDoctorAndDateFirst')}
            </p>
          )}

          {canLoadSlots && availabilityLoading && (
            <InlineAlert
              variant="info"
              title={t('loadingAvailableSlots')}
              className="py-2"
            />
          )}

          {canLoadSlots && availabilityError && !availabilityLoading && (
            <InlineAlert
              variant="error"
              title={t('availableSlotsError')}
              message={availabilityError}
              className="py-2"
              onRetry={() =>
                dispatch(
                  loadDoctorAvailabilityRequested({
                    doctorId: values.doctorId,
                    date: selectedDate,
                  })
                )
              }
            />
          )}

          {canLoadSlots && !availabilityLoading && !availabilityError && slots.length === 0 && (
            <InlineAlert
              variant="warning"
              title={t('noAvailableSlots')}
              message={t('chooseAnotherDate')}
              className="py-2"
            />
          )}

          {slots.length > 0 && !availabilityLoading && !availabilityError && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const selected = values.time === slot.start;
                const disabled = !slot.available;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    data-testid={`appointment-slot-${slot.label}`}
                    onClick={() => setFieldValue('time', slot.start)}
                    className={`h-11 rounded-lg border text-sm font-medium transition ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200'
                    } ${disabled ? 'cursor-not-allowed opacity-50 hover:border-gray-200' : ''}`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {touched.time && errors.time && <small className="p-error block mt-1">{errors.time}</small>}
      </div>
    </div>
  );
};

export const BookAppointmentPage: React.FC = () => {
  const { t, i18n } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const specialties = useAppSelector(selectSpecialties);
  const doctors = useAppSelector(selectDoctors);
  const loading = useAppSelector(selectPatientLoading);
  const availabilityLoading = useAppSelector(selectDoctorAvailabilityLoading);
  const appointmentSubmitted = useAppSelector(selectAppointmentSubmitted);
  const error = useAppSelector(selectPatientError);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');

  useEffect(() => {
    dispatch(loadSpecialtiesRequested());
    return () => {
      dispatch(clearDoctorAvailability());
    };
  }, [dispatch]);

  // Saga dispatches toasts; navigate only.
  useEffect(() => {
    if (appointmentSubmitted) {
      const timer = setTimeout(() => {
        dispatch(clearAppointmentSubmitted());
        navigate(ROUTE_PATHS.CONSULTATION_HISTORY);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [appointmentSubmitted, dispatch, navigate]);

  const specialtyOptions = specialties.map((s) => ({
    label: i18n.language === 'vi' ? s.nameVi : s.nameEn,
    value: s.id,
  }));
  const doctorOptions = doctors.map((d) => ({ label: d.name, value: d.id }));

  const handleSubmit = (values: AppointmentFormValues) => {
    if (!values.date) return;
    dispatch(
      bookAppointmentRequested({
        doctorId: values.doctorId,
        scheduledAt: values.time,
        reason: values.reason,
        notes: values.notes,
      })
    );
  };

  return (
    <div data-testid="appointment-create-page" className="px-4 py-6 md:px-8 md:py-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('bookAppointment')}
        </h1>
        {appointmentSubmitted && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('appointmentBooked')}
            className="mb-4"
          />
        )}
        {error && (
          <div data-testid="error-alert">
            <InlineAlert
              variant="error"
              title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
              message={error}
              className="mb-4"
            />
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <Formik
            initialValues={{
              specialtyId: '',
              doctorId: '',
              date: null,
              time: '',
              reason: '',
              notes: '',
            }}
            validationSchema={appointmentSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormikDropdown
                    name="specialtyId"
                    label={t('selectSpecialty')}
                    options={specialtyOptions}
                    placeholder={t('selectSpecialty')}
                    data-testid="appointment-specialty"
                    onChange={(e) => {
                      setFieldValue('specialtyId', e.value);
                      setFieldValue('doctorId', '');
                      setFieldValue('time', '');
                      setSelectedSpecialtyId(e.value);
                      dispatch(clearDoctorAvailability());
                      if (e.value) {
                        dispatch(loadDoctorsBySpecialtyRequested(e.value));
                      }
                    }}
                  />

                  <FormikDropdown
                    name="doctorId"
                    label={t('selectDoctor')}
                    options={doctorOptions}
                    placeholder={t('selectDoctor')}
                    disabled={!selectedSpecialtyId || doctors.length === 0}
                    data-testid="appointment-doctor"
                    onChange={(e) => {
                      setFieldValue('doctorId', e.value);
                      setFieldValue('time', '');
                    }}
                  />
                </div>
                {!loading && selectedSpecialtyId && doctors.length === 0 && (
                  <InlineAlert
                    variant="warning"
                    title={t('common:noData')}
                    message={t('noDoctorsAvailable')}
                  />
                )}

                <BookingAvailabilityFields />

                <div className="mt-2">
                  <FormikInputText
                    name="reason"
                    label={t('reason')}
                    placeholder={t('reasonPlaceholder')}
                    as="textarea"
                    rows={3}
                    data-testid="appointment-reason"
                  />
                </div>

                <div className="mt-2">
                  <FormikInputText name="notes" label={t('notes')} as="textarea" rows={4} />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading || availabilityLoading}
                    data-testid="appointment-submit"
                  >
                    {t('bookAppointment')}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
