export const doctors = {
  approvedDoctorId: process.env.E2E_APPROVED_DOCTOR_ID || '',
  pendingDoctorId: process.env.E2E_PENDING_DOCTOR_ID || '',
  searchKeyword: process.env.E2E_DOCTOR_SEARCH_KEYWORD || 'cardiology',
  specialtyName: process.env.E2E_SPECIALTY_NAME || 'Cardiology',
};
