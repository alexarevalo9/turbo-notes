'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getApiClient } from '@/lib/api';
import { routes } from '@/lib/routes';
import type { components } from '@turbo-notes/types';

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

export async function updateNote(
  id: number,
  updates: { title?: string; content?: string; category_id?: number | null }
): Promise<{ success: true } | { error: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { error: 'Unauthorized' };
  }

  const api = getApiClient(token);
  const { data, response } = await api.PATCH('/api/notes/{id}/', {
    params: { path: { id: String(id) } },
    body: updates as components['schemas']['PatchedNote'],
  });

  if (response.status === 401) {
    redirect(routes.login);
  }

  if (!response.ok || !data) {
    return { error: 'Failed to update note' };
  }

  revalidatePath(routes.note(id));
  revalidatePath(routes.home);

  return { success: true };
}

export async function deleteNote(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect(routes.login);
  }

  const api = getApiClient(token);
  const { response } = await api.DELETE('/api/notes/{id}/', {
    params: { path: { id: String(id) } },
  });

  if (response.status === 401) {
    redirect(routes.login);
  }

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }

  revalidatePath(routes.home);
  redirect(routes.home);
}
