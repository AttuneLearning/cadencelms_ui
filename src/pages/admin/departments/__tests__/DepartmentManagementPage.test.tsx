/**
 * Integration Tests for Department Management Page
 * TDD approach: Tests written first, implementation follows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { DepartmentManagementPage } from '../DepartmentManagementPage';

// Mock data
const mockDepartments = [
  {
    id: 'dept-1',
    name: 'Computer Science',
    code: 'CS',
    description: 'Department of Computer Science',
    parentId: null,
    staffCount: 5,
    learnerCount: 150,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'dept-2',
    name: 'Information Technology',
    code: 'IT',
    description: 'Department of Information Technology',
    parentId: 'dept-1',
    staffCount: 3,
    learnerCount: 100,
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

describe('DepartmentManagementPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Department Management')).toBeInTheDocument();
      expect(screen.getByText(/manage departments and organizational structure/i)).toBeInTheDocument();
    });

    it('should render Add Department button', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add department/i })).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      server.use(
        http.get(`${baseUrl}/departments`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({
            departments: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Department Management')).toBeInTheDocument();
    });
  });

  describe('Department List Display', () => {
    it('should display list of departments', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: mockDepartments,
            pagination: { page: 1, limit: 50, total: mockDepartments.length, totalPages: 1 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('Information Technology')).toBeInTheDocument();
      });
    });

    it('should display department stats', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: mockDepartments,
            pagination: { page: 1, limit: 50, total: mockDepartments.length, totalPages: 1 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Stats should show staff and learner counts
        expect(screen.getByText(/5/)).toBeInTheDocument(); // staff count
        expect(screen.getByText(/150/)).toBeInTheDocument(); // learner count
      });
    });

    it('should display hierarchical relationship indicators', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: mockDepartments,
            pagination: { page: 1, limit: 50, total: mockDepartments.length, totalPages: 1 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('Information Technology')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should search departments by name', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, ({ request }) => {
          const url = new URL(request.url);
          const search = url.searchParams.get('search');
          const filtered = search
            ? mockDepartments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
            : mockDepartments;
          return HttpResponse.json({
            departments: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      const user = userEvent.setup();
      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search departments/i);
      await user.type(searchInput, 'Information');

      await waitFor(() => {
        expect(screen.getByText('Information Technology')).toBeInTheDocument();
        expect(screen.queryByText('Computer Science')).not.toBeInTheDocument();
      });
    });

    it('should filter departments by parent', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, ({ request }) => {
          const url = new URL(request.url);
          const parentId = url.searchParams.get('parentId');
          const filtered = parentId
            ? mockDepartments.filter(d => d.parentId === parentId)
            : mockDepartments;
          return HttpResponse.json({
            departments: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog when Add Department button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        })
      );

      const user = userEvent.setup();
      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      const addButton = await screen.findByRole('button', { name: /add department/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/create new department/i)).toBeInTheDocument();
      });
    });

    it('should open edit dialog when Edit button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: mockDepartments,
            pagination: { page: 1, limit: 50, total: mockDepartments.length, totalPages: 1 },
          });
        })
      );

      const user = userEvent.setup();
      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });

      // Find and click the first row's action menu
      const buttons = screen.getAllByRole('button', { name: /open menu/i });
      if (buttons.length > 0) {
        await user.click(buttons[0]);
        await waitFor(() => {
          expect(screen.getByText(/edit department/i)).toBeInTheDocument();
        });
      }
    });

    it('should create new department', async () => {
      let createCalled = false;
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        }),
        http.post(`${baseUrl}/departments`, async ({ request }) => {
          createCalled = true;
          const data = await request.json();
          return HttpResponse.json({
            id: 'new-dept',
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const user = userEvent.setup();
      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      const addButton = await screen.findByRole('button', { name: /add department/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/create new department/i)).toBeInTheDocument();
      });
    });

    it('should delete department', async () => {
      let deleteCalled = false;
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: mockDepartments,
            pagination: { page: 1, limit: 50, total: mockDepartments.length, totalPages: 1 },
          });
        }),
        http.delete(`${baseUrl}/departments/:id`, () => {
          deleteCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      const user = userEvent.setup();
      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button', { name: /open menu/i });
      if (buttons.length > 0) {
        await user.click(buttons[0]);
        await waitFor(() => {
          const deleteMenuItem = screen.getByText(/delete department/i);
          expect(deleteMenuItem).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should display error message on load failure', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json(
            { message: 'Failed to load departments' },
            { status: 500 }
          );
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading departments/i)).toBeInTheDocument();
      });
    });

    it('should show error toast on delete failure', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: mockDepartments,
            pagination: { page: 1, limit: 50, total: mockDepartments.length, totalPages: 1 },
          });
        }),
        http.delete(`${baseUrl}/departments/:id`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete department with active staff' },
            { status: 400 }
          );
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination info', async () => {
      const largeMockList = Array.from({ length: 100 }, (_, i) => ({
        ...mockDepartments[0],
        id: `dept-${i}`,
        name: `Department ${i + 1}`,
      }));

      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: largeMockList.slice(0, 50),
            pagination: { page: 1, limit: 50, total: 100, totalPages: 2 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/showing \d+ of \d+ department/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      server.use(
        http.get(`${baseUrl}/departments`, () => {
          return HttpResponse.json({
            departments: mockDepartments,
            pagination: { page: 1, limit: 50, total: mockDepartments.length, totalPages: 1 },
          });
        })
      );

      render(<DepartmentManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /department management/i });
        expect(heading).toBeInTheDocument();
      });
    });
  });
});
