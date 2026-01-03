import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RoutesConfig } from './routes';
import { ToastPortal } from '@/components/common/ToastPortal';
import { useAppDispatch } from '@/state/hooks';
import { meRequested } from '@/features/auth/redux/auth.slice';
import { storage } from '@/utils/storage';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Auto-login: If access token exists, fetch user info
    const accessToken = storage.get<string>('accessToken');
    if (accessToken) {
      dispatch(meRequested());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <RoutesConfig />
      <ToastPortal />
    </BrowserRouter>
  );
};

export default App;
