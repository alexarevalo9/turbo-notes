'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import type { components } from '@turbo-notes/types';
import { updateNote } from '@/lib/actions/notes';
import { formatNoteDate } from '@/lib/date';
import { routes } from '@/lib/routes';
import { useDebounce } from '@/lib/hooks/use-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Note = components['schemas']['Note'];
type Category = components['schemas']['Category'];

interface NoteEditorFormProps {
  note: Note;
  categories: Category[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function NoteEditorForm({ note, categories }: NoteEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const randomThoughts = categories.find((c) => c.name === 'Random Thoughts');
  const [categoryId, setCategoryId] = useState<number | null>(
    note.category?.id ?? randomThoughts?.id ?? null
  );

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  const currentCategory = categories.find((c) => c.id === categoryId);
  const categoryColor = currentCategory?.color || '#DDC6AF';
  const rgb = hexToRgb(categoryColor);
  const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` : 'rgba(221, 198, 175, 0.5)';

  useEffect(() => {
    if (debouncedTitle !== note.title || debouncedContent !== note.content) {
      startTransition(async () => {
        await updateNote(note.id, {
          title: debouncedTitle,
          content: debouncedContent,
        });
      });
    }
  }, [debouncedTitle, debouncedContent, note.id, note.title, note.content]);

  function handleCategoryChange(value: string) {
    const newCategoryId = value === 'null' ? null : parseInt(value, 10);
    setCategoryId(newCategoryId);

    startTransition(async () => {
      await updateNote(note.id, {
        category_id: newCategoryId,
      });
    });
  }

  function handleClose() {
    router.push(routes.home);
  }

  return (
    <div className="min-h-screen bg-[#FAF1E3] px-[40px] pt-8 pb-8 lg:pt-12 lg:pb-12">
      <div className="flex items-center justify-between gap-4 mb-4 w-full">
        <Select value={categoryId?.toString() ?? 'null'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[200px] border border-[#DDC6AF]/50 bg-[#FAF1E3] hover:bg-black/5 transition-colors text-[#55413A]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-[#55413A] hover:bg-black/5 shrink-0"
          aria-label="Close"
        >
          <X className="size-5" />
        </Button>
      </div>

      <div
        className="w-full rounded-[11px] min-h-[calc(100vh-8rem)] flex flex-col p-8 lg:p-12 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        style={{
          backgroundColor: bgColor,
          border: `3px solid ${categoryColor}`,
        }}
      >
        <div className="flex justify-end mb-4">
          <p className="text-xs text-[#55413A]/80">
            Last Edited: {formatNoteDate(note.updated_at)}
          </p>
        </div>

        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="font-(family-name:--font-inria-serif) font-bold text-[#55413A] text-2xl lg:text-3xl leading-snug resize-none overflow-hidden bg-transparent border-none outline-none placeholder:text-[#55413A]/40 mb-4"
          rows={1}
          style={{
            height: 'auto',
            minHeight: '2.5rem',
          }}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
          }}
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Pour your heart out..."
          className="flex-1 text-[#55413A] text-base lg:text-lg leading-relaxed resize-none bg-transparent border-none outline-none placeholder:text-[#55413A]/40"
        />

        {/* Saving indicator */}
        {isPending && <p className="text-xs text-[#55413A]/50 mt-4 text-right">Saving...</p>}
      </div>
    </div>
  );
}
