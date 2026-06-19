import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadSpecialtiesRequested,
  createSpecialtyRequested,
  updateSpecialtyRequested,
  deleteSpecialtyRequested,
} from '../redux/admin.slice';
import {
  selectAdminSpecialties,
  selectAdminLoading,
  selectAdminError,
} from '../redux/admin.selectors';
import type { Specialty } from '../types';
import { isUnauthorizedMessage } from '@/utils/authz';

export const SpecialtiesManagePage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectAdminSpecialties);
  const loading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);

  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [specialty, setSpecialty] = useState<Partial<Specialty>>({});
  const [editingSnapshot, setEditingSnapshot] = useState<{
    nameEn: string;
    nameVi: string;
    description: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(loadSpecialtiesRequested());
  }, [dispatch]);

  const openNew = () => {
    setSpecialty({});
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

  const saveSpecialty = () => {
    setSubmitted(true);
    // description is optional on the BE — only nameEn and nameVi are required.
    if (specialty.nameEn?.trim() && specialty.nameVi?.trim()) {
      if (specialty.id) {
        dispatch(
          updateSpecialtyRequested({
            id: specialty.id,
            data: {
              nameEn: specialty.nameEn,
              nameVi: specialty.nameVi,
              description: specialty.description,
            },
          })
        );
      } else {
        dispatch(
          createSpecialtyRequested({
            nameEn: specialty.nameEn,
            nameVi: specialty.nameVi,
            description: specialty.description,
          })
        );
      }
      setDialog(false);
      setSpecialty({});
    }
  };

  const editSpecialty = (specialty: Specialty) => {
    setSpecialty({ ...specialty });
    setEditingSnapshot({
      nameEn: (specialty.nameEn ?? '').trim(),
      nameVi: (specialty.nameVi ?? '').trim(),
      description: (specialty.description ?? '').trim(),
    });
    setDialog(true);
  };

  const confirmDeleteSpecialty = (specialty: Specialty) => {
    setSpecialty(specialty);
    setDeleteDialog(true);
  };

  const deleteSpecialty = () => {
    if (specialty.id) {
      dispatch(deleteSpecialtyRequested(specialty.id));
    }
    setDeleteDialog(false);
    setSpecialty({});
  };

  const actionBodyTemplate = (rowData: Specialty) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          size="sm"
          variant="secondary"
          onClick={() => editSpecialty(rowData)}
          data-testid={`edit-specialty-${rowData.id}`}
        />
        <Button
          icon="pi pi-trash"
          size="sm"
          variant="danger"
          onClick={() => confirmDeleteSpecialty(rowData)}
          data-testid={`deactivate-specialty-${rowData.id}`}
        />
      </div>
    );
  };

  const isEditDirty = specialty.id
    ? !!editingSnapshot &&
      ((specialty.nameEn ?? '').trim() !== editingSnapshot.nameEn ||
        (specialty.nameVi ?? '').trim() !== editingSnapshot.nameVi ||
        (specialty.description ?? '').trim() !== editingSnapshot.description)
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
        onClick={saveSpecialty}
        loading={loading}
        disabled={loading || !isEditDirty}
        data-testid="specialty-save"
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
        onClick={deleteSpecialty}
        loading={loading}
        data-testid="specialty-deactivate"
      />
    </div>
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8" data-testid="admin-specialty-page">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('manageSpecialties')}
        </h1>
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => dispatch(loadSpecialtiesRequested())}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="mb-4">
            <Button
              icon="pi pi-plus"
              size="sm"
              onClick={openNew}
              data-testid="new-specialty"
            >
              {t('addSpecialty')}
            </Button>
          </div>
          <DataTable
            value={specialties}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noSpecialties')}
            className="primereact-table"
            data-testid="admin-specialty-table"
          >
            <Column field="nameEn" header={t('nameEnglish')} sortable style={{ width: '180px' }} />
            <Column
              field="nameVi"
              header={t('nameVietnamese')}
              sortable
              style={{ width: '200px' }}
            />
            <Column field="description" header={t('description')} sortable />
            <Column body={actionBodyTemplate} header={t('actions')} style={{ width: '140px' }} />
          </DataTable>
        </div>

        <Dialog
          visible={dialog}
          style={{ width: '34rem' }}
          header={specialty.id ? t('editSpecialty') : t('addSpecialty')}
          modal
          footer={dialogFooter}
          onHide={hideDialog}
          className="p-dialog-custom"
        >
          <div className="px-6 pt-2 pb-1 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('nameEnglish')} <span className="text-red-500">*</span>
              </label>
              <InputText
                id="nameEn"
                value={specialty.nameEn || ''}
                onChange={(e) => setSpecialty({ ...specialty, nameEn: e.target.value })}
                required
                autoFocus
                className={`w-full ${submitted && !specialty.nameEn ? 'p-invalid' : ''}`}
                placeholder={t('specialtyNameEnExample')}
              />
              {submitted && !specialty.nameEn && (
                <small className="text-red-500 text-xs mt-1">{t('nameEnglishRequired')}</small>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('nameVietnamese')} <span className="text-red-500">*</span>
              </label>
              <InputText
                id="nameVi"
                value={specialty.nameVi || ''}
                onChange={(e) => setSpecialty({ ...specialty, nameVi: e.target.value })}
                required
                className={`w-full ${submitted && !specialty.nameVi ? 'p-invalid' : ''}`}
                placeholder={t('specialtyNameViExample')}
              />
              {submitted && !specialty.nameVi && (
                <small className="text-red-500 text-xs mt-1">{t('nameVietnameseRequired')}</small>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('description')}
              </label>
              <InputTextarea
                id="description"
                value={specialty.description || ''}
                onChange={(e) => setSpecialty({ ...specialty, description: e.target.value })}
                rows={4}
                className="w-full"
                placeholder={t('descriptionPlaceholder')}
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
              {specialty && (
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  {t('deleteSpecialtyConfirm', { name: specialty.nameEn })}
                </span>
              )}
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
