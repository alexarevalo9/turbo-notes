import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

import { getApiClient } from '@/lib/api';
import { routes } from '@/lib/routes';
import { NoteEditorForm } from '@/components/notes/note-editor-form';

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const noteId = parseInt(id, 10);

  if (isNaN(noteId)) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect(routes.login);
  }

  const api = getApiClient(token);

  const [noteRes, categoriesRes] = await Promise.all([
    api.GET('/api/notes/{id}/', {
      params: { path: { id: String(noteId) } },
    }),
    api.GET('/api/categories/'),
  ]);

  if (noteRes.response.status === 401 || categoriesRes.response.status === 401) {
    redirect(routes.login);
  }

  if (noteRes.response.status === 404) {
    notFound();
  }

  if (!noteRes.data || !categoriesRes.data) {
    throw new Error('Failed to load note');
  }

  return <NoteEditorForm note={noteRes.data} categories={categoriesRes.data} />;
}
