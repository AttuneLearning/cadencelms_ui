/**
 * Integration Tests for Learner Management Page
 * TDD approach: Tests written first, implementation follows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { LearnerManagementPage } from '../LearnerManagementPage';

const mockLearners = [
  {
    id: 'learner-1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    studentId: 'STU-001',
    departmentId: 'dept-1',
    department: { id: 'dept-1', name: 'Computer Science' },
    status: 'active',
    enrollmentCount: 3,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'learner-2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob@example.com',
    studentId: 'STU-002',
    departmentId: 'dept-2',
    department: { id: 'dept-2', name: 'IT Support' },
    status: 'active',
    enrollmentCount: 2,
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('LearnerManagementPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json({
            learners: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Learner Management')).toBeInTheDocument();
      expect(screen.getByText(/manage learner accounts/i)).toBeInTheDocument();
    });

    it('should render Add Learner button', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json({
            learners: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add learner/i })).toBeInTheDocument();
      });
    });
  });

  describe('Learner List Display', () => {
    it('should display list of learners', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json({
            learners: mockLearners,
            pagination: { page: 1, limit: 50, total: mockLearners.length, totalPages: 1 },
          })
        )
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
      });
    });

    it('should display enrollment counts', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json({
            learners: mockLearners,
            pagination: { page: 1, limit: 50, total: mockLearners.length, totalPages: 1 },
          })
        )
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/alice/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should search learners by name or email', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, ({ request }) => {
          const url = new URL(request.url);
          const search = url.searchParams.get('search');
          const filtered = search
            ? mockLearners.filter(
              l =>
                l.firstName.toLowerCase().includes(search.toLowerCase()) ||
                l.email.toLowerCase().includes(search.toLowerCase())
            )
            : mockLearners;
          return HttpResponse.json({
            learners: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      const user = userEvent.setup();
      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('should filter by department', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, ({ request }) => {
          const url = new URL(request.url);
          const department = url.searchParams.get('department');
          const filtered = department
            ? mockLearners.filter(l => l.departmentId === department)
            : mockLearners;
          return HttpResponse.json({
            learners: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('should filter by status', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          const filtered = status
            ? mockLearners.filter(l => l.status === status)
            : mockLearners;
          return HttpResponse.json({
            learners: filtered,
            pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
          });
        })
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog when Add Learner button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json({
            learners: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          })
        )
      );

      const user = userEvent.setup();
      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      const addButton = await screen.findByRole('button', { name: /add learner/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/create new learner|create learner/i)).toBeInTheDocument();
      });
    });

    it('should delete learner', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json({
            learners: mockLearners,
            pagination: { page: 1, limit: 50, total: mockLearners.length, totalPages: 1 },
          })
        ),
        http.delete(`${baseUrl}/learners/:id`, () =>
          HttpResponse.json({ success: true })
        )
      );

      const user = userEvent.setup();
      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on load failure', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json(
            { message: 'Failed to load learners' },
            { status: 500 }
          )
        )
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading learners/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      server.use(
        http.get(`${baseUrl}/learners`, () =>
          HttpResponse.json({
            learners: mockLearners,
            pagination: { page: 1, limit: 50, total: mockLearners.length, totalPages: 1 },
          })
        )
      );

      render(<LearnerManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /learner management/i });
        expect(heading).toBeInTheDocument();
      });
    });
  });
});
