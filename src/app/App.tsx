import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RoutesConfig } from './routes';
import { ToastPortal } from '@/components/common/ToastPortal';
import { useAppDispatch } from '@/state/hooks';
import { meRequested } from '@/features/auth/redux/auth.slice';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Silent refresh: Attempt to restore session from HttpOnly refresh cookie
    // This will call POST /auth/refresh and update Redux state if successful
    // If refresh cookie doesn't exist or is expired, meFailed will be dispatched
    dispatch(meRequested());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <RoutesConfig />
      <ToastPortal />
    </BrowserRouter>
  );
};

export default App;
