'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { routes } from '@/lib/routes';
import { getApiBaseUrl } from '@/lib/api';

const baseUrl = getApiBaseUrl();

export async function createNote() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect(routes.login);
  }

  const res = await fetch(`${baseUrl}/api/notes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (res.status === 401) {
    redirect(routes.login);
  }

  const data = await res.json().catch(() => ({}));
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

  const res = await fetch(`${baseUrl}/api/notes/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (res.status === 401) {
    redirect(routes.login);
  }

  if (!res.ok) {
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

  const res = await fetch(`${baseUrl}/api/notes/${id}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    redirect(routes.login);
  }

  if (!res.ok) {
    throw new Error('Failed to delete note');
  }

  revalidatePath(routes.home);
  redirect(routes.home);
}
