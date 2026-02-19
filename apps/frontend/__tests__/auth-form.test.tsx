import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthForm } from '@/components/auth/auth-form';

// next/link is a server component — stub it for the test environment
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const noopAction = vi.fn().mockResolvedValue(null);
const errorAction = vi
  .fn()
  .mockResolvedValue({ error: 'Something went wrong' });

describe('AuthForm', () => {
  it('renders email and password inputs in signup mode', () => {
    render(<AuthForm mode='signup' action={noopAction} />);
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('renders email and password inputs in login mode', () => {
    render(<AuthForm mode='login' action={noopAction} />);
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it("shows 'Sign Up' submit button in signup mode", () => {
    render(<AuthForm mode='signup' action={noopAction} />);
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it("shows 'Login' submit button in login mode", () => {
    render(<AuthForm mode='login' action={noopAction} />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it("shows navigation link 'We're already friends!' in signup mode", () => {
    render(<AuthForm mode='signup' action={noopAction} />);
    expect(
      screen.getByRole('link', { name: /we're already friends/i }),
    ).toBeInTheDocument();
  });

  it("shows navigation link 'Oops! I've never been here before' in login mode", () => {
    render(<AuthForm mode='login' action={noopAction} />);
    expect(
      screen.getByRole('link', { name: /oops! i've never been here before/i }),
    ).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<AuthForm mode='signup' action={noopAction} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    const hideButton = screen.getByRole('button', { name: /hide password/i });
    await user.click(hideButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays error message when action returns an error', async () => {
    const user = userEvent.setup();
    render(<AuthForm mode='signup' action={errorAction} />);

    await user.type(
      screen.getByPlaceholderText('Email address'),
      'test@example.com',
    );
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });
});
