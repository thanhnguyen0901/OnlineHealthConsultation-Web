import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadModerationItemsRequested,
  approveModerationRequested,
  rejectModerationRequested,
} from '../redux/admin.slice';
import {
  selectAdminModerationItems,
  selectAdminLoading,
  selectAdminError,
} from '../redux/admin.selectors';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';
import type { ModerationItem } from '../apis/admin.api';

type PendingAction = { item: ModerationItem; action: 'approve' | 'reject' } | null;

const isHiddenStatus = (status?: string) =>
  ['MODERATED', 'HIDDEN', 'REJECTED'].includes((status || '').toUpperCase());

const isVisibleStatus = (status?: string) =>
  ['PENDING', 'ANSWERED', 'APPROVED', 'VISIBLE'].includes((status || '').toUpperCase());

export const ModerationPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const dispatch = useAppDispatch();
  const moderationItems = useAppSelector(selectAdminModerationItems);
  const loading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    dispatch(loadModerationItemsRequested());
  }, [dispatch]);

  const confirmApprove = (item: ModerationItem) => setPendingAction({ item, action: 'approve' });
  const confirmReject = (item: ModerationItem) => setPendingAction({ item, action: 'reject' });

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

  const typeBodyTemplate = (rowData: ModerationItem) => {
    return <span>{translateEnumValue(t, 'type', rowData.type)}</span>;
  };

  const snippetBodyTemplate = (rowData: ModerationItem) => {
    const preview = rowData.contentPreview || rowData.content || '';
    return (
      <div
        className="max-w-[360px] whitespace-normal break-words leading-5"
        title={rowData.content}
      >
        {preview.substring(0, 160)}
        {preview.length > 160 ? '...' : ''}
      </div>
    );
  };

  const authorBodyTemplate = (rowData: ModerationItem) => (
    <div className="max-w-[180px] truncate whitespace-nowrap" title={rowData.author}>
      {rowData.author}
    </div>
  );

  const contextBodyTemplate = (rowData: ModerationItem) => {
    const context = rowData.context ?? {};
    const lines = [
      context.title ? `${t('title')}: ${context.title}` : null,
      context.questionTitle ? `${t('question')}: ${context.questionTitle}` : null,
      context.doctor ? `${t('doctor')}: ${context.doctor}` : null,
      context.patient ? `${t('patient')}: ${context.patient}` : null,
      context.score ? `${t('score')}: ${context.score}/5` : null,
    ].filter(Boolean);

    return (
      <div className="max-w-[280px] whitespace-normal break-words text-sm leading-5 text-gray-700 dark:text-gray-300">
        {lines.length > 0 ? lines.join(' · ') : t('noContext')}
      </div>
    );
  };

  const createdAtBodyTemplate = (rowData: ModerationItem) => {
    return new Date(rowData.createdAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const statusBodyTemplate = (rowData: ModerationItem) => {
    const s = (rowData.status || '').toUpperCase();
    const isApproved = s === 'ANSWERED' || s === 'APPROVED' || s === 'VISIBLE';
    const isRejected = isHiddenStatus(s);
    const colorClass = isApproved
      ? 'text-green-600'
      : isRejected
        ? 'text-red-600'
        : 'text-yellow-600';
    return (
      <span className={`font-semibold ${colorClass}`}>
        {translateEnumValue(t, 'status', rowData.status)}
      </span>
    );
  };

  const actionsBodyTemplate = (rowData: ModerationItem) => {
    const dialogOpen = pendingAction !== null;
    const canApprove = isHiddenStatus(rowData.status);
    const canReject = isVisibleStatus(rowData.status);
    return (
      <div className="flex gap-2">
        {canApprove && (
          <Button
            icon="pi pi-check"
            size="sm"
            variant="primary"
            onClick={() => confirmApprove(rowData)}
            label={t('approve')}
            disabled={dialogOpen}
          />
        )}
        {canReject && (
          <Button
            icon="pi pi-times"
            size="sm"
            variant="danger"
            onClick={() => confirmReject(rowData)}
            label={t('reject')}
            disabled={dialogOpen}
          />
        )}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8" data-testid="admin-moderation-page">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('moderation')}
          </h1>
        </div>
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => dispatch(loadModerationItemsRequested())}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <DataTable
            key={`moderation-table-${i18n.language}`}
            value={moderationItems}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noModerationItems')}
            className="primereact-table"
            data-testid="moderation-table"
          >
            <Column
              field="type"
              header={t('type')}
              body={typeBodyTemplate}
              style={{ width: '120px' }}
              sortable
            />
            <Column
              field="content"
              header={t('snippet')}
              body={snippetBodyTemplate}
              style={{ width: '360px' }}
            />
            <Column
              header={t('reviewContext')}
              body={contextBodyTemplate}
              style={{ width: '300px' }}
            />
            <Column
              field="author"
              header={t('user')}
              body={authorBodyTemplate}
              sortable
              style={{ width: '180px' }}
            />
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

        <Dialog
          visible={pendingAction !== null}
          style={{ width: '30rem' }}
          header={
            pendingAction?.action === 'approve' ? t('approveConfirmTitle') : t('rejectConfirmTitle')
          }
          modal
          focusOnShow
          footer={
            <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
              <Button
                label={t('cancel')}
                size="sm"
                variant="secondary"
                onClick={hideConfirmDialog}
              />
              <Button
                label={pendingAction?.action === 'approve' ? t('approve') : t('reject')}
                size="sm"
                variant={pendingAction?.action === 'approve' ? 'primary' : 'danger'}
                onClick={executeAction}
                loading={loading}
                disabled={loading}
              />
            </div>
          }
          onHide={hideConfirmDialog}
          className="p-dialog-custom"
        >
          <div className="px-6 pt-2 pb-1 space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              {pendingAction?.action === 'approve'
                ? t('approveConfirmBody')
                : t('rejectConfirmBody')}
            </p>
            {pendingAction?.item && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate">
                &ldquo;
                {(pendingAction.item.contentPreview || pendingAction.item.content || '').substring(
                  0,
                  120
                )}
                &rdquo;
              </p>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
};
