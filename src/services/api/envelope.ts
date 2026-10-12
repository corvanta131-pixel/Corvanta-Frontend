import type { ApiEnvelope } from '../../features/users/types';

/**
 * Unwraps the backend's `{ success, message?, data }` envelope and rejects anything malformed.
 * Pure response transformation: it never performs HTTP and never decides the method.
 */
export function unwrap<T>(body: ApiEnvelope<T> | undefined, label: string): T {
  if (!body || body.success !== true || body.data === undefined || body.data === null) {
    throw new Error(body?.message || `Unexpected response while ${label}.`);
  }
  return body.data;
}

/** Encodes an id for use in a URL path and rejects empty ids before any request is made. */
export function pathId(base: string, id: string, noun: string): string {
  if (!id) throw new Error(`${noun} id is required.`);
  return `${base}/${encodeURIComponent(id)}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
