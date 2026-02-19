import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 w-full min-w-0 bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow]',
        'border border-[#957139] rounded-[6px] h-[39px] placeholder:text-[#957139]/60',
        'focus-visible:ring-[3px] focus-visible:ring-[#957139]/30 focus-visible:border-[#957139]',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Input };
