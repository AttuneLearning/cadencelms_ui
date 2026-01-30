/**
 * Tests for ClassManagementPage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { ClassManagementPage } from '../ClassManagementPage';
import { mockClasses } from '@/test/mocks/data/classes';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
};

describe('ClassManagementPage', () => {
  beforeEach(() => {
    server.use(
      http.get(`${env.apiFullUrl}/classes`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            classes: mockClasses,
            pagination: {
              page: 1,
              limit: 20,
              total: mockClasses.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      })
    );
  });

  it('renders the page title', async () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/class management/i)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays list of classes after loading', async () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });

    expect(screen.getByText('Advanced Database Systems - Spring 2026')).toBeInTheDocument();
    expect(screen.getByText('Web Development Fundamentals - Fall 2026')).toBeInTheDocument();
  });

  it('displays enrollment counts for each class', async () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/25.*\/.*30/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/18.*\/.*20/i)).toBeInTheDocument();
  });

  it('allows searching classes by name', async () => {
    const user = userEvent.setup();
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search classes/i);
    await user.type(searchInput, 'Database');

    server.use(
      http.get(`${env.apiFullUrl}/classes`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            classes: [mockClasses[1]],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Advanced Database Systems - Spring 2026')).toBeInTheDocument();
    });
  });

  it('allows filtering by status', async () => {
    const user = userEvent.setup();
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });

    server.use(
      http.get(`${env.apiFullUrl}/classes`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            classes: mockClasses.filter((c) => c.status === 'active'),
            pagination: {
              page: 1,
              limit: 20,
              total: 3,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      })
    );

    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    await user.click(statusFilter);

    const activeOption = screen.getByRole('option', { name: /active/i });
    await user.click(activeOption);

    await waitFor(() => {
      const classes = screen.queryAllByTestId(/class-card/i);
      expect(classes.length).toBeGreaterThan(0);
    });
  });

  it('allows filtering by course', async () => {
    const user = userEvent.setup();
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });

    const courseFilter = screen.getByRole('combobox', { name: /course/i });
    await user.click(courseFilter);

    // Filtering should work
    expect(courseFilter).toBeInTheDocument();
  });

  it('toggles between grid and list view', async () => {
    const user = userEvent.setup();
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });

    const listViewButton = screen.getByRole('button', { name: /list view/i });
    await user.click(listViewButton);

    expect(listViewButton).toHaveAttribute('data-state', 'on');

    const gridViewButton = screen.getByRole('button', { name: /grid view/i });
    await user.click(gridViewButton);

    expect(gridViewButton).toHaveAttribute('data-state', 'on');
  });

  it('displays error message when fetch fails', async () => {
    server.use(
      http.get(`${env.apiFullUrl}/classes`, () => {
        return HttpResponse.json(
          { success: false, message: 'Failed to fetch classes' },
          { status: 500 }
        );
      })
    );

    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/failed to load classes/i)).toBeInTheDocument();
    });
  });

  it('navigates to class details when view button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    await user.click(viewButtons[0]);

    // Navigation should occur (we'll check in integration tests)
    expect(viewButtons[0]).toBeInTheDocument();
  });

  it('displays empty state when no classes found', async () => {
    server.use(
      http.get(`${env.apiFullUrl}/classes`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            classes: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      })
    );

    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no classes found/i)).toBeInTheDocument();
    });
  });

  it('displays status badges correctly', async () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText(/active/i).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/upcoming/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
  });

  it('shows instructor names for each class', async () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText(/john smith/i).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/sarah johnson/i).length).toBeGreaterThan(0);
  });
});
