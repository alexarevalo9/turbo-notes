'use client';

import { LogOut } from 'lucide-react';
import { useTransition } from 'react';

import { logout } from '@/lib/actions/logout';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logout();
    });
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant="ghost"
      size="default"
      className="hover:cursor-pointer justify-start text-[#55413A] hover:bg-[#EDE3D6]/60 w-full"
    >
      <LogOut />
      Logout
    </Button>
  );
}
