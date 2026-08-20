import { combineReducers } from '@reduxjs/toolkit';
import uiReducer from '@/redux/slices/ui.slice';
import authReducer from '@/features/auth/redux/auth.slice';
import patientReducer from '@/features/patient/redux/patient.slice';
import doctorReducer from '@/features/doctor/redux/doctor.slice';
import adminReducer from '@/features/admin/redux/admin.slice';
import reportsReducer from '@/features/reports/redux/reports.slice';

export const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  patient: patientReducer,
  doctor: doctorReducer,
  admin: adminReducer,
  reports: reportsReducer,
});
