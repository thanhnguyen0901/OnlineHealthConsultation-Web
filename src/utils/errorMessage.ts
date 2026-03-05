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
