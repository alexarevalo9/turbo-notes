import Link from 'next/link';

import type { components } from '@turbo-notes/types';
import { LogoutButton } from './logout-button';

type Category = components['schemas']['Category'];

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: number | null;
}

export function CategorySidebar({ categories, activeCategory }: CategorySidebarProps) {
  const isAllActive = activeCategory === null;

  return (
    <aside className="w-full lg:w-56 shrink-0 flex flex-col py-4 lg:py-8 pr-4 lg:pr-8 lg:h-screen lg:sticky lg:top-0">
      <div className="flex flex-col gap-1 flex-1 lg:overflow-y-auto overflow-x-hidden">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-semibold ${
            isAllActive
              ? 'text-[#55413A] bg-[#EDE3D6]'
              : 'text-[#55413A] hover:bg-[#EDE3D6]/60'
          }`}
        >
          All Categories
        </Link>

        <div className="flex flex-col gap-0.5 mt-1">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'text-[#55413A] bg-[#EDE3D6] font-medium'
                    : 'text-[#55413A] hover:bg-[#EDE3D6]/60'
                }`}
              >
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 truncate">{category.name}</span>
                <span className="text-xs text-[#957139]">{category.note_count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#EDE3D6]">
        <LogoutButton />
      </div>
    </aside>
  );
}
