/**
 * ChangePasswordPage Component Tests
 * Phase 6: Password change functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ChangePasswordPage } from '../ChangePasswordPage';
import * as passwordApi from '@/features/auth/api/passwordApi';
import { useAuthStore } from '@/features/auth/model/authStore';

// Mock the API
vi.mock('@/features/auth/api/passwordApi', () => ({
  changeUserPassword: vi.fn(),
  changeAdminPassword: vi.fn(),
  validatePasswordStrength: vi.fn(),
}));

// Mock the auth store
vi.mock('@/features/auth/model/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ChangePasswordPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    // Default: user session (not admin)
    vi.mocked(useAuthStore).mockReturnValue(false);

    // Mock password validation
    vi.mocked(passwordApi.validatePasswordStrength).mockImplementation((password: string) => {
      const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      };

      const metCount = Object.values(requirements).filter(Boolean).length;
      const isValid = metCount >= 4 && requirements.minLength;

      let strength: 'weak' | 'fair' | 'good' | 'strong';
      if (metCount === 5) strength = 'strong';
      else if (metCount === 4) strength = 'good';
      else if (metCount === 3) strength = 'fair';
      else strength = 'weak';

      return { isValid, strength, requirements };
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render the page with all form fields', () => {
      renderWithProviders(<ChangePasswordPage />);

      expect(screen.getByRole('heading', { name: /Change Password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
    });

    it('should display user session description by default', () => {
      renderWithProviders(<ChangePasswordPage />);

      expect(
        screen.getByText(/Change your user password. You will remain logged in./i)
      ).toBeInTheDocument();
    });

    it('should display admin session description when admin is active', () => {
      vi.mocked(useAuthStore).mockReturnValue(true);

      renderWithProviders(<ChangePasswordPage />);

      expect(
        screen.getByText(/Change your admin password. Your admin session will remain active./i)
      ).toBeInTheDocument();
    });

    it('should show security tips section', () => {
      renderWithProviders(<ChangePasswordPage />);

      expect(screen.getByText(/Password Tips:/i)).toBeInTheDocument();
      expect(screen.getByText(/Use a unique password/i)).toBeInTheDocument();
      expect(screen.getByText(/Consider using a password manager/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when current password is empty', async () => {
      renderWithProviders(<ChangePasswordPage />);

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Current password is required')).toBeInTheDocument();
      });
    });

    it('should show error when new password is empty', async () => {
      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('New password is required')).toBeInTheDocument();
      });
    });

    it('should show error when confirm password is empty', async () => {
      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please confirm your new password')).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should show error when new password is same as current password', async () => {
      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'SamePass123!' } });
      fireEvent.change(newPasswordInput, { target: { value: 'SamePass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'SamePass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('New password must be different from current password')
        ).toBeInTheDocument();
      });
    });

    it('should show error when new password does not meet requirements', async () => {
      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password does not meet requirements')).toBeInTheDocument();
      });
    });
  });

  describe('Password Change - User Session', () => {
    it('should call changeUserPassword when not in admin session', async () => {
      vi.mocked(useAuthStore).mockReturnValue(false);
      vi.mocked(passwordApi.changeUserPassword).mockResolvedValue({
        success: true,
        message: 'Password changed successfully',
      });

      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(passwordApi.changeUserPassword).toHaveBeenCalledWith({
          currentPassword: 'oldpass',
          newPassword: 'NewPass123!',
        });
      });
    });

    it('should show success message after successful password change', async () => {
      vi.mocked(passwordApi.changeUserPassword).mockResolvedValue({
        success: true,
        message: 'Password changed successfully',
      });

      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Password changed successfully/i)).toBeInTheDocument();
      });
    });

    it('should clear form after successful password change', async () => {
      vi.mocked(passwordApi.changeUserPassword).mockResolvedValue({
        success: true,
        message: 'Password changed successfully',
      });

      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(/^New Password$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(
        /Confirm New Password/i
      ) as HTMLInputElement;

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(currentPasswordInput.value).toBe('');
        expect(newPasswordInput.value).toBe('');
        expect(confirmPasswordInput.value).toBe('');
      });
    });

    it('should show error message when password change fails', async () => {
      vi.mocked(passwordApi.changeUserPassword).mockRejectedValue(
        new Error('Current password is incorrect')
      );

      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'wrongpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
      });
    });
  });

  describe('Password Change - Admin Session', () => {
    it('should call changeAdminPassword when in admin session', async () => {
      vi.mocked(useAuthStore).mockReturnValue(true);
      vi.mocked(passwordApi.changeAdminPassword).mockResolvedValue({
        success: true,
        message: 'Admin password changed successfully',
      });

      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldadminpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewAdminPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewAdminPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(passwordApi.changeAdminPassword).toHaveBeenCalledWith({
          currentPassword: 'oldadminpass',
          newPassword: 'NewAdminPass123!',
        });
      });
    });

    it('should show admin context alert', () => {
      vi.mocked(useAuthStore).mockReturnValue(true);

      renderWithProviders(<ChangePasswordPage />);

      // Check for the specific alert text
      expect(
        screen.getByText(/You are changing your/i)
      ).toBeInTheDocument();

      // Verify the alert exists with blue styling (admin context)
      const alerts = screen.getAllByRole('alert');
      const adminAlert = alerts.find(alert =>
        alert.textContent?.includes('You are changing your') &&
        alert.textContent?.includes('admin password')
      );
      expect(adminAlert).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('should disable submit button while submitting', async () => {
      vi.mocked(passwordApi.changeUserPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, message: '' }), 100))
      );

      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/^New Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      const submitButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/Changing Password.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Actions', () => {
    it('should have back button that navigates back', () => {
      renderWithProviders(<ChangePasswordPage />);

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should have reset button that clears form', async () => {
      renderWithProviders(<ChangePasswordPage />);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(/^New Password$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i) as HTMLInputElement;

      // Fill form
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      expect(currentPasswordInput.value).toBe('oldpass');

      // Click reset
      const resetButton = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetButton);

      // Form should be cleared
      await waitFor(() => {
        expect(currentPasswordInput.value).toBe('');
        expect(newPasswordInput.value).toBe('');
        expect(confirmPasswordInput.value).toBe('');
      });
    });
  });
});
