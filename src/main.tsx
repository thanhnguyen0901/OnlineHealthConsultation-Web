import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/state/store';
import App from '@/app/App';
import '@/i18n/initI18n';
import { setYupLocale } from '@/utils/yupLocale';
import '@/index.css';

// Initialize Yup locale for form validation
setYupLocale();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
