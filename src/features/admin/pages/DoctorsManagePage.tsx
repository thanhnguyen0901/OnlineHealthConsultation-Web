import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
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
  selectAdminDoctorsPagination,
  selectAdminError,
} from '../redux/admin.selectors';
import type { Doctor } from '../types';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';

export const DoctorsManagePage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const dispatch = useAppDispatch();
  const doctors = useAppSelector(selectAdminDoctors);
  const specialties = useAppSelector(selectAdminSpecialties);
  const loading = useAppSelector(selectAdminLoading);
  const doctorsPagination = useAppSelector(selectAdminDoctorsPagination);
  const error = useAppSelector(selectAdminError);

  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [doctor, setDoctor] = useState<Partial<Doctor> & { password?: string }>({});
  const [editingSnapshot, setEditingSnapshot] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    specialtyId: string;
    bio: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [first, setFirst] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const page = Math.floor(first / pageSize) + 1;
    dispatch(loadDoctorsRequested({ page, limit: pageSize }));
  }, [dispatch, first, pageSize, revision]);

  useEffect(() => {
    dispatch(loadSpecialtiesRequested());
  }, [dispatch]);

  const specialtyOptions = specialties.map((s) => ({
    label: i18n.language === 'vi' ? s.nameVi : s.nameEn,
    value: s.id,
  }));

  const openNew = () => {
    setDoctor({});
    setEditingSnapshot(null);
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
    const isCreate = !doctor.id;
    const valid =
      !!doctor.firstName?.trim() &&
      !!doctor.lastName?.trim() &&
      !!doctor.email?.trim() &&
      !!doctor.specialtyId &&
      (!isCreate || !!doctor.password?.trim());
    if (!valid) return;

    if (isCreate) {
      // role: 'DOCTOR' is required by the BE createUserSchema.
      dispatch(
        createDoctorRequested({
          ...doctor,
          role: 'DOCTOR',
          password: doctor.password!,
        } as Partial<Doctor> & { password: string })
      );
      setFirst(0);
      setRevision((r) => r + 1);
    } else {
      dispatch(
        updateDoctorRequested({
          id: doctor.id!,
          data: {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            email: doctor.email,
            specialtyId: doctor.specialtyId,
            bio: doctor.bio,
          },
        })
      );
    }
    setDialog(false);
    setDoctor({});
  };

  const editDoctor = (doctor: Doctor) => {
    setDoctor({ ...doctor });
    setEditingSnapshot({
      firstName: (doctor.firstName ?? '').trim(),
      lastName: (doctor.lastName ?? '').trim(),
      email: (doctor.email ?? '').trim(),
      specialtyId: doctor.specialtyId ?? '',
      bio: (doctor.bio ?? '').trim(),
    });
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
    setRevision((r) => r + 1);
  };

  const approveDoctor = (rowData: Doctor) => {
    dispatch(
      updateDoctorRequested({
        id: rowData.id,
        data: { approvalStatus: 'APPROVED', isActive: true } as Partial<Doctor>,
      })
    );
  };

  const rejectDoctor = (rowData: Doctor) => {
    dispatch(
      updateDoctorRequested({
        id: rowData.id,
        data: { approvalStatus: 'REJECTED', isActive: false } as Partial<Doctor>,
      })
    );
  };

  const actionBodyTemplate = (rowData: Doctor) => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          icon="pi pi-check"
          size="sm"
          variant="primary"
          onClick={() => approveDoctor(rowData)}
          data-testid={`approve-doctor-${rowData.id}`}
        />
        <Button
          icon="pi pi-times"
          size="sm"
          variant="danger"
          onClick={() => rejectDoctor(rowData)}
          data-testid={`reject-doctor-${rowData.id}`}
        />
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

  const specialtyBodyTemplate = (rowData: Doctor) => {
    if (i18n.language === 'vi' && rowData.specialtyNameVi) {
      return rowData.specialtyNameVi;
    }
    if (i18n.language !== 'vi' && rowData.specialtyName) {
      return rowData.specialtyName;
    }
    const specialty = specialties.find((s) => s.id === rowData.specialtyId);
    if (specialty) {
      return i18n.language === 'vi' ? specialty.nameVi : specialty.nameEn;
    }
    return translateEnumValue(t, 'specialty', rowData.specialtyName);
  };

  const approvalStatusBodyTemplate = (rowData: Doctor) => {
    const status = rowData.approvalStatus ?? '';
    const normalized = status.toLowerCase();
    const severity =
      normalized === 'approved' ? 'success' : normalized === 'rejected' ? 'danger' : 'warning';

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          severity === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : severity === 'danger'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
        }`}
      >
        {translateEnumValue(t, 'status', status)}
      </span>
    );
  };

  const isEditDirty = doctor.id
    ? !!editingSnapshot &&
      ((doctor.firstName ?? '').trim() !== editingSnapshot.firstName ||
        (doctor.lastName ?? '').trim() !== editingSnapshot.lastName ||
        (doctor.email ?? '').trim() !== editingSnapshot.email ||
        (doctor.specialtyId ?? '') !== editingSnapshot.specialtyId ||
        (doctor.bio ?? '').trim() !== editingSnapshot.bio)
    : true;

  const dialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button
        label={t('cancel')}
        size="sm"
        variant="secondary"
        onClick={hideDialog}
        disabled={loading}
      />
      <Button
        label={t('save')}
        size="sm"
        onClick={saveDoctor}
        loading={loading}
        disabled={loading || !isEditDirty}
        data-testid="doctor-approval-status"
      />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button
        label={t('no')}
        size="sm"
        variant="secondary"
        onClick={hideDeleteDialog}
        disabled={loading}
      />
      <Button
        label={t('yes')}
        size="sm"
        variant="danger"
        onClick={deleteDoctor}
        loading={loading}
      />
    </div>
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8" data-testid="admin-doctor-list-page">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('manageDoctors')}
        </h1>
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => {
              const page = Math.floor(first / pageSize) + 1;
              dispatch(loadDoctorsRequested({ page, limit: pageSize }));
            }}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="mb-4">
            <Button icon="pi pi-plus" size="sm" onClick={openNew}>
              {t('addDoctor')}
            </Button>
          </div>
          <DataTable
            key={`doctors-table-${i18n.language}`}
            value={doctors}
            lazy
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 20, 50]}
            first={first}
            totalRecords={doctorsPagination?.total ?? 0}
            onPage={(e: any) => {
              setFirst(e.first);
              setPageSize(e.rows);
            }}
            loading={loading}
            emptyMessage={t('noDoctors')}
            className="primereact-table"
            data-testid="admin-doctor-table"
          >
            <Column field="name" header={t('name')} sortable />
            <Column field="email" header={t('email')} sortable />
            <Column
              field="approvalStatus"
              header={t('status')}
              body={approvalStatusBodyTemplate}
              sortable
              style={{ width: '150px' }}
            />
            <Column
              field="specialtyName"
              header={t('specialty')}
              body={specialtyBodyTemplate}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('firstName')}
                </label>
                <InputText
                  value={doctor.firstName || ''}
                  onChange={(e) => setDoctor({ ...doctor, firstName: e.target.value })}
                  required
                  autoFocus
                  className={`w-full ${submitted && !doctor.firstName ? 'p-invalid' : ''}`}
                />
                {submitted && !doctor.firstName && (
                  <small className="text-red-500 text-xs mt-1">{t('firstNameRequired')}</small>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('lastName')}
                </label>
                <InputText
                  value={doctor.lastName || ''}
                  onChange={(e) => setDoctor({ ...doctor, lastName: e.target.value })}
                  required
                  className={`w-full ${submitted && !doctor.lastName ? 'p-invalid' : ''}`}
                />
                {submitted && !doctor.lastName && (
                  <small className="text-red-500 text-xs mt-1">{t('lastNameRequired')}</small>
                )}
              </div>
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
                  {t('deleteDoctorConfirm', {
                    name: `${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`.trim(),
                  })}
                </span>
              )}
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
