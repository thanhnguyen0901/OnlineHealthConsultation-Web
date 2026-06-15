import { APIRequestContext } from '@playwright/test';

const backendURL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const apiURL = (path: string) => `${backendURL.replace(/\/$/, '')}/api${path}`;

export async function getPublicDoctors(request: APIRequestContext) {
  const response = await request.get(apiURL('/public/doctors?limit=10'));
  if (!response.ok()) return [];
  const payload = await response.json();
  return payload.data ?? [];
}
