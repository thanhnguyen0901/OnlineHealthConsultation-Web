import type { ApiError } from '@/types/common';

export class HttpError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static fromApiError(error: ApiError): HttpError {
    return new HttpError(error.message, error.statusCode || 500, error.code);
  }
}
