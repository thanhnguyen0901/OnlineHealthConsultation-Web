import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadModerationItemsRequested,
  approveModerationRequested,
  rejectModerationRequested,
} from '../redux/admin.slice';
import { selectAdminModerationItems, selectAdminLoading } from '../redux/admin.selectors';

export const ModerationPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const moderationItems = useAppSelector(selectAdminModerationItems);
  const loading = useAppSelector(selectAdminLoading);

  useEffect(() => {
    dispatch(loadModerationItemsRequested());
  }, [dispatch]);

  const handleApprove = (id: string) => {
    dispatch(approveModerationRequested(id));
  };

  const handleReject = (id: string) => {
    dispatch(rejectModerationRequested(id));
  };

  const typeBodyTemplate = (rowData: any) => {
    return <span className="capitalize">{rowData.type}</span>;
  };

  const snippetBodyTemplate = (rowData: any) => {
    return (
      <div className="max-w-md truncate" title={rowData.content}>
        {rowData.content?.substring(0, 100)}...
      </div>
    );
  };

  const createdAtBodyTemplate = (rowData: any) => {
    return new Date(rowData.createdAt).toLocaleString();
  };

  const statusBodyTemplate = (rowData: any) => {
    const statusColors: Record<string, string> = {
      pending: 'text-yellow-600',
      approved: 'text-green-600',
      rejected: 'text-red-600',
    };
    return <span className={`font-semibold ${statusColors[rowData.status] || ''}`}>{t(rowData.status)}</span>;
  };

  const actionsBodyTemplate = (rowData: any) => {
    if (rowData.status !== 'pending') return null;
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-check"
          size="sm"
          variant="primary"
          onClick={() => handleApprove(rowData.id)}
          label={t('approve')}
        />
        <Button
          icon="pi pi-times"
          size="sm"
          variant="danger"
          onClick={() => handleReject(rowData.id)}
          label={t('reject')}
        />
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('moderation')}</h1>
      <Card>
        <DataTable value={moderationItems} paginator rows={10} loading={loading} emptyMessage={t('noModerationItems')}>
          <Column field="type" header={t('type')} body={typeBodyTemplate} style={{ width: '100px' }} sortable />
          <Column field="content" header={t('snippet')} body={snippetBodyTemplate} />
          <Column field="userName" header={t('user')} sortable />
          <Column field="createdAt" header={t('createdAt')} body={createdAtBodyTemplate} sortable />
          <Column field="status" header={t('status')} body={statusBodyTemplate} sortable />
          <Column header={t('actions')} body={actionsBodyTemplate} style={{ width: '220px' }} />
        </DataTable>
      </Card>
    </div>
  );
};
