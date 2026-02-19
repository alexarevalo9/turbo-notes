import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

function AppLink({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        'text-xs text-[#957139] underline underline-offset-2 hover:text-[#957139]/80 transition-colors',
        className
      )}
      {...props}
    />
  );
}

export { AppLink };
