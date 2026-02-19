'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getApiClient } from '@/lib/api';
import { routes } from '@/lib/routes';

export async function createNote() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect(routes.login);
  }

  const api = getApiClient(token);
  const { data, response } = await api.POST('/api/notes/', { body: undefined });

  if (response.status === 401) {
    redirect(routes.login);
  }

  if (!data?.id) {
    throw new Error('Failed to create note');
  }

  redirect(routes.note(data.id));
}
