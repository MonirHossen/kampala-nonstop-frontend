import { HttpErrorResponse } from '@angular/common/http';

/** Flatten Laravel validation / message errors into a single string. */
export function extractApiError(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body = error.error;

  if (typeof body === 'string' && body.trim() !== '') {
    return body;
  }

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim() !== '') {
      return body.message;
    }

    if (body.errors && typeof body.errors === 'object') {
      const messages = Object.values(body.errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string');

      if (messages.length > 0) {
        return messages[0];
      }
    }
  }

  if (error.status === 0) {
    return 'Unable to reach the server. Check your connection.';
  }

  if (error.status === 401) {
    return 'Please sign in to continue.';
  }

  if (error.status === 403) {
    return 'You do not have permission to do that.';
  }

  if (error.status === 422) {
    return 'Please check the form and try again.';
  }

  return fallback;
}
