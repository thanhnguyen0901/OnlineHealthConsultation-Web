import i18n from '@/i18n/initI18n';
import { HttpError } from '@/apis/core/httpError';

const toErrorCodeKey = (code: string): string => `common:errorCodes.${code.trim().toLowerCase()}`;

const localizeByCode = (code?: string): string | null => {
  if (!code) return null;
  const key = toErrorCodeKey(code);
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  return null;
};

export function extractErrorMessage(
  error: unknown,
  fallback = i18n.t('common:unexpectedError')
): string {
  if (error instanceof HttpError) {
    const localized = localizeByCode(error.code);
    if (localized) return localized;
    if (error.statusCode === 401) return i18n.t('common:errorUnauthorized');
    if (error.statusCode === 403) return i18n.t('common:errorForbidden');
    return error.message || fallback;
  }

  if (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  ) {
    const localized = localizeByCode((error as { code: string }).code);
    if (localized) return localized;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  if (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return (error as { message: string }).message || fallback;
  }
  return fallback;
}
