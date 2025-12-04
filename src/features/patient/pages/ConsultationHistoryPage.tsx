import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadHistoryRequested } from '@/features/patient/redux/patient.slice';
import { selectQuestions, selectAppointments } from '@/features/patient/redux/patient.selectors';

export const ConsultationHistoryPage: React.FC = () => {
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const appointments = useAppSelector(selectAppointments);

  useEffect(() => {
    dispatch(loadHistoryRequested());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('consultationHistory')}</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Questions</h2>
        <DataTable value={questions} paginator rows={10}>
          <Column field="question" header="Question" />
          <Column field="status" header="Status" />
          <Column field="createdAt" header="Date" />
        </DataTable>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Appointments</h2>
        <DataTable value={appointments} paginator rows={10}>
          <Column field="doctorName" header="Doctor" />
          <Column field="date" header="Date" />
          <Column field="status" header="Status" />
        </DataTable>
      </div>
    </div>
  );
};
