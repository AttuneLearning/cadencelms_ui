/**
 * Change Password Page - Phase 6
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Password change functionality for both user and admin sessions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { PasswordField } from '@/features/auth/ui/PasswordField';
import { changeUserPassword, changeAdminPassword, validatePasswordStrength } from '@/features/auth/api/passwordApi';
import { useAuthStore } from '@/features/auth/model/authStore';

/**
 * Change Password Page Component
 *
 * Features:
 * - Current password validation
 * - New password strength indicator
 * - Password confirmation
 * - Context detection (user vs admin session)
 * - Session persistence after change
 */
export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const isAdminSessionActive = useAuthStore((state) => state.isAdminSessionActive);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Mutation for password change
  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      // Choose endpoint based on session type
      if (isAdminSessionActive) {
        return changeAdminPassword(data);
      } else {
        return changeUserPassword(data);
      }
    },
    onSuccess: () => {
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    },
  });

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate current password
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // Validate new password
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validation = validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    // Validate password match
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current
    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    passwordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    passwordMutation.reset();
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            {isAdminSessionActive
              ? 'Change your admin password. Your admin session will remain active.'
              : 'Change your user password. You will remain logged in.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Success Message */}
          {passwordMutation.isSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Password changed successfully! Your session remains active.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {passwordMutation.isError && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {passwordMutation.error instanceof Error
                  ? passwordMutation.error.message
                  : 'Failed to change password. Please check your current password and try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Context Indicator */}
          {isAdminSessionActive && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                You are changing your <strong>admin password</strong> in an admin session.
              </AlertDescription>
            </Alert>
          )}

          {/* Password Change Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <PasswordField
              id="currentPassword"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              error={errors.currentPassword}
              disabled={passwordMutation.isPending}
              placeholder="Enter your current password"
            />

            {/* New Password */}
            <PasswordField
              id="newPassword"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              error={errors.newPassword}
              disabled={passwordMutation.isPending}
              placeholder="Enter your new password"
              showStrength={true}
              showRequirements={true}
            />

            {/* Confirm Password */}
            <PasswordField
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              disabled={passwordMutation.isPending}
              placeholder="Re-enter your new password"
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={passwordMutation.isPending || passwordMutation.isSuccess}
                className="flex-1"
              >
                {passwordMutation.isPending ? 'Changing Password...' : 'Change Password'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={passwordMutation.isPending}
              >
                Reset
              </Button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Password Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Use a unique password you don't use anywhere else</li>
              <li>Consider using a password manager</li>
              <li>Avoid common words or personal information</li>
              <li>Change your password regularly (every 3-6 months)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
