import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getApiClient } from '@/lib/api';
import { routes } from '@/lib/routes';
import { CategorySidebar } from '@/components/dashboard/category-sidebar';
import { NoteCard } from '@/components/dashboard/note-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { NewNoteButton } from '@/components/dashboard/new-note-button';

interface DashboardPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect(routes.login);
  }

  const { category } = await searchParams;
  const activeCategoryId = category ? parseInt(category, 10) : null;

  const api = getApiClient(token);

  const [categoriesRes, notesRes] = await Promise.all([
    api.GET('/api/categories/'),
    api.GET('/api/notes/', {
      params: activeCategoryId ? { query: { category: activeCategoryId } } : {},
    }),
  ]);

  if (categoriesRes.response.status === 401 || notesRes.response.status === 401) {
    redirect(routes.login);
  }

  const categories = categoriesRes.data ?? [];
  const notes = notesRes.data ?? [];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row pl-4 lg:pl-8">
      <CategorySidebar categories={categories} activeCategory={activeCategoryId} />

      <main className="flex-1 flex flex-col gap-6 px-4 lg:px-8 py-8 max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="font-(family-name:--font-inria-serif) text-2xl font-bold text-[#55413A]">
            {activeCategoryId
              ? (categories.find((c) => c.id === activeCategoryId)?.name ?? 'Notes')
              : 'All Notes'}
          </h1>
          <NewNoteButton />
        </div>

        {notes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(303px,1fr))] gap-4 auto-rows-min">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
