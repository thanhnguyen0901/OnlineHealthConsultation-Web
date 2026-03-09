import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadPatientsRequested,
  updatePatientRequested,
  deletePatientRequested,
} from '../redux/admin.slice';
import {
  selectAdminPatients,
  selectAdminLoading,
  selectAdminPatientsPagination,
} from '../redux/admin.selectors';
import type { Patient } from '../types';

export const PatientsManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const patients = useAppSelector(selectAdminPatients);
  const loading = useAppSelector(selectAdminLoading);
  const patientsPagination = useAppSelector(selectAdminPatientsPagination);

  const [first, setFirst] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [revision, setRevision] = useState(0);

  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [patient, setPatient] = useState<Partial<Patient>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const page = Math.floor(first / pageSize) + 1;
    dispatch(loadPatientsRequested({ page, limit: pageSize, search: search || undefined }));
  }, [dispatch, first, pageSize, search, revision]);

  const handleSearch = () => {
    setFirst(0);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFirst(0);
    setSearch('');
  };

  const hideDialog = () => {
    setSubmitted(false);
    setDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const savePatient = () => {
    setSubmitted(true);
    if (!patient.id) return;
    const valid = !!patient.firstName?.trim() && !!patient.lastName?.trim() && !!patient.email?.trim();
    if (!valid) return;
    dispatch(
      updatePatientRequested({
        id: patient.id as string,
        data: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          isActive: patient.isActive,
        },
      })
    );
    setDialog(false);
    setPatient({});
  };

  const editPatient = (p: Patient) => {
    setPatient({ ...p });
    setDialog(true);
  };

  const confirmDeletePatient = (p: Patient) => {
    setPatient(p);
    setDeleteDialog(true);
  };

  const doDeletePatient = () => {
    if (patient.id) {
      dispatch(deletePatientRequested(patient.id as string));
    }
    setDeleteDialog(false);
    setPatient({});
    setRevision((r) => r + 1);
  };

  const statusBodyTemplate = (rowData: Patient) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        rowData.isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}
    >
      {rowData.isActive ? t('active') : t('inactive')}
    </span>
  );

  const actionBodyTemplate = (rowData: Patient) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="sm"
        variant="secondary"
        onClick={() => editPatient(rowData)}
      />
      <Button
        icon="pi pi-trash"
        size="sm"
        variant="danger"
        onClick={() => confirmDeletePatient(rowData)}
        disabled={!rowData.isActive}
      />
    </div>
  );

  const dialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('cancel')} variant="secondary" onClick={hideDialog} />
      <Button label={t('save')} onClick={savePatient} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('no')} variant="secondary" onClick={hideDeleteDialog} />
      <Button label={t('yes')} variant="danger" onClick={doDeletePatient} />
    </div>
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('managePatients')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          {/* Search toolbar */}
          <div className="mb-4 flex gap-2 items-center">
            <InputText
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`${t('name')} / ${t('email')}`}
              className="w-64"
            />
            <Button icon="pi pi-search" size="sm" onClick={handleSearch}>
              Search
            </Button>
            {search && (
              <Button icon="pi pi-times" size="sm" variant="secondary" onClick={handleClearSearch}>
                {t('clearFilters')}
              </Button>
            )}
          </div>

          <DataTable
            value={patients}
            lazy
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 20, 50]}
            first={first}
            totalRecords={patientsPagination?.total ?? 0}
            onPage={(e: any) => {
              setFirst(e.first);
              setPageSize(e.rows);
            }}
            loading={loading}
            emptyMessage={t('noPatients')}
            className="primereact-table"
          >
            <Column field="name" header={t('name')} sortable />
            <Column field="email" header={t('email')} sortable />
            <Column field="phone" header={t('phone')} />
            <Column field="gender" header={t('gender')} style={{ width: '100px' }} />
            <Column body={statusBodyTemplate} header={t('status')} style={{ width: '120px' }} />
            <Column body={actionBodyTemplate} header={t('actions')} style={{ width: '140px' }} />
          </DataTable>
        </div>

        {/* Edit dialog */}
        <Dialog
          visible={dialog}
          style={{ width: '32rem' }}
          header={t('editPatient')}
          modal
          footer={dialogFooter}
          onHide={hideDialog}
          className="p-dialog-custom"
        >
          <div className="px-6 pt-2 pb-1 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('firstName')}
                </label>
                <InputText
                  value={patient.firstName || ''}
                  onChange={(e) => setPatient({ ...patient, firstName: e.target.value })}
                  required
                  autoFocus
                  className={`w-full ${submitted && !patient.firstName ? 'p-invalid' : ''}`}
                />
                {submitted && !patient.firstName && (
                  <small className="text-red-500 text-xs mt-1">{t('firstNameRequired')}</small>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('lastName')}
                </label>
                <InputText
                  value={patient.lastName || ''}
                  onChange={(e) => setPatient({ ...patient, lastName: e.target.value })}
                  required
                  className={`w-full ${submitted && !patient.lastName ? 'p-invalid' : ''}`}
                />
                {submitted && !patient.lastName && (
                  <small className="text-red-500 text-xs mt-1">{t('lastNameRequired')}</small>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('email')}
              </label>
              <InputText
                value={patient.email || ''}
                onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                required
                className={`w-full ${submitted && !patient.email ? 'p-invalid' : ''}`}
              />
              {submitted && !patient.email && (
                <small className="text-red-500 text-xs mt-1">{t('emailRequired')}</small>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('active')}
              </label>
              <InputSwitch
                checked={patient.isActive ?? true}
                onChange={(e) => setPatient({ ...patient, isActive: e.value })}
              />
            </div>
          </div>
        </Dialog>

        {/* Delete / deactivate confirmation dialog */}
        <Dialog
          visible={deleteDialog}
          style={{ width: '28rem' }}
          header={t('confirm')}
          modal
          footer={deleteDialogFooter}
          onHide={hideDeleteDialog}
          className="p-dialog-custom"
        >
          <div className="px-6 pt-2 pb-1">
            <p className="text-gray-700 dark:text-gray-300">
              {t('deletePatientConfirm', { name: patient.name || `${patient.firstName} ${patient.lastName}` })}
            </p>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
