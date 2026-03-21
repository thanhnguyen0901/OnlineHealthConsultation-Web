import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadDoctorPatientsRequested } from '../redux/doctor.slice';
import {
  selectDoctorPatients,
  selectDoctorPatientsPagination,
  selectDoctorLoading,
  selectDoctorError,
} from '../redux/doctor.selectors';
import type { DoctorPatient } from '../types';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';

export const DoctorPatientsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['doctor', 'common']);
  const dispatch = useAppDispatch();
  const patients = useAppSelector(selectDoctorPatients);
  const pagination = useAppSelector(selectDoctorPatientsPagination);
  const loading = useAppSelector(selectDoctorLoading);
  const error = useAppSelector(selectDoctorError);

  const [first, setFirst] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const page = Math.floor(first / pageSize) + 1;
    dispatch(
      loadDoctorPatientsRequested({
        page,
        limit: pageSize,
        search: search || undefined,
      })
    );
  }, [dispatch, first, pageSize, search]);

  const handleSearch = () => {
    setFirst(0);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setFirst(0);
  };

  const genderBody = (rowData: DoctorPatient) =>
    rowData.gender ? translateEnumValue(t, 'gender', rowData.gender) : '—';

  const statusBody = (rowData: DoctorPatient) => (
    <Tag
      value={rowData.isActive ? t('common:status.active') : t('common:status.inactive')}
      severity={rowData.isActive ? 'success' : 'danger'}
    />
  );

  const dateBody = (rowData: DoctorPatient) =>
    rowData.dateOfBirth
      ? new Date(rowData.dateOfBirth).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
      : '—';

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('patientsList')}
        </h1>
        {error && (
          <InlineAlert
            variant="error"
            title={
              isUnauthorizedMessage(error)
                ? t('common:errorUnauthorized')
                : t('common:error')
            }
            message={error}
            onRetry={() => {
              const page = Math.floor(first / pageSize) + 1;
              dispatch(
                loadDoctorPatientsRequested({
                  page,
                  limit: pageSize,
                  search: search || undefined,
                })
              );
            }}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="mb-4 flex gap-2 items-center">
            <InputText
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('searchPatients')}
              className="w-72"
            />
            <Button
              icon="pi pi-search"
              size="sm"
              onClick={handleSearch}
              className="shrink-0 whitespace-nowrap"
            >
              {t('common:search')}
            </Button>
            {search && (
              <Button
                icon="pi pi-times"
                size="sm"
                variant="secondary"
                onClick={handleClearSearch}
                className="shrink-0 whitespace-nowrap"
              >
                {t('clearFilters')}
              </Button>
            )}
          </div>

          <DataTable
            key={`doctor-patients-${i18n.language}`}
            value={patients}
            lazy
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 20, 50]}
            first={first}
            totalRecords={pagination?.total ?? 0}
            onPage={(e: any) => {
              setFirst(e.first);
              setPageSize(e.rows);
            }}
            loading={loading}
            emptyMessage={t('noPatients')}
            className="primereact-table"
          >
            <Column field="firstName" header={t('common:firstName')} sortable />
            <Column field="lastName" header={t('common:lastName')} sortable />
            <Column field="email" header={t('common:email')} sortable />
            <Column field="phone" header={t('phone')} />
            <Column field="gender" header={t('gender')} body={genderBody} />
            <Column field="dateOfBirth" header={t('dateOfBirth')} body={dateBody} />
            <Column field="isActive" header={t('status')} body={statusBody} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};
