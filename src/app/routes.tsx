import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Spinner } from '@/components/common/Spinner';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { HomePage } from '@/pages/HomePage';

// Lazy-loaded page components
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  }))
);
const SpecialtyListPage = lazy(() =>
  import('@/features/public/pages/SpecialtyListPage').then((m) => ({
    default: m.SpecialtyListPage,
  }))
);
const DoctorListPage = lazy(() =>
  import('@/features/public/pages/DoctorListPage').then((m) => ({ default: m.DoctorListPage }))
);
const DoctorDetailPage = lazy(() =>
  import('@/features/public/pages/DoctorDetailPage').then((m) => ({
    default: m.DoctorDetailPage,
  }))
);
const PatientDashboardPage = lazy(() =>
  import('@/features/patient/pages/PatientDashboardPage').then((m) => ({
    default: m.PatientDashboardPage,
  }))
);
const AskQuestionPage = lazy(() =>
  import('@/features/patient/pages/AskQuestionPage').then((m) => ({ default: m.AskQuestionPage }))
);
const BookAppointmentPage = lazy(() =>
  import('@/features/patient/pages/BookAppointmentPage').then((m) => ({
    default: m.BookAppointmentPage,
  }))
);
const ConsultationHistoryPage = lazy(() =>
  import('@/features/patient/pages/ConsultationHistoryPage').then((m) => ({
    default: m.ConsultationHistoryPage,
  }))
);
const PatientConsultationSessionPage = lazy(() =>
  import('@/features/patient/pages/PatientConsultationSessionPage').then((m) => ({
    default: m.PatientConsultationSessionPage,
  }))
);
const PatientProfilePage = lazy(() =>
  import('@/features/patient/pages/PatientProfilePage').then((m) => ({
    default: m.PatientProfilePage,
  }))
);
const DoctorDashboardPage = lazy(() =>
  import('@/features/doctor/pages/DoctorDashboardPage').then((m) => ({
    default: m.DoctorDashboardPage,
  }))
);
const InboxQuestionsPage = lazy(() =>
  import('@/features/doctor/pages/InboxQuestionsPage').then((m) => ({
    default: m.InboxQuestionsPage,
  }))
);
const SchedulePage = lazy(() =>
  import('@/features/doctor/pages/SchedulePage').then((m) => ({ default: m.SchedulePage }))
);
const DoctorAppointmentsPage = lazy(() =>
  import('@/features/doctor/pages/DoctorAppointmentsPage').then((m) => ({
    default: m.DoctorAppointmentsPage,
  }))
);
const DoctorPatientsPage = lazy(() =>
  import('@/features/doctor/pages/DoctorPatientsPage').then((m) => ({
    default: m.DoctorPatientsPage,
  }))
);
const DoctorRatingsPage = lazy(() =>
  import('@/features/doctor/pages/DoctorRatingsPage').then((m) => ({
    default: m.DoctorRatingsPage,
  }))
);
const DoctorProfilePage = lazy(() =>
  import('@/features/doctor/pages/DoctorProfilePage').then((m) => ({
    default: m.DoctorProfilePage,
  }))
);
const ConsultationSessionPage = lazy(() =>
  import('@/features/doctor/pages/ConsultationSessionPage').then((m) => ({
    default: m.ConsultationSessionPage,
  }))
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const UsersManagePage = lazy(() =>
  import('@/features/admin/pages/UsersManagePage').then((m) => ({ default: m.UsersManagePage }))
);
const PatientsManagePage = lazy(() =>
  import('@/features/admin/pages/PatientsManagePage').then((m) => ({
    default: m.PatientsManagePage,
  }))
);
const DoctorsManagePage = lazy(() =>
  import('@/features/admin/pages/DoctorsManagePage').then((m) => ({ default: m.DoctorsManagePage }))
);
const SpecialtiesManagePage = lazy(() =>
  import('@/features/admin/pages/SpecialtiesManagePage').then((m) => ({
    default: m.SpecialtiesManagePage,
  }))
);
const AppointmentsManagePage = lazy(() =>
  import('@/features/admin/pages/AppointmentsManagePage').then((m) => ({
    default: m.AppointmentsManagePage,
  }))
);
const ModerationPage = lazy(() =>
  import('@/features/admin/pages/ModerationPage').then((m) => ({ default: m.ModerationPage }))
);
const ReportsPage = lazy(() =>
  import('@/features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFoundPage }))
);
const ForbiddenPage = lazy(() =>
  import('@/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage }))
);

const HomeRedirect: React.FC = () => {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <HomePage />;

  if (user.role === ROLES.PATIENT) return <Navigate to={ROUTE_PATHS.PATIENT_DASHBOARD} replace />;
  if (user.role === ROLES.DOCTOR) return <Navigate to={ROUTE_PATHS.DOCTOR_DASHBOARD} replace />;
  if (user.role === ROLES.ADMIN) return <Navigate to={ROUTE_PATHS.ADMIN_DASHBOARD} replace />;

  return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
};

export const RoutesConfig: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }
    >
      <Routes>
        <Route path={ROUTE_PATHS.HOME} element={<HomeRedirect />} />
        <Route path={ROUTE_PATHS.SPECIALTIES} element={<SpecialtyListPage />} />
        <Route path={ROUTE_PATHS.DOCTORS} element={<DoctorListPage />} />
        <Route path={ROUTE_PATHS.DOCTOR_DETAIL} element={<DoctorDetailPage />} />
        <Route path={ROUTE_PATHS.FORBIDDEN} element={<ForbiddenPage />} />

        <Route element={<AuthLayout />}>
          <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
          <Route path={ROUTE_PATHS.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTE_PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTE_PATHS.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>

        <Route
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route
            path={ROUTE_PATHS.PATIENT_DASHBOARD}
            element={
              <RoleGuard roles={['PATIENT']}>
                <PatientDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.ASK_QUESTION}
            element={
              <RoleGuard roles={['PATIENT']}>
                <AskQuestionPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.BOOK_APPOINTMENT}
            element={
              <RoleGuard roles={['PATIENT']}>
                <BookAppointmentPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.CONSULTATION_HISTORY}
            element={
              <RoleGuard roles={['PATIENT']}>
                <ConsultationHistoryPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.PATIENT_CONSULTATION_SESSION}
            element={
              <RoleGuard roles={['PATIENT']}>
                <PatientConsultationSessionPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.PATIENT_PROFILE}
            element={
              <RoleGuard roles={['PATIENT']}>
                <PatientProfilePage />
              </RoleGuard>
            }
          />

          <Route
            path={ROUTE_PATHS.DOCTOR_DASHBOARD}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <DoctorDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.INBOX_QUESTIONS}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <InboxQuestionsPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.SCHEDULE}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <SchedulePage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.DOCTOR_PATIENTS}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <DoctorPatientsPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.DOCTOR_APPOINTMENTS}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <DoctorAppointmentsPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.DOCTOR_RATINGS}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <DoctorRatingsPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.DOCTOR_PROFILE}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <DoctorProfilePage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.DOCTOR_CONSULTATION_SESSION}
            element={
              <RoleGuard roles={['DOCTOR']}>
                <ConsultationSessionPage />
              </RoleGuard>
            }
          />

          <Route
            path={ROUTE_PATHS.ADMIN_DASHBOARD}
            element={
              <RoleGuard roles={['ADMIN']}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.MANAGE_USERS}
            element={
              <RoleGuard roles={['ADMIN']}>
                <UsersManagePage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.MANAGE_PATIENTS}
            element={
              <RoleGuard roles={['ADMIN']}>
                <PatientsManagePage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.MANAGE_DOCTORS}
            element={
              <RoleGuard roles={['ADMIN']}>
                <DoctorsManagePage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.MANAGE_SPECIALTIES}
            element={
              <RoleGuard roles={['ADMIN']}>
                <SpecialtiesManagePage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.MANAGE_APPOINTMENTS}
            element={
              <RoleGuard roles={['ADMIN']}>
                <AppointmentsManagePage />
              </RoleGuard>
            }
          />
          <Route
            path={ROUTE_PATHS.MODERATION}
            element={
              <RoleGuard roles={['ADMIN']}>
                <ModerationPage />
              </RoleGuard>
            }
          />

          <Route
            path={ROUTE_PATHS.REPORTS}
            element={
              <RoleGuard roles={['ADMIN', 'DOCTOR']}>
                <ReportsPage />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
