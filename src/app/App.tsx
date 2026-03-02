import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RoutesConfig } from './routes';
import { ToastPortal } from '@/components/common/ToastPortal';
import { useAppDispatch } from '@/state/hooks';
import { meRequested } from '@/features/auth/redux/auth.slice';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  // Guard against React StrictMode's double-invocation of useEffect which would
  // fire two simultaneous POST /auth/refresh requests and quickly exhaust the
  // rate limiter. useRef persists across StrictMode's simulated remount cycle.
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
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
