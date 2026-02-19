import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getApiClient } from '@/lib/api';
import { logout } from '@/lib/actions/logout';
import { routes } from '@/lib/routes';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect(routes.login);
  }

  const api = getApiClient(token);
  const { data, response } = await api.GET('/api/auth/me/');

  if (response.status === 401) {
    redirect(routes.login);
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-6'>
      <h1 className='text-2xl font-semibold text-[#88642A]'>
        You&apos;re in! 🎉
      </h1>
      <p className='text-[#957139]'>
        Logged in as <span className='font-bold'>{data?.email}</span>
      </p>
      <form action={logout}>
        <Button type='submit' variant='app'>
          Log out
        </Button>
      </form>
    </div>
  );
}
