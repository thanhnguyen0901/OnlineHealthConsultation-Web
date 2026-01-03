import { useCallback } from 'react';
import { useAppDispatch } from '@/state/hooks';
import { addToast } from '@/redux/slices/ui.slice';

export const useToast = () => {
  const dispatch = useAppDispatch();

  const showSuccess = useCallback(
    (message: string, summary: string = 'Success') => {
      dispatch(
        addToast({
          severity: 'success',
          summary,
          detail: message,
        })
      );
    },
    [dispatch]
  );

  const showError = useCallback(
    (message: string, summary: string = 'Error') => {
      dispatch(
        addToast({
          severity: 'error',
          summary,
          detail: message,
        })
      );
    },
    [dispatch]
  );

  const showInfo = useCallback(
    (message: string, summary: string = 'Info') => {
      dispatch(
        addToast({
          severity: 'info',
          summary,
          detail: message,
        })
      );
    },
    [dispatch]
  );

  const showWarn = useCallback(
    (message: string, summary: string = 'Warning') => {
      dispatch(
        addToast({
          severity: 'warn',
          summary,
          detail: message,
        })
      );
    },
    [dispatch]
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarn,
  };
};
