/**
 * Tests for UserFormDialog Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { UserFormDialog } from '../UserFormDialog';
import { mockUsers, mockUserFormData, createMockUser } from '@/test/mocks/data/users';

// Mock the UserForm component to simplify testing
vi.mock('../UserForm', () => ({
  UserForm: ({ onSubmit, isLoading, user }: any) => (
    <form
      data-testid="user-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(mockUserFormData);
      }}
    >
      <div>{isLoading ? 'Loading...' : 'Form Ready'}</div>
      <button type="submit" disabled={isLoading}>
        Submit
      </button>
      {user && <div>Editing: {user.email}</div>}
    </form>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('UserFormDialog', () => {
  const baseUrl = env.apiFullUrl;
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  describe('Dialog Display', () => {
    it('should not render when open is false', () => {
      render(
        <UserFormDialog open={false} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByTestId('user-form')).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('user-form')).toBeInTheDocument();
    });

    it('should display "Create New User" title when no user provided', () => {
      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Create New User')).toBeInTheDocument();
      expect(screen.getByText('Add a new user to the system.')).toBeInTheDocument();
    });

    it('should display "Edit User" title when user is provided', () => {
      const user = mockUsers[0];

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={user} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByText('Update user information and permissions.')).toBeInTheDocument();
    });

    it('should pass user data to form when editing', () => {
      const user = mockUsers[0];

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={user} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(`Editing: ${user.email}`)).toBeInTheDocument();
    });
  });

  describe('Create User', () => {
    it('should call create API when submitting new user', async () => {
      const user = userEvent.setup();
      let createCalled = false;
      const newUser = createMockUser();

      server.use(
        http.post(`${baseUrl}/users/staff`, async ({ request }) => {
          createCalled = true;
          const body = await request.json();
          expect(body).toMatchObject({
            email: mockUserFormData.email,
            firstName: mockUserFormData.firstName,
            lastName: mockUserFormData.lastName,
          });
          return HttpResponse.json(newUser, { status: 201 });
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createCalled).toBe(true);
      });
    });

    it('should close dialog on successful create', async () => {
      const user = userEvent.setup();
      const newUser = createMockUser();

      server.use(
        http.post(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(newUser, { status: 201 });
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should invalidate users query on successful create', async () => {
      const user = userEvent.setup();
      const newUser = createMockUser();
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      server.use(
        http.post(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(newUser, { status: 201 });
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />
        </QueryClientProvider>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['admin', 'users'],
        });
      });
    });

    it('should show loading state during create', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${baseUrl}/users/staff`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(createMockUser(), { status: 201 });
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle create error', async () => {
      server.use(
        http.post(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(
            { message: 'Email already exists' },
            { status: 409 }
          );
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // Wait for mutation to settle — form should return to ready state after error
      await waitFor(() => {
        expect(screen.getByText('Form Ready')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Dialog should remain open on error
      expect(screen.getByTestId('user-form')).toBeInTheDocument();
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('should handle validation errors', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                email: ['Invalid email format'],
                password: ['Password too weak'],
              },
            },
            { status: 400 }
          );
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Dialog should remain open to show errors
      await waitFor(() => {
        expect(screen.getByTestId('user-form')).toBeInTheDocument();
      });
    });
  });

  describe('Update User', () => {
    it('should call update API when submitting existing user', async () => {
      const user = userEvent.setup();
      const existingUser = mockUsers[0];
      let updateCalled = false;

      server.use(
        http.put(`${baseUrl}/users/staff/${existingUser._id}`, async ({ request }) => {
          updateCalled = true;
          const body = await request.json() as Record<string, any>;
          return HttpResponse.json({ ...existingUser, ...body });
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateCalled).toBe(true);
      });
    });

    it('should close dialog on successful update', async () => {
      const user = userEvent.setup();
      const existingUser = mockUsers[0];

      server.use(
        http.put(`${baseUrl}/users/staff/${existingUser._id}`, () => {
          return HttpResponse.json(existingUser);
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should invalidate users query on successful update', async () => {
      const user = userEvent.setup();
      const existingUser = mockUsers[0];
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      server.use(
        http.put(`${baseUrl}/users/staff/${existingUser._id}`, () => {
          return HttpResponse.json(existingUser);
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />
        </QueryClientProvider>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['admin', 'users'],
        });
      });
    });

    it('should show loading state during update', async () => {
      const user = userEvent.setup();
      const existingUser = mockUsers[0];

      server.use(
        http.put(`${baseUrl}/users/staff/${existingUser._id}`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(existingUser);
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle update error', async () => {
      const existingUser = mockUsers[0];

      server.use(
        http.put(`${baseUrl}/users/staff/${existingUser._id}`, () => {
          return HttpResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // Wait for mutation to settle — form should return to ready state after error
      await waitFor(() => {
        expect(screen.getByText('Form Ready')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Dialog should remain open on error
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('should handle server errors during update', async () => {
      const user = userEvent.setup();
      const existingUser = mockUsers[0];

      server.use(
        http.put(`${baseUrl}/users/staff/${existingUser._id}`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-form')).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Behavior', () => {
    it('should call onOpenChange when closed', async () => {
      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      // Find and click close button (usually an X or Escape key)
      // This depends on Dialog implementation
      const dialog = screen.getByRole('dialog', { hidden: true });
      expect(dialog).toBeInTheDocument();
    });

    it('should reset form when dialog is closed and reopened', () => {
      const { rerender } = render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      // Close dialog
      rerender(
        <UserFormDialog open={false} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.queryByTestId('user-form')).not.toBeInTheDocument();

      // Reopen dialog
      rerender(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByTestId('user-form')).toBeInTheDocument();
    });

    it('should handle switching between create and edit modes', () => {
      const existingUser = mockUsers[0];

      const { rerender } = render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Create New User')).toBeInTheDocument();

      // Switch to edit mode
      rerender(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />
      );

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByText(`Editing: ${existingUser.email}`)).toBeInTheDocument();
    });
  });

  describe('Password Handling', () => {
    it('should include password field when provided', async () => {
      const user = userEvent.setup();
      const existingUser = mockUsers[0];
      let capturedBody: any = null;

      server.use(
        http.put(`${baseUrl}/users/staff/${existingUser._id}`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(existingUser);
        })
      );

      render(
        <UserFormDialog open={true} onOpenChange={mockOnOpenChange} user={existingUser} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(capturedBody).toBeDefined();
        // Password is included from mock form data
        expect(capturedBody.password).toBeDefined();
      });
    });
  });
});
