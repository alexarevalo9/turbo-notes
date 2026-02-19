import Image from 'next/image';

import { login } from '@/lib/actions/auth';
import { AuthForm } from '@/components/auth/auth-form';
import loginImage from '@/app/assets/login.svg';

export default function LoginPage() {
  return (
    <div className='flex flex-col items-center gap-6'>
      <Image
        src={loginImage}
        alt='Cactus illustration'
        width={95}
        height={114}
        priority
      />
      <h1 className='font-(family-name:--font-inria-serif) font-bold text-[#88642A] text-5xl'>
        Yay, You&apos;re Back!
      </h1>
      <AuthForm mode='login' action={login} />
    </div>
  );
}
