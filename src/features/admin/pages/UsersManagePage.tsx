import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadUsersRequested,
  createUserRequested,
  updateUserRequested,
  deleteUserRequested,
} from '../redux/admin.slice';
import { selectAdminUsers, selectAdminLoading } from '../redux/admin.selectors';
import type { User } from '@/types/common';

export const UsersManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAdminUsers);
  const loading = useAppSelector(selectAdminLoading);

  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [user, setUser] = useState<Partial<User> & { password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const roleOptions = [
    { label: 'Patient', value: 'PATIENT' },
    { label: 'Doctor', value: 'DOCTOR' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  useEffect(() => {
    dispatch(loadUsersRequested());
  }, [dispatch]);

  const openNew = () => {
    setUser({});
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

  const saveUser = () => {
    setSubmitted(true);
    if (user.name?.trim() && user.email?.trim()) {
      if (user.id) {
        dispatch(
          updateUserRequested({
            id: user.id,
            data: { name: user.name, email: user.email, role: user.role },
          })
        );
      } else {
        if (user.password) {
          dispatch(
            createUserRequested({ ...user, password: user.password } as Partial<User> & {
              password: string;
            })
          );
        }
      }
      setDialog(false);
      setUser({});
    }
  };

  const editUser = (user: User) => {
    setUser({ ...user });
    setDialog(true);
  };

  const confirmDeleteUser = (user: User) => {
    setUser(user);
    setDeleteDialog(true);
  };

  const deleteUser = () => {
    if (user.id) {
      dispatch(deleteUserRequested(user.id));
    }
    setDeleteDialog(false);
    setUser({});
  };

  const actionBodyTemplate = (rowData: User) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          size="sm"
          variant="secondary"
          onClick={() => editUser(rowData)}
        />
        <Button
          icon="pi pi-trash"
          size="sm"
          variant="danger"
          onClick={() => confirmDeleteUser(rowData)}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('cancel')} variant="secondary" onClick={hideDialog} />
      <Button label={t('save')} onClick={saveUser} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
      <Button label={t('no')} variant="secondary" onClick={hideDeleteDialog} />
      <Button label={t('yes')} variant="danger" onClick={deleteUser} />
    </div>
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('manageUsers')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="mb-4">
            <Button icon="pi pi-plus" onClick={openNew}>
              {t('addUser')}
            </Button>
          </div>
          <DataTable
            value={users}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noUsers')}
            className="primereact-table"
          >
            <Column field="name" header={t('name')} sortable />
            <Column field="email" header={t('email')} sortable />
            <Column field="role" header={t('role')} sortable style={{ width: '140px' }} />
            <Column body={actionBodyTemplate} header={t('actions')} style={{ width: '140px' }} />
          </DataTable>
        </div>

        <Dialog
          visible={dialog}
          style={{ width: '32rem' }}
          header={user.id ? t('editUser') : t('addUser')}
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
                value={user.name || ''}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
                autoFocus
                className={`w-full ${submitted && !user.name ? 'p-invalid' : ''}`}
              />
              {submitted && !user.name && (
                <small className="text-red-500 text-xs mt-1">{t('nameRequired')}</small>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('email')}
              </label>
              <InputText
                value={user.email || ''}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
                className={`w-full ${submitted && !user.email ? 'p-invalid' : ''}`}
              />
              {submitted && !user.email && (
                <small className="text-red-500 text-xs mt-1">{t('emailRequired')}</small>
              )}
            </div>
            {!user.id && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('password')}
                </label>
                <InputText
                  type="password"
                  value={user.password || ''}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  required
                  className={`w-full ${submitted && !user.password ? 'p-invalid' : ''}`}
                />
                {submitted && !user.password && (
                  <small className="text-red-500 text-xs mt-1">{t('passwordRequired')}</small>
                )}
              </div>
            )}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('role')}
              </label>
              <Dropdown
                value={user.role}
                options={roleOptions}
                onChange={(e) => setUser({ ...user, role: e.value })}
                placeholder={t('selectRole')}
                className="w-full"
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
            {user && (
              <span className="text-gray-700 dark:text-gray-300 text-base">
                {t('deleteUserConfirm', { name: user.name })}
              </span>
            )}
          </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
