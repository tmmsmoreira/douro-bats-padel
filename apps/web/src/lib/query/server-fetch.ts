import 'server-only';

import { auth } from '@/lib/auth';
import { API_URL } from '@/lib/constants';
import type { Session } from 'next-auth';

export type AuthLikeSession = Pick<Session, 'accessToken' | 'user'> | null;

async function getSession(): Promise<AuthLikeSession> {
  return (await auth()) as AuthLikeSession;
}

function buildHeaders(session: AuthLikeSession): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return headers;
}

export async function serverApiGet<T>(path: string, session?: AuthLikeSession): Promise<T> {
  const sess = session !== undefined ? session : await getSession();
  const res = await fetch(`${API_URL}${path}`, {
    headers: buildHeaders(sess),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `API Error: ${res.statusText}`);
  }
  return res.json();
}

export { getSession as getServerSession };
