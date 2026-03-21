import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/state/hooks';
import { addToast } from '@/redux/slices/ui.slice';

export const useToast = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');

  const showSuccess = useCallback(
    (message: string, summary: string = t('success')) => {
      dispatch(
        addToast({
          severity: 'success',
          summary,
          detail: message,
        })
      );
    },
    [dispatch, t]
  );

  const showError = useCallback(
    (message: string, summary: string = t('error')) => {
      dispatch(
        addToast({
          severity: 'error',
          summary,
          detail: message,
        })
      );
    },
    [dispatch, t]
  );

  const showInfo = useCallback(
    (message: string, summary: string = t('info')) => {
      dispatch(
        addToast({
          severity: 'info',
          summary,
          detail: message,
        })
      );
    },
    [dispatch, t]
  );

  const showWarn = useCallback(
    (message: string, summary: string = t('warning')) => {
      dispatch(
        addToast({
          severity: 'warn',
          summary,
          detail: message,
        })
      );
    },
    [dispatch, t]
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarn,
  };
};
