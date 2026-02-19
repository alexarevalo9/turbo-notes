import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { NoteCard } from '@/components/dashboard/note-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CategorySidebar } from '@/components/dashboard/category-sidebar';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === 'string' ? src : ''} alt={alt} {...props} />
  ),
}));

vi.mock('@/lib/date', () => ({
  formatNoteDate: () => 'Today',
}));

const mockNote = {
  id: 1,
  title: 'My Test Note',
  content: 'Some content here for testing purposes.',
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  category: {
    id: 1,
    name: 'Personal',
    color: '#78ABA8',
  },
};

describe('NoteCard', () => {
  it('renders note title', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('My Test Note')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders category name', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders note content preview', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('Some content here for testing purposes.')).toBeInTheDocument();
  });

  it('renders fallback title when title is empty', () => {
    render(<NoteCard note={{ ...mockNote, title: '' }} />);
    expect(screen.getByText('Note Title')).toBeInTheDocument();
  });

  it('renders without category when category is null', () => {
    render(<NoteCard note={{ ...mockNote, category: null }} />);
    expect(screen.queryByText('Personal')).not.toBeInTheDocument();
  });

  it('links to the note detail page', () => {
    render(<NoteCard note={mockNote} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/notes/1');
  });
});

describe('EmptyState', () => {
  it('renders the empty state image', () => {
    render(<EmptyState />);
    expect(screen.getByAltText('No notes yet')).toBeInTheDocument();
  });

  it('renders the waiting message', () => {
    render(<EmptyState />);
    expect(screen.getByText(/waiting for your charming notes/i)).toBeInTheDocument();
  });
});

describe('CategorySidebar', () => {
  const categories = [
    { id: 1, name: 'Random Thoughts', color: '#EF9C66', note_count: 2 },
    { id: 2, name: 'School', color: '#FCDC94', note_count: 0 },
    { id: 3, name: 'Personal', color: '#78ABA8', note_count: 1 },
  ];

  it('renders "All Categories" link', () => {
    render(<CategorySidebar categories={categories} activeCategory={null} />);
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('renders all category names', () => {
    render(<CategorySidebar categories={categories} activeCategory={null} />);
    expect(screen.getByText('Random Thoughts')).toBeInTheDocument();
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders note counts for each category', () => {
    render(<CategorySidebar categories={categories} activeCategory={null} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('links each category to ?category=<id>', () => {
    render(<CategorySidebar categories={categories} activeCategory={null} />);
    const links = screen.getAllByRole('link');
    expect(links[1]).toHaveAttribute('href', '/?category=1');
    expect(links[2]).toHaveAttribute('href', '/?category=2');
    expect(links[3]).toHaveAttribute('href', '/?category=3');
  });

  it('links "All Categories" to the home page', () => {
    render(<CategorySidebar categories={categories} activeCategory={null} />);
    const allCategoriesLink = screen.getByRole('link', { name: 'All Categories' });
    expect(allCategoriesLink).toHaveAttribute('href', '/');
  });

  it('applies active styling to the active category', () => {
    render(<CategorySidebar categories={categories} activeCategory={1} />);
    const randomThoughtsLink = screen.getByRole('link', { name: /Random Thoughts/ });
    expect(randomThoughtsLink.className).toContain('bg-[#EDE3D6]');
  });

  it('applies active styling to "All Categories" when no category is selected', () => {
    render(<CategorySidebar categories={categories} activeCategory={null} />);
    const allCategoriesLink = screen.getByRole('link', { name: 'All Categories' });
    expect(allCategoriesLink.className).toContain('bg-[#EDE3D6]');
  });
});
