import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadModerationItemsRequested,
  approveModerationRequested,
  rejectModerationRequested,
} from '../redux/admin.slice';
import { selectAdminModerationItems, selectAdminLoading } from '../redux/admin.selectors';

type PendingAction = { item: any; action: 'approve' | 'reject' } | null;

export const ModerationPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const dispatch = useAppDispatch();
  const moderationItems = useAppSelector(selectAdminModerationItems);
  const loading = useAppSelector(selectAdminLoading);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    dispatch(loadModerationItemsRequested());
  }, [dispatch]);

  // Opens the confirmation dialog instead of dispatching immediately
  const confirmApprove = (item: any) => setPendingAction({ item, action: 'approve' });
  const confirmReject  = (item: any) => setPendingAction({ item, action: 'reject'  });

  const hideConfirmDialog = () => setPendingAction(null);

  const executeAction = () => {
    if (!pendingAction) return;
    if (pendingAction.action === 'approve') {
      dispatch(approveModerationRequested(pendingAction.item.id));
    } else {
      dispatch(rejectModerationRequested(pendingAction.item.id));
    }
    setPendingAction(null);
  };

  const typeBodyTemplate = (rowData: any) => {
    return <span className="capitalize">{rowData.type}</span>;
  };

  const snippetBodyTemplate = (rowData: any) => {
    const preview = rowData.contentPreview || rowData.content || '';
    return (
      <div className="max-w-md truncate" title={rowData.content}>
        {preview.substring(0, 100)}{preview.length > 100 ? '...' : ''}
      </div>
    );
  };

  const createdAtBodyTemplate = (rowData: any) => {
    return new Date(rowData.createdAt).toLocaleString();
  };

  const statusBodyTemplate = (rowData: any) => {
    // BE sends uppercase status; normalize for display
    // Only QUESTION and ANSWER types appear here (ratings removed)
    const s = (rowData.status || '').toUpperCase();
    const isApproved = s === 'ANSWERED' || s === 'APPROVED';
    const isRejected = s === 'MODERATED';
    const colorClass = isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-yellow-600';
    return (
      <span className={`font-semibold ${colorClass}`}>
        {rowData.status}
      </span>
    );
  };

  const actionsBodyTemplate = (rowData: any) => {
    const s = (rowData.status || '').toUpperCase();
    const isPending = s === 'PENDING';
    if (!isPending) return null;
    // Disable both buttons for this row while any confirm dialog is open
    const dialogOpen = pendingAction !== null;
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-check"
          size="sm"
          variant="primary"
          onClick={() => confirmApprove(rowData)}
          label={t('approve')}
          disabled={dialogOpen}
        />
        <Button
          icon="pi pi-times"
          size="sm"
          variant="danger"
          onClick={() => confirmReject(rowData)}
          label={t('reject')}
          disabled={dialogOpen}
        />
      </div>
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('moderation')}
          </h1>
        </div>

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
            <Column field="author" header={t('user')} sortable style={{ width: '150px' }} />
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

        {/* Approve / Reject confirmation dialog */}
        <Dialog
          visible={pendingAction !== null}
          style={{ width: '30rem' }}
          header={
            pendingAction?.action === 'approve'
              ? t('approveConfirmTitle', 'Confirm Approval')
              : t('rejectConfirmTitle', 'Confirm Rejection')
          }
          modal
          focusOnShow
          footer={
            <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
              <Button label={t('cancel')} variant="secondary" onClick={hideConfirmDialog} />
              <Button
                label={
                  pendingAction?.action === 'approve' ? t('approve') : t('reject')
                }
                variant={pendingAction?.action === 'approve' ? 'primary' : 'danger'}
                onClick={executeAction}
              />
            </div>
          }
          onHide={hideConfirmDialog}
          className="p-dialog-custom"
        >
          <div className="px-6 pt-2 pb-1 space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              {pendingAction?.action === 'approve'
                ? t('approveConfirmBody', 'Are you sure you want to approve this item?')
                : t('rejectConfirmBody', 'Are you sure you want to reject this item? It will be hidden from users.')}
            </p>
            {pendingAction?.item && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate">
                &ldquo;{(pendingAction.item.contentPreview || pendingAction.item.content || '').substring(0, 120)}&rdquo;
              </p>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
};
