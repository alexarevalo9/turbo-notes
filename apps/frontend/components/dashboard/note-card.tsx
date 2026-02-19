import Link from 'next/link';

import type { components } from '@turbo-notes/types';
import { formatNoteDate } from '@/lib/date';
import { routes } from '@/lib/routes';

type Note = components['schemas']['Note'];

interface NoteCardProps {
  note: Note;
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

export function NoteCard({ note }: NoteCardProps) {
  const formattedDate = formatNoteDate(note.updated_at);
  const categoryColor = note.category?.color || '#DDC6AF';

  const rgb = hexToRgb(categoryColor);
  const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` : 'rgba(221, 198, 175, 0.5)';

  return (
    <Link
      href={routes.note(note.id)}
      className="flex flex-col gap-2 p-4 rounded-[11px] hover:shadow-lg transition-shadow cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.08)] min-w-[303px] min-h-[246px]"
      style={{
        backgroundColor: bgColor,
        border: `3px solid ${categoryColor}`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#55413A]">{formattedDate}</span>
        {note.category && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#55413A]">
            {note.category.name}
          </span>
        )}
      </div>

      <h3 className="font-(family-name:--font-inria-serif) font-bold text-[#55413A] text-2xl leading-snug line-clamp-2">
        {note.title || 'Note Title'}
      </h3>

      {note.content && (
        <p className="text-sm text-[#55413A] leading-relaxed line-clamp-3">{note.content}</p>
      )}
    </Link>
  );
}
