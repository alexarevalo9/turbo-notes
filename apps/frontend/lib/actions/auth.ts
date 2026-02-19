'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getApiClient } from '@/lib/api';
import { routes } from '@/lib/routes';
import type { components } from '@turbo-notes/types';

type TokenResponse = components['schemas']['TokenResponse'];
type ActionResult = { error: string } | { success: true };

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

function setAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  tokens: TokenResponse,
) {
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

export async function register(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const api = getApiClient();

  const { data, error, response } = await api.POST('/api/auth/register/', {
    body: {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    },
  });

  if (response.status !== 201 || !data?.access) {
    const err = error as
      | { email?: string[]; password?: string[]; detail?: string }
      | undefined;
    const message =
      err?.email?.[0] ??
      err?.password?.[0] ??
      err?.detail ??
      'Registration failed. Please try again.';
    return { error: message };
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, data);
  redirect(routes.home);
}

export async function login(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const api = getApiClient();

  const { data, error, response } = await api.POST('/api/auth/token/', {
    body: {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    } as components['schemas']['TokenObtainPair'],
  });

  if (response.status !== 200 || !data?.access) {
    const err = error as { detail?: string } | undefined;
    const message = err?.detail ?? 'Invalid email or password.';
    return { error: message };
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, { access: data.access, refresh: data.refresh });
  redirect(routes.home);
}
