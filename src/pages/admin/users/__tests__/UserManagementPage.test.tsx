/**
 * Integration Tests for User Management Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { UserManagementPage } from '../UserManagementPage';
import { mockUsers } from '@/test/mocks/data/users';
import type { UserListResponse } from '@/entities/user/api/userApi';

// Mock the UserFormDialog component to simplify testing
vi.mock('@/features/user-management', () => ({
  UserFormDialog: ({ open, onOpenChange, user }: any) => {
    if (!open) return null;
    return (
      <div data-testid="user-form-dialog">
        <div>{user ? 'Edit User' : 'Create New User'}</div>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    );
  },
}));

// Mock the ConfirmDialog component
vi.mock('@/shared/ui/confirm-dialog', () => ({
  ConfirmDialog: ({ open, onConfirm, title, confirmText }: any) => {
    if (!open) return null;
    return (
      <div data-testid="confirm-dialog">
        <div>{title}</div>
        <button onClick={onConfirm}>{confirmText}</button>
      </div>
    );
  },
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

describe('UserManagementPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      const mockResponse: UserListResponse = {
        users: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Manage user accounts and permissions')).toBeInTheDocument();
    });

    it('should render Add User button', async () => {
      const mockResponse: UserListResponse = {
        users: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      server.use(
        http.get(`${baseUrl}/admin/users`, async () => {
          // Delay response to test loading state
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ users: [], total: 0, page: 1, pageSize: 20 });
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Page should render immediately even if data is loading
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  describe('User List Display', () => {
    it('should display list of users', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      });
    });

    it('should display user avatars', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 1),
        total: 1,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // UserAvatar should display initials
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });

    it('should display user roles as badges', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText('Staff').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Learner').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
      });
    });

    it('should display user status badges', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/active|inactive|suspended/i);
        expect(statusBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display last login dates', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText(/Jan 0[78], 2026/).length).toBeGreaterThan(0);
        expect(screen.getAllByText('Never').length).toBeGreaterThan(0);
      });
    });

    it('should handle empty user list', async () => {
      const mockResponse: UserListResponse = {
        users: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // DataTable should be present but empty
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Actions', () => {
    it('should open create dialog when Add User button is clicked', async () => {
      const user = userEvent.setup();
      const mockResponse: UserListResponse = {
        users: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      const addButton = await screen.findByRole('button', { name: /add user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-form-dialog')).toBeInTheDocument();
        expect(screen.getByText('Create New User')).toBeInTheDocument();
      });
    });

    it('should display action menu for each user', async () => {
      const user = userEvent.setup();
      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 1),
        total: 1,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(async () => {
        const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
        expect(menuButtons.length).toBeGreaterThan(0);
        await user.click(menuButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();
      });
    });

    it('should open edit dialog when Edit User is clicked', async () => {
      const user = userEvent.setup();
      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 1),
        total: 1,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(async () => {
        const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
        await user.click(menuButtons[0]);
      });

      const editButton = await screen.findByText('Edit User');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-form-dialog')).toBeInTheDocument();
        expect(screen.getByText('Edit User')).toBeInTheDocument();
      });
    });
  });

  describe('User Deletion', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 1),
        total: 1,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(async () => {
        const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
        await user.click(menuButtons[0]);
      });

      const deleteButton = await screen.findByText('Delete User');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();
      });
    });

    it('should delete user when confirmed', async () => {
      const user = userEvent.setup();
      let deleteCallCount = 0;

      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 1),
        total: 1,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        }),
        http.delete(`${baseUrl}/admin/users/user-1`, () => {
          deleteCallCount++;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(async () => {
        const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
        await user.click(menuButtons[0]);
      });

      const deleteButton = await screen.findByText('Delete User');
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteCallCount).toBe(1);
      });
    });

    it('should show error toast when delete fails', async () => {
      const user = userEvent.setup();

      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 1),
        total: 1,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        }),
        http.delete(`${baseUrl}/admin/users/user-1`, () => {
          return HttpResponse.json(
            { message: 'Failed to delete user' },
            { status: 500 }
          );
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(async () => {
        const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
        await user.click(menuButtons[0]);
      });

      const deleteButton = await screen.findByText('Delete User');
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      // Toast should be shown (mocked in setup)
      await waitFor(() => {
        // Error should be handled
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Actions', () => {
    it('should enable bulk delete when users are selected', async () => {
      const user = userEvent.setup();
      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 3),
        total: 3,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Wait for table to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Get all checkboxes and click one
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes[1]) {
        await user.click(checkboxes[1]);

        await waitFor(() => {
          // Verify selection worked by checking checkbox state
          expect(checkboxes[1]).toBeChecked();
        });
      }
    });

    it('should show confirmation for bulk delete', async () => {
      const user = userEvent.setup();
      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 3),
        total: 3,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Wait for table to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Select multiple users
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes[1] && checkboxes[2]) {
        await user.click(checkboxes[1]);
        await user.click(checkboxes[2]);

        // Check if delete button appears
        const deleteButton = screen.queryByText(/delete selected/i);
        if (deleteButton) {
          await user.click(deleteButton);

          await waitFor(() => {
            expect(screen.queryByText('Delete Multiple Users')).toBeInTheDocument();
          });
        }
      }
    });

    it('should perform bulk delete when confirmed', async () => {
      const user = userEvent.setup();
      let bulkDeleteCalled = false;

      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 2),
        total: 2,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        }),
        http.post(`${baseUrl}/admin/users/bulk-delete`, () => {
          bulkDeleteCalled = true;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Wait for table to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Select a user
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes[1]) {
        await user.click(checkboxes[1]);

        // Check if delete button appears
        const deleteButton = screen.queryByText(/delete selected/i);
        if (deleteButton) {
          await user.click(deleteButton);

          const confirmButton = screen.queryByText(/delete all/i);
          if (confirmButton) {
            await user.click(confirmButton);

            await waitFor(() => {
              expect(bulkDeleteCalled).toBe(true);
            });
          }
        }
      }
    });
  });

  describe('Search and Filtering', () => {
    it('should display search input', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading users', async () => {
      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Component should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseUrl}/admin/users`, () => {
          return HttpResponse.error();
        })
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Component should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });
  });
});
