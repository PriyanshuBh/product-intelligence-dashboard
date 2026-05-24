'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard',
      });

      if (error) {
        toast.error(error.message || 'Failed to create account.');
        return;
      }

      toast.success('Account created.');
      router.push('/login');
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-7 items-center justify-center rounded-md bg-foreground text-background">
            <span className="font-mono text-[13px] font-medium leading-none">P</span>
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[color:var(--brand)]" />
          </span>
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            Product Insights
          </span>
        </div>
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-[13.5px] text-muted-foreground">
            Get listing intelligence and market data for your catalog.
          </p>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Field label="Full name">
          <Input
            type="text"
            required
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <button
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-foreground px-4 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15"
    />
  );
}
