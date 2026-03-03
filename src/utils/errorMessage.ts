/**
 * extractErrorMessage
 *
 * Converts any thrown value into a human-readable string that can be
 * shown in a toast notification.
 *
 * Priority order:
 *   1. HttpError / Error .message  — apiClient.ts already maps every
 *      Axios response error into an HttpError whose .message is the
 *      server's { message } field from the JSON body.
 *   2. Plain string throws.
 *   3. Objects that carry a `message` property (e.g. raw axios errors
 *      that slipped through).
 *   4. A safe fallback string.
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred'
): string {
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
