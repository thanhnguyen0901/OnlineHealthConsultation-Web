import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FormikDropdown } from '@/components/form-controls/FormikDropdown';
import { FormikCalendar } from '@/components/form-controls/FormikCalendar';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadSpecialtiesRequested,
  loadDoctorsBySpecialtyRequested,
  bookAppointmentRequested,
} from '../redux/patient.slice';
import { selectSpecialties, selectDoctors, selectPatientLoading } from '../redux/patient.selectors';

const timeSlots = [
  { label: '08:00', value: '08:00' },
  { label: '08:30', value: '08:30' },
  { label: '09:00', value: '09:00' },
  { label: '09:30', value: '09:30' },
  { label: '10:00', value: '10:00' },
  { label: '10:30', value: '10:30' },
  { label: '11:00', value: '11:00' },
  { label: '11:30', value: '11:30' },
  { label: '13:00', value: '13:00' },
  { label: '13:30', value: '13:30' },
  { label: '14:00', value: '14:00' },
  { label: '14:30', value: '14:30' },
  { label: '15:00', value: '15:00' },
  { label: '15:30', value: '15:30' },
  { label: '16:00', value: '16:00' },
  { label: '16:30', value: '16:30' },
];

const appointmentSchema = Yup.object().shape({
  specialtyId: Yup.string().required(),
  doctorId: Yup.string().required(),
  date: Yup.date().required().nullable(),
  time: Yup.string().required(),
  notes: Yup.string(),
});

interface AppointmentFormValues {
  specialtyId: string;
  doctorId: string;
  date: Date | null;
  time: string;
  notes: string;
}

export const BookAppointmentPage: React.FC = () => {
  const { t, i18n } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectSpecialties);
  const doctors = useAppSelector(selectDoctors);
  const loading = useAppSelector(selectPatientLoading);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');

  useEffect(() => {
    dispatch(loadSpecialtiesRequested());
  }, [dispatch]);

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
        date: values.date.toISOString().split('T')[0],
        time: values.time,
        notes: values.notes,
      })
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('bookAppointment')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <Formik
            initialValues={{
              specialtyId: '',
              doctorId: '',
              date: null,
              time: '',
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
                    onChange={(e) => {
                      setFieldValue('specialtyId', e.value);
                      setFieldValue('doctorId', '');
                      setSelectedSpecialtyId(e.value);
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
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormikCalendar
                    name="date"
                    label={t('appointmentDate')}
                    minDate={new Date()}
                    showIcon
                  />

                  <FormikDropdown
                    name="time"
                    label={t('appointmentTime')}
                    options={timeSlots}
                    placeholder={t('appointmentTime')}
                  />
                </div>

                <div className="mt-2">
                  <FormikInputText name="notes" label={t('notes')} as="textarea" rows={4} />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="submit" loading={loading}>
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
