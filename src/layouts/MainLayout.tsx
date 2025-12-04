import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button as PrimeButton } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { toggleDarkMode } from '@/redux/slices/ui.slice';
import { logoutRequested } from '@/features/auth/redux/auth.slice';
import { ROUTE_PATHS } from '@/constants/routePaths';

export const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const handleLogout = () => {
    dispatch(logoutRequested());
    navigate(ROUTE_PATHS.LOGIN);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const menuItems = [
    {
      label: t('common:dashboard'),
      icon: 'pi pi-home',
      command: () => {
        if (user?.role === 'PATIENT') navigate(ROUTE_PATHS.PATIENT_DASHBOARD);
        else if (user?.role === 'DOCTOR') navigate(ROUTE_PATHS.DOCTOR_DASHBOARD);
        else if (user?.role === 'ADMIN') navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
      },
    },
  ];

  const endContent = (
    <div className="flex items-center gap-2">
      <PrimeButton
        icon={darkMode ? 'pi pi-sun' : 'pi pi-moon'}
        rounded
        text
        onClick={() => dispatch(toggleDarkMode())}
        tooltip={t('common:darkMode')}
      />
      <PrimeButton
        label={i18n.language.toUpperCase()}
        rounded
        text
        onClick={toggleLanguage}
        tooltip={t('common:language')}
      />
      <span className="text-sm font-medium">{user?.name}</span>
      <PrimeButton
        icon="pi pi-sign-out"
        rounded
        text
        onClick={handleLogout}
        tooltip={t('common:logout')}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Menubar model={menuItems} end={endContent} />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};
