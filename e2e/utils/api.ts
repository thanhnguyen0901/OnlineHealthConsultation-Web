import { APIRequestContext, APIResponse } from '@playwright/test';
import type { E2EAccount } from '../test-data/users';

const backendURL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const apiURL = (path: string) => `${backendURL.replace(/\/$/, '')}/api${path}`;

type ApiSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

type RequestOptions = {
  token?: string;
  data?: unknown;
};

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

async function parseJson<T>(response: APIResponse, method: string): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok()) {
    throw new Error(`${method} ${response.url()} failed ${response.status()}: ${text}`);
  }
  return unwrap<T>(payload);
}

const headers = (token?: string) => (token ? { Authorization: `Bearer ${token}` } : undefined);

async function getJson<T>(request: APIRequestContext, path: string, token?: string) {
  return parseJson<T>(await request.get(apiURL(path), { headers: headers(token) }), 'GET');
}

async function postJson<T>(request: APIRequestContext, path: string, options: RequestOptions = {}) {
  return parseJson<T>(
    await request.post(apiURL(path), {
      data: options.data,
      headers: headers(options.token),
    }),
    'POST'
  );
}

async function patchJson<T>(request: APIRequestContext, path: string, options: RequestOptions = {}) {
  return parseJson<T>(
    await request.patch(apiURL(path), {
      data: options.data,
      headers: headers(options.token),
    }),
    'PATCH'
  );
}

export async function getPublicDoctors(request: APIRequestContext) {
  try {
    return await getJson<any[]>(request, '/public/doctors?limit=10');
  } catch {
    return [];
  }
}

export async function loginViaApi(request: APIRequestContext, account: E2EAccount): Promise<ApiSession> {
  if (!account.email || !account.password) {
    throw new Error(`Missing ${account.role} credentials`);
  }

  return postJson<ApiSession>(request, '/auth/login', {
    data: {
      email: account.email,
      password: account.password,
    },
  });
}

export async function getPublicSpecialties(request: APIRequestContext) {
  return getJson<any[]>(request, '/public/specialties');
}

export async function updateDoctorSchedule(
  request: APIRequestContext,
  token: string,
  schedule: unknown[]
) {
  return patchJson<any>(request, '/doctors/me/schedule', {
    token,
    data: { schedule },
  });
}

export async function bookAppointmentApi(
  request: APIRequestContext,
  token: string,
  data: {
    doctorId: string;
    scheduledAt: string;
    durationMinutes?: number;
    reason: string;
    notes?: string;
  }
) {
  return postJson<any>(request, '/appointments', { token, data });
}

export async function getAppointmentApi(request: APIRequestContext, token: string, appointmentId: string) {
  return getJson<any>(request, `/appointments/${appointmentId}`, token);
}

export async function confirmAppointmentApi(
  request: APIRequestContext,
  token: string,
  appointmentId: string
) {
  return patchJson<any>(request, `/appointments/${appointmentId}/confirm`, { token });
}

export async function startConsultationApi(
  request: APIRequestContext,
  token: string,
  appointmentId: string
) {
  return postJson<any>(request, `/consultations/${appointmentId}/start`, {
    token,
    data: { channel: 'CHAT' },
  });
}

export async function endConsultationApi(request: APIRequestContext, token: string, appointmentId: string) {
  return patchJson<any>(request, `/consultations/${appointmentId}/end`, { token });
}

export async function saveConsultationSummaryApi(
  request: APIRequestContext,
  token: string,
  appointmentId: string,
  summary: string
) {
  return patchJson<any>(request, `/consultations/${appointmentId}/summary`, {
    token,
    data: { summary },
  });
}

export async function createPrescriptionApi(
  request: APIRequestContext,
  token: string,
  appointmentId: string,
  medicationName: string
) {
  return postJson<any>(request, `/consultations/${appointmentId}/prescriptions`, {
    token,
    data: {
      notes: 'E2E prescription notes',
      items: [
        {
          medicationName,
          dosage: '500mg',
          frequency: 'twice daily',
          duration: '3 days',
          notes: 'After meals',
        },
      ],
    },
  });
}

export async function getConsultationResultApi(
  request: APIRequestContext,
  token: string,
  appointmentId: string
) {
  return getJson<any>(request, `/consultations/${appointmentId}/result`, token);
}

export async function rateAppointmentApi(
  request: APIRequestContext,
  token: string,
  appointmentId: string,
  comment: string
) {
  return postJson<any>(request, '/ratings', {
    token,
    data: {
      appointmentId,
      score: 5,
      comment,
    },
  });
}

export async function listMyRatingsApi(request: APIRequestContext, token: string) {
  return getJson<any[]>(request, '/ratings/mine', token);
}

export async function createQuestionApi(
  request: APIRequestContext,
  token: string,
  data: { title: string; content: string; doctorId?: string }
) {
  return postJson<any>(request, '/questions', { token, data });
}

export async function answerQuestionApi(
  request: APIRequestContext,
  token: string,
  questionId: string,
  content: string
) {
  return postJson<any>(request, `/questions/${questionId}/answers`, {
    token,
    data: { content },
  });
}

export async function listMyQuestionsApi(request: APIRequestContext, token: string) {
  return getJson<any[]>(request, '/questions/mine', token);
}

export async function createSpecialtyApi(
  request: APIRequestContext,
  token: string,
  nameSuffix: string
) {
  return postJson<any>(request, '/admin/specialties', {
    token,
    data: {
      nameEn: `E2E Graduation ${nameSuffix}`,
      nameVi: `E2E Tot Nghiep ${nameSuffix}`,
      description: 'Created by graduation E2E flow',
    },
  });
}

export async function deactivateSpecialtyApi(request: APIRequestContext, token: string, specialtyId: string) {
  return patchJson<any>(request, `/admin/specialties/${specialtyId}/deactivate`, { token });
}

export async function createAdminUserApi(
  request: APIRequestContext,
  token: string,
  email: string
) {
  return postJson<any>(request, '/admin/users', {
    token,
    data: {
      email,
      password: 'Patient@123',
      firstName: 'Graduation',
      lastName: 'Patient',
      role: 'PATIENT',
    },
  });
}

export async function updateAdminUserStatusApi(
  request: APIRequestContext,
  token: string,
  userId: string,
  isActive: boolean
) {
  return patchJson<any>(request, `/admin/users/${userId}/status`, {
    token,
    data: { isActive },
  });
}

export async function listAdminAppointmentsApi(request: APIRequestContext, token: string) {
  return getJson<any>(request, '/admin/appointments?limit=10', token);
}

export async function updateAdminAppointmentStatusApi(
  request: APIRequestContext,
  token: string,
  appointmentId: string,
  status: string
) {
  return patchJson<any>(request, `/admin/appointments/${appointmentId}/status`, {
    token,
    data: { status },
  });
}

export async function listModerationItemsApi(request: APIRequestContext, token: string) {
  return getJson<any>(request, '/admin/moderation/items?limit=20', token);
}

export async function moderateItemApi(
  request: APIRequestContext,
  token: string,
  type: string,
  id: string,
  action: 'APPROVE' | 'HIDE' | 'RESTORE' | 'CLOSE',
  reason?: string
) {
  return patchJson<any>(request, `/admin/moderation/items/${type}/${id}`, {
    token,
    data: { action, reason },
  });
}
