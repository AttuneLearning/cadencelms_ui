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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { useAuthStore } from '../model';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, error: authError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Call V2 login from authStore
      await login(data);

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

      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error('[LoginForm] Login failed:', err);
      // Error is automatically set in authStore, will display from authError
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      {authError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Login Failed</p>
            <p className="text-sm text-red-700 mt-1">{authError}</p>
          </div>
        </div>
      )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </Form>
  );
};
