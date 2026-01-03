import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadSpecialtiesRequested,
  createSpecialtyRequested,
  updateSpecialtyRequested,
  deleteSpecialtyRequested,
} from '../redux/admin.slice';
import { selectAdminSpecialties, selectAdminLoading } from '../redux/admin.selectors';
import type { Specialty } from '../types';

export const SpecialtiesManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectAdminSpecialties);
  const loading = useAppSelector(selectAdminLoading);

  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [specialty, setSpecialty] = useState<Partial<Specialty>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(loadSpecialtiesRequested());
  }, [dispatch]);

  const openNew = () => {
    setSpecialty({});
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
    if (specialty.nameEn?.trim() && specialty.nameVi?.trim() && specialty.description?.trim()) {
      // Auto-generate name from nameEn for backward compatibility
      const dataToSave = {
        ...specialty,
        name: specialty.nameEn,
      };
      
      if (specialty.id) {
        dispatch(
          updateSpecialtyRequested({
            id: specialty.id,
            data: { 
              name: dataToSave.name,
              nameEn: dataToSave.nameEn, 
              nameVi: dataToSave.nameVi, 
              description: dataToSave.description 
            },
          })
        );
      } else {
        dispatch(createSpecialtyRequested(dataToSave as Partial<Specialty>));
      }
      setDialog(false);
      setSpecialty({});
    }
  };

  const editSpecialty = (specialty: Specialty) => {
    setSpecialty({ ...specialty });
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
        />
        <Button
          icon="pi pi-trash"
          size="sm"
          variant="danger"
          onClick={() => confirmDeleteSpecialty(rowData)}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('cancel')} variant="secondary" onClick={hideDialog} />
      <Button label={t('save')} onClick={saveSpecialty} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('no')} variant="secondary" onClick={hideDeleteDialog} />
      <Button label={t('yes')} variant="danger" onClick={deleteSpecialty} />
    </div>
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('manageSpecialties')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="mb-4">
            <Button icon="pi pi-plus" onClick={openNew}>
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
          >
            <Column field="nameEn" header={t('nameEnglish')} sortable style={{ width: '180px' }} />
            <Column field="nameVi" header={t('nameVietnamese')} sortable style={{ width: '200px' }} />
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
                value={specialty.nameEn || ''}
                onChange={(e) => setSpecialty({ ...specialty, nameEn: e.target.value })}
                required
                autoFocus
                className={`w-full ${submitted && !specialty.nameEn ? 'p-invalid' : ''}`}
                placeholder="e.g., Cardiology"
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
                value={specialty.nameVi || ''}
                onChange={(e) => setSpecialty({ ...specialty, nameVi: e.target.value })}
                required
                className={`w-full ${submitted && !specialty.nameVi ? 'p-invalid' : ''}`}
                placeholder="e.g., Tim mạch"
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
                value={specialty.description || ''}
                onChange={(e) => setSpecialty({ ...specialty, description: e.target.value })}
                required
                rows={4}
                className={`w-full ${submitted && !specialty.description ? 'p-invalid' : ''}`}
                placeholder={t('descriptionPlaceholder')}
              />
              {submitted && !specialty.description && (
                <small className="text-red-500 text-xs mt-1">{t('descriptionRequired')}</small>
              )}
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
                {t('deleteSpecialtyConfirm', { name: specialty.name })}
              </span>
            )}
          </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
