import Image from 'next/image';

import { register } from '@/lib/actions/auth';
import { AuthForm } from '@/components/auth/auth-form';
import signUpImage from '@/app/assets/sign_up.svg';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Image src={signUpImage} alt="Sleeping cat illustration" width={188} height={134} priority />
      <h1 className="font-(family-name:--font-inria-serif) font-bold text-[#88642A] text-5xl">
        Yay, New Friend!
      </h1>
      <AuthForm mode="signup" action={register} />
    </div>
  );
}
