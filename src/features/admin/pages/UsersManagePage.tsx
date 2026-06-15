import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadUsersRequested,
  createUserRequested,
  updateUserRequested,
  deleteUserRequested,
} from '../redux/admin.slice';
import {
  selectAdminUsers,
  selectAdminLoading,
  selectAdminUsersPagination,
  selectAdminError,
} from '../redux/admin.selectors';
import type { User } from '@/types/common';
import { ROLES } from '@/constants/roles';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';

export const UsersManagePage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAdminUsers);
  const loading = useAppSelector(selectAdminLoading);
  const usersPagination = useAppSelector(selectAdminUsersPagination);
  const error = useAppSelector(selectAdminError);

  const [first, setFirst] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [revision, setRevision] = useState(0);

  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [user, setUser] = useState<Partial<User> & { password?: string }>({});
  const [editingSnapshot, setEditingSnapshot] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const roleOptions = [
    { label: t('common:roles.patient'), value: ROLES.PATIENT },
    { label: t('common:roles.doctor'), value: ROLES.DOCTOR },
  ];

  useEffect(() => {
    const page = Math.floor(first / pageSize) + 1;
    dispatch(loadUsersRequested({ page, limit: pageSize }));
  }, [dispatch, first, pageSize, revision]);

  const openNew = () => {
    setUser({});
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

  const saveUser = () => {
    setSubmitted(true);
    const isCreate = !user.id;
    const valid =
      !!user.firstName?.trim() &&
      !!user.lastName?.trim() &&
      !!user.email?.trim() &&
      (!isCreate || !!user.password?.trim());
    if (!valid) return;
    if (isCreate) {
      dispatch(
        createUserRequested({
          ...user,
          role: user.role || ROLES.PATIENT,
          password: user.password!,
        } as Partial<User> & {
          password: string;
        })
      );
      setFirst(0);
      setRevision((r) => r + 1);
    } else {
      if (!editingSnapshot) return;
      dispatch(
        updateUserRequested({
          id: user.id!,
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        })
      );
    }
    setDialog(false);
    setUser({});
  };

  const editUser = (user: User) => {
    setUser({ ...user });
    setEditingSnapshot({
      firstName: (user.firstName ?? '').trim(),
      lastName: (user.lastName ?? '').trim(),
      email: (user.email ?? '').trim(),
    });
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
    setRevision((r) => r + 1);
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

  const roleBodyTemplate = (rowData: User) => translateEnumValue(t, 'role', rowData.role);

  const isEditDirty = user.id
    ? !!editingSnapshot &&
      ((user.firstName ?? '').trim() !== editingSnapshot.firstName ||
        (user.lastName ?? '').trim() !== editingSnapshot.lastName ||
        (user.email ?? '').trim() !== editingSnapshot.email)
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
        onClick={saveUser}
        loading={loading}
        disabled={loading || !isEditDirty}
        data-testid="admin-user-save"
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
      <Button label={t('yes')} size="sm" variant="danger" onClick={deleteUser} loading={loading} />
    </div>
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8" data-testid="admin-user-management-page">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('manageUsers')}
        </h1>
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => {
              const page = Math.floor(first / pageSize) + 1;
              dispatch(loadUsersRequested({ page, limit: pageSize }));
            }}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="mb-4">
            <Button icon="pi pi-plus" size="sm" onClick={openNew}>
              {t('addUser')}
            </Button>
          </div>
          <DataTable
            key={`users-table-${i18n.language}`}
            value={users}
            lazy
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 20, 50]}
            first={first}
            totalRecords={usersPagination?.total ?? 0}
            onPage={(e: any) => {
              setFirst(e.first);
              setPageSize(e.rows);
            }}
            loading={loading}
            emptyMessage={t('noUsers')}
            className="primereact-table"
            data-testid="admin-user-table"
          >
            <Column field="name" header={t('name')} sortable />
            <Column field="email" header={t('email')} sortable />
            <Column
              field="role"
              header={t('role')}
              body={roleBodyTemplate}
              sortable
              style={{ width: '140px' }}
            />
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('firstName')}
                </label>
                <InputText
                  value={user.firstName || ''}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  required
                  autoFocus
                  className={`w-full ${submitted && !user.firstName ? 'p-invalid' : ''}`}
                />
                {submitted && !user.firstName && (
                  <small className="text-red-500 text-xs mt-1">{t('firstNameRequired')}</small>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('lastName')}
                </label>
                <InputText
                  value={user.lastName || ''}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  required
                  className={`w-full ${submitted && !user.lastName ? 'p-invalid' : ''}`}
                />
                {submitted && !user.lastName && (
                  <small className="text-red-500 text-xs mt-1">{t('lastNameRequired')}</small>
                )}
              </div>
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
            {!user.id && (
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
            )}
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
                  {t('deleteUserConfirm', {
                    name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
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
