import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RoutesConfig } from './routes';
import { ToastPortal } from '@/components/common/ToastPortal';
import { useAppDispatch } from '@/state/hooks';
import { meRequested } from '@/features/auth/redux/auth.slice';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  // useRef prevents StrictMode's double-invocation from firing two concurrent POST /auth/refresh requests.
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    dispatch(meRequested());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div data-testid="app-root" className="min-h-screen">
        <RoutesConfig />
        <ToastPortal />
      </div>
    </BrowserRouter>
  );
};

export default App;
