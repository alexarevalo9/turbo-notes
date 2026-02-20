import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { NoteEditorForm } from '@/components/notes/note-editor-form';
import { updateNote } from '@/lib/actions/notes';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/actions/notes', () => ({
  updateNote: vi.fn(),
}));

vi.mock('@/lib/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}));

const mockCategories = [
  { id: 1, name: 'Random Thoughts', color: '#EF9C66', note_count: 3 },
  { id: 2, name: 'School', color: '#FCDC94', note_count: 2 },
  { id: 3, name: 'Personal', color: '#78ABA8', note_count: 1 },
];

const mockNote = {
  id: 1,
  title: 'Test Note',
  content: 'Test content here',
  category: {
    id: 1,
    name: 'Random Thoughts',
    color: '#EF9C66',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('NoteEditorForm', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (updateNote as Mock).mockResolvedValue({ success: true });
  });

  it('renders note title and content', () => {
    render(<NoteEditorForm note={mockNote} categories={mockCategories} />);

    const titleInput = screen.getByPlaceholderText('Note Title');
    const contentInput = screen.getByPlaceholderText('Pour your heart out...');

    expect(titleInput).toHaveValue('Test Note');
    expect(contentInput).toHaveValue('Test content here');
  });

  it('renders category dropdown with current category', () => {
    render(<NoteEditorForm note={mockNote} categories={mockCategories} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<NoteEditorForm note={mockNote} categories={mockCategories} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
  });

  it('navigates home when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteEditorForm note={mockNote} categories={mockCategories} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders note without category', () => {
    const noteWithoutCategory = { ...mockNote, category: null };
    render(<NoteEditorForm note={noteWithoutCategory} categories={mockCategories} />);

    const titleInput = screen.getByPlaceholderText('Note Title');
    expect(titleInput).toBeInTheDocument();
  });

  it('renders formatted last edited date', () => {
    render(<NoteEditorForm note={mockNote} categories={mockCategories} />);

    expect(screen.getByText(/Last Edited:/)).toBeInTheDocument();
  });

  it('applies background and border color based on category', () => {
    const { container } = render(<NoteEditorForm note={mockNote} categories={mockCategories} />);

    const noteContainer = container.querySelector('[style*="border"]');
    expect(noteContainer).toBeInTheDocument();
  });
});
