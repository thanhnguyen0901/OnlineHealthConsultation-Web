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

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        label: t('common:dashboard'),
        icon: 'pi pi-home',
        command: () => {
          if (user.role === 'PATIENT') navigate(ROUTE_PATHS.PATIENT_DASHBOARD);
          else if (user.role === 'DOCTOR') navigate(ROUTE_PATHS.DOCTOR_DASHBOARD);
          else if (user.role === 'ADMIN') navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
        },
      },
    ];

    if (user.role === 'PATIENT') {
      return [
        ...baseItems,
        {
          label: t('patient:askQuestion'),
          icon: 'pi pi-question-circle',
          command: () => navigate(ROUTE_PATHS.ASK_QUESTION),
        },
        {
          label: t('patient:bookAppointment'),
          icon: 'pi pi-calendar-plus',
          command: () => navigate(ROUTE_PATHS.BOOK_APPOINTMENT),
        },
        {
          label: t('patient:consultationHistory'),
          icon: 'pi pi-history',
          command: () => navigate(ROUTE_PATHS.CONSULTATION_HISTORY),
        },
        {
          label: t('patient:profile'),
          icon: 'pi pi-user',
          command: () => navigate(ROUTE_PATHS.PATIENT_PROFILE),
        },
      ];
    }

    if (user.role === 'DOCTOR') {
      return [
        ...baseItems,
        {
          label: t('doctor:inbox'),
          icon: 'pi pi-inbox',
          command: () => navigate(ROUTE_PATHS.INBOX_QUESTIONS),
        },
        {
          label: t('doctor:schedule'),
          icon: 'pi pi-calendar',
          command: () => navigate(ROUTE_PATHS.SCHEDULE),
        },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        ...baseItems,
        {
          label: t('admin:manageUsers'),
          icon: 'pi pi-users',
          command: () => navigate(ROUTE_PATHS.MANAGE_USERS),
        },
        {
          label: t('admin:manageDoctors'),
          icon: 'pi pi-user-plus',
          command: () => navigate(ROUTE_PATHS.MANAGE_DOCTORS),
        },
        {
          label: t('admin:manageSpecialties'),
          icon: 'pi pi-tags',
          command: () => navigate(ROUTE_PATHS.MANAGE_SPECIALTIES),
        },
        {
          label: t('admin:manageAppointments'),
          icon: 'pi pi-calendar-times',
          command: () => navigate(ROUTE_PATHS.MANAGE_APPOINTMENTS),
        },
        {
          label: t('admin:moderation'),
          icon: 'pi pi-shield',
          command: () => navigate(ROUTE_PATHS.MODERATION),
        },
        {
          label: t('admin:reports'),
          icon: 'pi pi-chart-bar',
          command: () => navigate(ROUTE_PATHS.REPORTS),
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

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
