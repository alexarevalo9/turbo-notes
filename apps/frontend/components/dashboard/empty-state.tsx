import Image from 'next/image';

import emptyState from '@/app/assets/empty_state.svg';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16">
      <Image src={emptyState as string} alt="No notes yet" width={260} height={260} priority />
      <p className="text-[#957139] text-2xl text-center whitespace-nowrap">
        {"I'm just here waiting for your charming notes..."}
      </p>
    </div>
  );
}
