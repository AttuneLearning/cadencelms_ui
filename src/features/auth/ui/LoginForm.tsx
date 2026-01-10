/**
 * Login form component
 * Uses react-hook-form with zod validation
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useAuth } from '../model/useAuth';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      console.log('[LoginForm] ===== LOGIN ATTEMPT =====');
      console.log('[LoginForm] Email:', data.email);
      console.log('[LoginForm] Password length:', data.password.length);
      console.log('[LoginForm] Calling login()...');

      await login(data);

      console.log('[LoginForm] ===== LOGIN SUCCESS =====');
      console.log('[LoginForm] Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[LoginForm] ===== LOGIN FAILED =====');
      console.error('[LoginForm] Error object:', err);
      console.error('[LoginForm] Error name:', err?.name);
      console.error('[LoginForm] Error message:', err?.message);
      console.error('[LoginForm] Error status:', err?.status);
      console.error('[LoginForm] Error response:', err?.response?.data);

      // ApiClientError has message property directly
      // Also check for axios error format as fallback
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        'Invalid email or password';

      console.error('[LoginForm] Final error message to display:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-md">
          <p className="text-base font-bold text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
};
