import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { routes } from '@/lib/routes';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (token) {
    redirect(routes.home);
  }

  return <div className="min-h-screen flex items-center justify-center">{children}</div>;
}
