/**
 * Login form component - Phase 6 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Updated to use V2 authStore with UserType-based navigation
 * Uses react-hook-form with zod validation
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import { Label } from '@/shared/ui/label';
import { useAuthStore } from '../model';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, roleHierarchy, error: authError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('[LoginForm] Starting login...');

      // Call V2 login from authStore
      await login(data);

      console.log('[LoginForm] Login successful');

      // Get the current auth state after login
      const authState = useAuthStore.getState();
      const { roleHierarchy: currentRoleHierarchy } = authState;

      // Check if there was an intended destination
      const from = (location.state as any)?.from?.pathname;

      // Determine navigation destination
      let destination = from || '/dashboard';

      // Use V2 defaultDashboard if available
      if (currentRoleHierarchy?.defaultDashboard) {
        const dashboardMap: Record<string, string> = {
          learner: '/learner/dashboard',
          staff: '/staff/dashboard',
          admin: '/admin/dashboard',
        };
        destination = from || dashboardMap[currentRoleHierarchy.defaultDashboard] || '/dashboard';
      }

      console.log('[LoginForm] Navigating to:', destination);
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error('[LoginForm] Login failed:', err);
      // Error is automatically set in authStore, will display from authError
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
        <PasswordInput
          id="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {authError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Login Failed</p>
            <p className="text-sm text-red-700 mt-1">{authError}</p>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
};
