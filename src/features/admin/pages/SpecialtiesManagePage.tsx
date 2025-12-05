import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
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
    if (specialty.name?.trim() && specialty.description?.trim()) {
      if (specialty.id) {
        dispatch(updateSpecialtyRequested({ id: specialty.id, data: { name: specialty.name, description: specialty.description } }));
      } else {
        dispatch(createSpecialtyRequested(specialty as Partial<Specialty>));
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
        <Button icon="pi pi-pencil" size="sm" variant="secondary" onClick={() => editSpecialty(rowData)} />
        <Button icon="pi pi-trash" size="sm" variant="danger" onClick={() => confirmDeleteSpecialty(rowData)} />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2">
      <Button label={t('cancel')} variant="secondary" onClick={hideDialog} />
      <Button label={t('save')} onClick={saveSpecialty} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button label={t('no')} variant="secondary" onClick={hideDeleteDialog} />
      <Button label={t('yes')} variant="danger" onClick={deleteSpecialty} />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('manageSpecialties')}</h1>
      <Card>
        <div className="mb-4">
          <Button label={t('addSpecialty')} icon="pi pi-plus" onClick={openNew} />
        </div>
        <DataTable value={specialties} paginator rows={10} loading={loading} emptyMessage={t('noSpecialties')}>
          <Column field="id" header="ID" style={{ width: '100px' }} />
          <Column field="name" header={t('name')} sortable />
          <Column field="description" header={t('description')} sortable />
          <Column body={actionBodyTemplate} header={t('actions')} style={{ width: '150px' }} />
        </DataTable>
      </Card>

      <Dialog
        visible={dialog}
        style={{ width: '500px' }}
        header={specialty.id ? t('editSpecialty') : t('addSpecialty')}
        modal
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2">{t('name')}</label>
            <InputText
              value={specialty.name || ''}
              onChange={(e) => setSpecialty({ ...specialty, name: e.target.value })}
              required
              autoFocus
              className={`w-full ${submitted && !specialty.name ? 'p-invalid' : ''}`}
            />
            {submitted && !specialty.name && <small className="p-error">{t('nameRequired')}</small>}
          </div>
          <div>
            <label className="block mb-2">{t('description')}</label>
            <InputTextarea
              value={specialty.description || ''}
              onChange={(e) => setSpecialty({ ...specialty, description: e.target.value })}
              required
              rows={4}
              className={`w-full ${submitted && !specialty.description ? 'p-invalid' : ''}`}
            />
            {submitted && !specialty.description && <small className="p-error">{t('descriptionRequired')}</small>}
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={deleteDialog}
        style={{ width: '450px' }}
        header={t('confirm')}
        modal
        footer={deleteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="flex items-center">
          <i className="pi pi-exclamation-triangle mr-3 text-3xl text-red-500" />
          {specialty && <span>{t('deleteSpecialtyConfirm', { name: specialty.name })}</span>}
        </div>
      </Dialog>
    </div>
  );
};
