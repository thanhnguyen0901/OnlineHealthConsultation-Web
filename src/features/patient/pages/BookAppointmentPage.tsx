import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
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
  specialtyId: Yup.string().required('Specialty is required'),
  doctorId: Yup.string().required('Doctor is required'),
  date: Yup.date().required('Date is required').nullable(),
  time: Yup.string().required('Time is required'),
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
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectSpecialties);
  const doctors = useAppSelector(selectDoctors);
  const loading = useAppSelector(selectPatientLoading);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');

  useEffect(() => {
    dispatch(loadSpecialtiesRequested());
  }, [dispatch]);

  const specialtyOptions = specialties.map((s) => ({ label: s.name, value: s.id }));
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
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('bookAppointment')}</h1>
      <Card>
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
            <Form className="space-y-4">
              <FormikDropdown
                name="specialtyId"
                label={t('selectSpecialty')}
                options={specialtyOptions}
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
                disabled={!selectedSpecialtyId || doctors.length === 0}
              />

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
              />

              <FormikInputText
                name="notes"
                label={t('notes')}
                as="textarea"
                rows={4}
              />

              <Button type="submit" label={t('bookAppointment')} loading={loading} />
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};
