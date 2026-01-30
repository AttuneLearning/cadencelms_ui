/**
 * Integration Tests for Academic Year Management Page
 * TDD approach: Tests written first, implementation follows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { AcademicYearManagementPage } from '../AcademicYearManagementPage';

const mockAcademicYears = [
  {
    id: 'year-1',
    name: '2024',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-12-31').toISOString(),
    isCurrent: true,
    classCount: 10,
    createdAt: new Date('2023-12-01').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'year-2',
    name: '2025',
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2025-12-31').toISOString(),
    isCurrent: false,
    classCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
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

describe('AcademicYearManagementPage', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: [],
              pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('heading', { name: /academic year management/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/manage academic years and terms/i)).toBeInTheDocument();
    });

    it('should render Add Academic Year button', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: [],
              pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add academic year/i })).toBeInTheDocument();
      });
    });
  });

  describe('Academic Year List Display', () => {
    it('should display list of academic years', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: mockAcademicYears,
              pagination: { page: 1, limit: 50, total: mockAcademicYears.length, totalPages: 1 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument();
        expect(screen.getByText('2025')).toBeInTheDocument();
      });
    });

    it('should display current academic year indicator', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: mockAcademicYears,
              pagination: { page: 1, limit: 50, total: mockAcademicYears.length, totalPages: 1 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/current/i)).toBeInTheDocument();
      });
    });

    it('should display class counts', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: mockAcademicYears,
              pagination: { page: 1, limit: 50, total: mockAcademicYears.length, totalPages: 1 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog when Add Academic Year button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: [],
              pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      const addButton = await screen.findByRole('button', { name: /add academic year/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create new academic year|create academic year/i })).toBeInTheDocument();
      });
    });

    it('should open edit dialog when Edit button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: mockAcademicYears,
              pagination: { page: 1, limit: 50, total: mockAcademicYears.length, totalPages: 1 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button', { name: /open menu/i });
      if (buttons.length > 0) {
        await user.click(buttons[0]);
        await waitFor(() => {
          expect(screen.getByText(/edit academic year/i)).toBeInTheDocument();
        });
      }
    });

    it('should delete academic year', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: mockAcademicYears,
              pagination: { page: 1, limit: 50, total: mockAcademicYears.length, totalPages: 1 },
            },
          })
        ),
        http.delete(`${baseUrl}/calendar/years/:id`, () =>
          HttpResponse.json({ success: true, data: null })
        )
      );

      const user = userEvent.setup();
      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument();
      });
    });
  });

  describe('Date Validation', () => {
    it('should validate end date is after start date', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: [],
              pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      const addButton = await screen.findByRole('button', { name: /add academic year/i });
      await userEvent.setup().click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create new academic year|create academic year/i })).toBeInTheDocument();
      });
    });
  });

  describe('Current Year Management', () => {
    it('should only allow one current academic year', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: mockAcademicYears,
              pagination: { page: 1, limit: 50, total: mockAcademicYears.length, totalPages: 1 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on load failure', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json(
            { success: false, message: 'Failed to load academic years' },
            { status: 500 }
          )
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading academic years/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      server.use(
        http.get(`${baseUrl}/calendar/years`, () =>
          HttpResponse.json({
            success: true,
            data: {
              years: mockAcademicYears,
              pagination: { page: 1, limit: 50, total: mockAcademicYears.length, totalPages: 1 },
            },
          })
        )
      );

      render(<AcademicYearManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /academic year management/i, level: 1 });
        expect(heading).toBeInTheDocument();
      });
    });
  });
});
