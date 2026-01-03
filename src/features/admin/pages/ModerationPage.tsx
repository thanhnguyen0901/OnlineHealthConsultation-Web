import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    return (
      <span className={`font-semibold ${statusColors[rowData.status] || ''}`}>
        {t(rowData.status)}
      </span>
    );
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
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('moderation')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <DataTable
            value={moderationItems}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noModerationItems')}
            className="primereact-table"
          >
            <Column
              field="type"
              header={t('type')}
              body={typeBodyTemplate}
              style={{ width: '120px' }}
              sortable
            />
            <Column field="content" header={t('snippet')} body={snippetBodyTemplate} />
            <Column field="userName" header={t('user')} sortable style={{ width: '150px' }} />
            <Column
              field="createdAt"
              header={t('createdAt')}
              body={createdAtBodyTemplate}
              sortable
              style={{ width: '180px' }}
            />
            <Column
              field="status"
              header={t('status')}
              body={statusBodyTemplate}
              sortable
              style={{ width: '120px' }}
            />
            <Column header={t('actions')} body={actionsBodyTemplate} style={{ width: '220px' }} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};
