import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button as PrimeButton } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { toggleDarkMode } from '@/redux/slices/ui.slice';
import { logoutRequested } from '@/features/auth/redux/auth.slice';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { ROLES } from '@/constants/roles';

export const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        path:
          user.role === ROLES.PATIENT
            ? ROUTE_PATHS.PATIENT_DASHBOARD
            : user.role === ROLES.DOCTOR
              ? ROUTE_PATHS.DOCTOR_DASHBOARD
              : ROUTE_PATHS.ADMIN_DASHBOARD,
      },
    ];

    if (user.role === ROLES.PATIENT) {
      return [
        ...baseItems,
        {
          label: t('patient:askQuestion'),
          icon: 'pi pi-question-circle',
          path: ROUTE_PATHS.ASK_QUESTION,
        },
        {
          label: t('patient:bookAppointment'),
          icon: 'pi pi-calendar-plus',
          path: ROUTE_PATHS.BOOK_APPOINTMENT,
        },
        {
          label: t('patient:consultationHistory'),
          icon: 'pi pi-history',
          path: ROUTE_PATHS.CONSULTATION_HISTORY,
        },
        {
          label: t('patient:profile'),
          icon: 'pi pi-user',
          path: ROUTE_PATHS.PATIENT_PROFILE,
        },
      ];
    }

    if (user.role === ROLES.DOCTOR) {
      return [
        ...baseItems,
        {
          label: t('doctor:inbox'),
          icon: 'pi pi-inbox',
          path: ROUTE_PATHS.INBOX_QUESTIONS,
        },
        {
          label: t('doctor:schedule'),
          icon: 'pi pi-calendar',
          path: ROUTE_PATHS.SCHEDULE,
        },
      ];
    }

    if (user.role === ROLES.ADMIN) {
      return [
        ...baseItems,
        {
          label: t('admin:manageUsers'),
          icon: 'pi pi-users',
          path: ROUTE_PATHS.MANAGE_USERS,
        },
        {
          label: t('admin:manageDoctors'),
          icon: 'pi pi-user-plus',
          path: ROUTE_PATHS.MANAGE_DOCTORS,
        },
        {
          label: t('admin:manageSpecialties'),
          icon: 'pi pi-tags',
          path: ROUTE_PATHS.MANAGE_SPECIALTIES,
        },
        {
          label: t('admin:manageAppointments'),
          icon: 'pi pi-calendar-times',
          path: ROUTE_PATHS.MANAGE_APPOINTMENTS,
        },
        {
          label: t('admin:moderation'),
          icon: 'pi pi-shield',
          path: ROUTE_PATHS.MODERATION,
        },
        {
          label: t('admin:reports'),
          icon: 'pi pi-chart-bar',
          path: ROUTE_PATHS.REPORTS,
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <i className="pi pi-heart-fill text-2xl text-blue-600" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">{t('common:appTitle')}</span>
            </div>
          )}
          {!sidebarOpen && <i className="pi pi-heart-fill text-2xl text-blue-600 mx-auto" />}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 pl-2'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <i className={`${item.icon} text-lg`} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer - Toggle Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <i className={`pi ${sidebarOpen ? 'pi-angle-left' : 'pi-angle-right'} text-xl`} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('common:welcome')}, {user?.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <PrimeButton
                icon={darkMode ? 'pi pi-sun' : 'pi pi-moon'}
                rounded
                text
                onClick={() => dispatch(toggleDarkMode())}
                tooltip={t('common:darkMode')}
                tooltipOptions={{ position: 'bottom' }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              />
              <PrimeButton
                label={i18n.language.toUpperCase()}
                rounded
                text
                onClick={toggleLanguage}
                tooltip={t('common:language')}
                tooltipOptions={{ position: 'bottom' }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              />
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
              <PrimeButton
                icon="pi pi-sign-out"
                rounded
                text
                onClick={handleLogout}
                tooltip={t('common:logout')}
                tooltipOptions={{ position: 'bottom' }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
