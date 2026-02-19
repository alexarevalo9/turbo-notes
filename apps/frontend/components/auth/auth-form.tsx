'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLink } from '@/components/ui/app-link';
import { routes } from '@/lib/routes';

type ActionResult = { error: string } | { success: true } | null;

interface AuthFormProps {
  mode: 'signup' | 'login';
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, setState] = useState<ActionResult>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await action(state, formData);
    setState(result);
    setIsPending(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-3 w-full min-w-[385px]'
    >
      <div className='flex flex-col gap-1'>
        <Label htmlFor='email' className='sr-only'>
          Email address
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          placeholder='Email address'
          required
          autoComplete='email'
        />
      </div>

      <div className='flex flex-col gap-1'>
        <Label htmlFor='password' className='sr-only'>
          Password
        </Label>
        <div className='relative'>
          <Input
            id='password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            required
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            className='pr-10'
          />
          <button
            type='button'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-[#957139]/70 hover:text-[#957139] transition-colors'
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {state && 'error' in state && (
        <p className='text-sm text-red-600 text-center'>{state.error}</p>
      )}

      <Button type='submit' variant='app' disabled={isPending} className='mt-2'>
        {isPending ? 'Please wait…' : isSignup ? 'Sign Up' : 'Login'}
      </Button>

      <div className='text-center mt-1'>
        {isSignup ? (
          <AppLink href={routes.login}>We&apos;re already friends!</AppLink>
        ) : (
          <AppLink href={routes.signup}>
            Oops! I&apos;ve never been here before
          </AppLink>
        )}
      </div>
    </form>
  );
}
