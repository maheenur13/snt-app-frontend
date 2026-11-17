export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  interests: string[];
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: string | { _id: string; name: string; email: string };
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// set in .env; Vite inlines it at build time, so a production build needs it set before `pnpm build`
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// Fired when the session cookie is missing or expired, so the app can show the login form.
export const SESSION_EXPIRED = 'session-expired';

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  // The JWT lives in an httpOnly cookie that this code can't read; the browser attaches it.
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event(SESSION_EXPIRED));
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`);
  return data as T;
}
