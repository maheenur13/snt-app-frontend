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

// Fired when the session can't be refreshed any more, so the app can show the login form.
export const SESSION_EXPIRED = 'session-expired';

function send(path: string, method: string, body?: unknown) {
  // The tokens live in httpOnly cookies that this code can't read; the browser attaches them.
  return fetch(`${API_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// Shared so that several requests failing at once trigger a single refresh, not one each:
// each refresh token works only once, so parallel refreshes would knock each other out.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= send('/auth/refresh', 'POST')
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let res = await send(path, method, body);

  // The access token lasts 15 minutes. When it runs out, get a new one and retry once.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    if (await refreshSession()) res = await send(path, method, body);
    else window.dispatchEvent(new Event(SESSION_EXPIRED));
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`);
  return data as T;
}
