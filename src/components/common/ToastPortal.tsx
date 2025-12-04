import React, { useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { useAppSelector } from '@/state/hooks';

export const ToastPortal: React.FC = () => {
  const toastRef = useRef<Toast>(null);
  const toasts = useAppSelector((state) => state.ui.toasts);

  useEffect(() => {
    if (toasts.length > 0 && toastRef.current) {
      const latestToast = toasts[toasts.length - 1];
      toastRef.current.show({
        severity: latestToast.severity,
        summary: latestToast.summary,
        detail: latestToast.detail,
        life: 3000,
      });
    }
  }, [toasts]);

  return <Toast ref={toastRef} position="top-right" />;
};
