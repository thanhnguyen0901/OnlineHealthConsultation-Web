import { all, fork } from 'redux-saga/effects';
import { authSaga } from '@/features/auth/redux/auth.saga';
import { patientSaga } from '@/features/patient/redux/patient.saga';
import { doctorSaga } from '@/features/doctor/redux/doctor.saga';
import { adminSaga } from '@/features/admin/redux/admin.saga';
import { reportsSaga } from '@/features/reports/redux/reports.saga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(patientSaga),
    fork(doctorSaga),
    fork(adminSaga),
    fork(reportsSaga),
  ]);
}
