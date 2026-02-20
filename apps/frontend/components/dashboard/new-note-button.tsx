'use client';

import { Plus } from 'lucide-react';
import { useTransition } from 'react';

import { createNote } from '@/lib/actions/notes';
import { Button } from '@/components/ui/button';

export function NewNoteButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      createNote();
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant="app"
      size="default"
      className="hover:cursor-pointer"
    >
      <Plus className="size-6" />
      New Note
    </Button>
  );
}
