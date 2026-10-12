import axios from 'axios';

/** Converts any thrown value into a user-safe message. Never exposes stack traces. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    const status = error.response.status;
    const serverMessage = (error.response.data as { message?: unknown } | undefined)?.message;
    if (status === 403) {
      return typeof serverMessage === 'string' && serverMessage
        ? serverMessage
        : 'You do not have permission to perform this action.';
    }
    if (status === 401) return 'Your session has expired. Please sign in again.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'The server had a problem. Please try again shortly.';
    if (typeof serverMessage === 'string' && serverMessage) return serverMessage;
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isForbiddenError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403;
}
