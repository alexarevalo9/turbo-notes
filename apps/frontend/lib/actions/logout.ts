'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { routes } from '@/lib/routes';

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  redirect(routes.login);
}
