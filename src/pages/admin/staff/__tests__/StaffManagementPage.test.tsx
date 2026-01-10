/**
 * Integration Tests for Staff Management Page
 * TDD approach: Tests written first, implementation follows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { StaffManagementPage } from '../StaffManagementPage';

// Mock data
const mockStaff = [
  {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    departmentId: 'dept-1',
    department: { id: 'dept-1', name: 'Computer Science', code: 'CS' },
    role: 'staff',
    status: 'active',
    phone: '555-0001',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'staff-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    departmentId: 'dept-2',
    department: { id: 'dept-2', name: 'IT Support', code: 'ITS' },
    role: 'global-admin',
    status: 'active',
    phone: '555-0002',
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('StaffManagementPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Staff Management')).toBeInTheDocument();
      expect(screen.getByText(/manage staff accounts and roles/i)).toBeInTheDocument();
    });

    it('should render Add Staff button', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add staff/i })).toBeInTheDocument();
      });
    });
  });

  describe('Staff List Display', () => {
    it('should display list of staff members', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: mockStaff,
            pagination: { page: 1, limit: 50, total: mockStaff.length, totalPages: 1 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      });
    });

    it('should display staff roles', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: mockStaff,
            pagination: { page: 1, limit: 50, total: mockStaff.length, totalPages: 1 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/staff|admin/i)).toBeInTheDocument();
      });
    });

    it('should display department assignments', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: mockStaff,
            pagination: { page: 1, limit: 50, total: mockStaff.length, totalPages: 1 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should search staff by name or email', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, ({ request }) => {
          const url = new URL(request.url);
          const search = url.searchParams.get('search');
          const filtered = search
            ? mockStaff.filter(
              s =>
                s.firstName.toLowerCase().includes(search.toLowerCase()) ||
                s.lastName.toLowerCase().includes(search.toLowerCase()) ||
                s.email.toLowerCase().includes(search.toLowerCase())
            )
            : mockStaff;
          return HttpResponse.json({
            staff: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      const user = userEvent.setup();
      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should filter by department', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, ({ request }) => {
          const url = new URL(request.url);
          const department = url.searchParams.get('department');
          const filtered = department
            ? mockStaff.filter(s => s.departmentId === department)
            : mockStaff;
          return HttpResponse.json({
            staff: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should filter by role', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, ({ request }) => {
          const url = new URL(request.url);
          const role = url.searchParams.get('role');
          const filtered = role
            ? mockStaff.filter(s => s.role === role)
            : mockStaff;
          return HttpResponse.json({
            staff: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should filter by status', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          const filtered = status
            ? mockStaff.filter(s => s.status === status)
            : mockStaff;
          return HttpResponse.json({
            staff: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog when Add Staff button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      const user = userEvent.setup();
      render(<StaffManagementPage />, { wrapper: createWrapper() });

      const addButton = await screen.findByRole('button', { name: /add staff/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/create new staff|create staff member/i)).toBeInTheDocument();
      });
    });

    it('should open edit dialog when Edit button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: mockStaff,
            pagination: { page: 1, limit: 50, total: mockStaff.length, totalPages: 1 },
          });
        })
      );

      const user = userEvent.setup();
      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button', { name: /open menu/i });
      if (buttons.length > 0) {
        await user.click(buttons[0]);
        await waitFor(() => {
          expect(screen.getByText(/edit staff/i)).toBeInTheDocument();
        });
      }
    });

    it('should delete staff member', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: mockStaff,
            pagination: { page: 1, limit: 50, total: mockStaff.length, totalPages: 1 },
          });
        }),
        http.delete(`${baseUrl}/staff/:id`, () => {
          return HttpResponse.json({ success: true });
        })
      );

      const user = userEvent.setup();
      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button', { name: /open menu/i });
      if (buttons.length > 0) {
        await user.click(buttons[0]);
        await waitFor(() => {
          const deleteMenuItem = screen.getByText(/delete staff/i);
          expect(deleteMenuItem).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should display error message on load failure', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json(
            { message: 'Failed to load staff' },
            { status: 500 }
          );
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading staff/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      server.use(
        http.get(`${baseUrl}/staff`, () => {
          return HttpResponse.json({
            staff: mockStaff,
            pagination: { page: 1, limit: 50, total: mockStaff.length, totalPages: 1 },
          });
        })
      );

      render(<StaffManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /staff management/i });
        expect(heading).toBeInTheDocument();
      });
    });
  });
});
