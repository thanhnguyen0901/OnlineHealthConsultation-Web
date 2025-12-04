import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RoutesConfig } from './routes';
import { ToastPortal } from '@/components/common/ToastPortal';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RoutesConfig />
      <ToastPortal />
    </BrowserRouter>
  );
};

export default App;
