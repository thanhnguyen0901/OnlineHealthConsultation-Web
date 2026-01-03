import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadDoctorsRequested,
  loadSpecialtiesRequested,
  createDoctorRequested,
  updateDoctorRequested,
  deleteDoctorRequested,
} from '../redux/admin.slice';
import {
  selectAdminDoctors,
  selectAdminSpecialties,
  selectAdminLoading,
} from '../redux/admin.selectors';
import type { Doctor } from '../types';

export const DoctorsManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const doctors = useAppSelector(selectAdminDoctors);
  const specialties = useAppSelector(selectAdminSpecialties);
  const loading = useAppSelector(selectAdminLoading);

  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [doctor, setDoctor] = useState<Partial<Doctor> & { password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(loadDoctorsRequested());
    dispatch(loadSpecialtiesRequested());
  }, [dispatch]);

  const specialtyOptions = specialties.map((s) => ({ label: s.name, value: s.id }));

  const openNew = () => {
    setDoctor({});
    setSubmitted(false);
    setDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const saveDoctor = () => {
    setSubmitted(true);
    if (doctor.name?.trim() && doctor.email?.trim() && doctor.specialtyId) {
      if (doctor.id) {
        dispatch(
          updateDoctorRequested({
            id: doctor.id,
            data: {
              name: doctor.name,
              email: doctor.email,
              specialtyId: doctor.specialtyId,
              bio: doctor.bio,
            },
          })
        );
      } else {
        if (doctor.password) {
          dispatch(
            createDoctorRequested({ ...doctor, password: doctor.password } as Partial<Doctor> & {
              password: string;
            })
          );
        }
      }
      setDialog(false);
      setDoctor({});
    }
  };

  const editDoctor = (doctor: Doctor) => {
    setDoctor({ ...doctor });
    setDialog(true);
  };

  const confirmDeleteDoctor = (doctor: Doctor) => {
    setDoctor(doctor);
    setDeleteDialog(true);
  };

  const deleteDoctor = () => {
    if (doctor.id) {
      dispatch(deleteDoctorRequested(doctor.id));
    }
    setDeleteDialog(false);
    setDoctor({});
  };

  const actionBodyTemplate = (rowData: Doctor) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          size="sm"
          variant="secondary"
          onClick={() => editDoctor(rowData)}
        />
        <Button
          icon="pi pi-trash"
          size="sm"
          variant="danger"
          onClick={() => confirmDeleteDoctor(rowData)}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('cancel')} variant="secondary" onClick={hideDialog} />
      <Button label={t('save')} onClick={saveDoctor} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('no')} variant="secondary" onClick={hideDeleteDialog} />
      <Button label={t('yes')} variant="danger" onClick={deleteDoctor} />
    </div>
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('manageDoctors')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="mb-4">
            <Button icon="pi pi-plus" onClick={openNew}>
              {t('addDoctor')}
            </Button>
          </div>
          <DataTable
            value={doctors}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noDoctors')}
            className="primereact-table"
          >
            <Column field="name" header={t('name')} sortable />
            <Column field="email" header={t('email')} sortable />
            <Column
              field="specialtyName"
              header={t('specialty')}
              sortable
              style={{ width: '180px' }}
            />
            <Column body={actionBodyTemplate} header={t('actions')} style={{ width: '140px' }} />
          </DataTable>
        </div>

        <Dialog
          visible={dialog}
          style={{ width: '34rem' }}
          header={doctor.id ? t('editDoctor') : t('addDoctor')}
          modal
          footer={dialogFooter}
          onHide={hideDialog}
          className="p-dialog-custom"
        >
          <div className="px-6 pt-2 pb-1 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('name')}
              </label>
              <InputText
                value={doctor.name || ''}
                onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                required
                autoFocus
                className={`w-full ${submitted && !doctor.name ? 'p-invalid' : ''}`}
              />
              {submitted && !doctor.name && (
                <small className="text-red-500 text-xs mt-1">{t('nameRequired')}</small>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('email')}
              </label>
              <InputText
                value={doctor.email || ''}
                onChange={(e) => setDoctor({ ...doctor, email: e.target.value })}
                required
                className={`w-full ${submitted && !doctor.email ? 'p-invalid' : ''}`}
              />
              {submitted && !doctor.email && (
                <small className="text-red-500 text-xs mt-1">{t('emailRequired')}</small>
              )}
            </div>
            {!doctor.id && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('password')}
                </label>
                <InputText
                  type="password"
                  value={doctor.password || ''}
                  onChange={(e) => setDoctor({ ...doctor, password: e.target.value })}
                  required
                  className={`w-full ${submitted && !doctor.password ? 'p-invalid' : ''}`}
                />
                {submitted && !doctor.password && (
                  <small className="text-red-500 text-xs mt-1">{t('passwordRequired')}</small>
                )}
              </div>
            )}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('specialty')}
              </label>
              <Dropdown
                value={doctor.specialtyId}
                options={specialtyOptions}
                onChange={(e) => setDoctor({ ...doctor, specialtyId: e.value })}
                placeholder={t('selectSpecialty')}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('bio')}
              </label>
              <InputTextarea
                value={doctor.bio || ''}
                onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
                rows={4}
                className="w-full"
                placeholder={t('bioPlaceholder')}
              />
            </div>
          </div>
        </Dialog>

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
          <div className="flex items-center gap-3">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500" />
            {doctor && (
              <span className="text-gray-700 dark:text-gray-300 text-base">
                {t('deleteDoctorConfirm', { name: doctor.name })}
              </span>
            )}
          </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
