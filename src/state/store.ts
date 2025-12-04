import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';
import uiReducer from '@/redux/slices/ui.slice';
import authReducer from '@/features/auth/redux/auth.slice';
import patientReducer from '@/features/patient/redux/patient.slice';
import doctorReducer from '@/features/doctor/redux/doctor.slice';
import adminReducer from '@/features/admin/redux/admin.slice';
import reportsReducer from '@/features/reports/redux/reports.slice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    patient: patientReducer,
    doctor: doctorReducer,
    admin: adminReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
