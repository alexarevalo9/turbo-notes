'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getApiBaseUrl } from '@/lib/api';
import { routes } from '@/lib/routes';
import type { components } from '@turbo-notes/types';

type TokenResponse = components['schemas']['TokenResponse'];
type ActionResult = { error: string } | { success: true };

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

function setAuthCookies(cookieStore: Awaited<ReturnType<typeof cookies>>, tokens: TokenResponse) {
  cookieStore.set(ACCESS_COOKIE, tokens.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set(REFRESH_COOKIE, tokens.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

function getFormStr(formData: FormData, key: string): string {
  const direct = formData.get(key);
  if (direct != null && direct !== '') return direct.toString();
  const suffix = `_${key}`;
  for (const [k, v] of formData.entries()) {
    if (typeof v === 'string' && (k === key || k.endsWith(suffix))) return v;
  }
  return '';
}

export async function register(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = getFormStr(formData, 'email').trim();
  const password = getFormStr(formData, 'password');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.access) {
    const err = data as { email?: string[]; password?: string[]; detail?: string };
    const message =
      err?.email?.[0] ??
      err?.password?.[0] ??
      err?.detail ??
      'Registration failed. Please try again.';
    return { error: message };
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, { access: data.access, refresh: data.refresh });
  redirect(routes.home);
}

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = getFormStr(formData, 'email').trim();
  const password = getFormStr(formData, 'password');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.access) {
    const err = data as { detail?: string };
    const message = err?.detail ?? 'Invalid email or password.';
    return { error: message };
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, { access: data.access, refresh: data.refresh });
  redirect(routes.home);
}
