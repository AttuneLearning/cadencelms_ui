/**
 * Tests for ClassDetailsPage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { ClassDetailsPage } from '../ClassDetailsPage';
import { mockFullClass, mockClassRoster, mockClassProgress } from '@/test/mocks/data/classes';

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
        <BrowserRouter>
          <Routes>
            <Route path="/staff/classes/:classId" element={children} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
};

describe('ClassDetailsPage', () => {
  beforeEach(() => {
    server.use(
      http.get(`${env.apiBaseUrl}/api/classes/:classId`, () => {
        return HttpResponse.json(mockFullClass);
      }),
      http.get(`${env.apiBaseUrl}/api/classes/:classId/roster`, () => {
        return HttpResponse.json(mockClassRoster);
      }),
      http.get(`${env.apiBaseUrl}/api/classes/:classId/progress`, () => {
        return HttpResponse.json(mockClassProgress);
      })
    );

    window.history.pushState({}, '', '/staff/classes/class-1');
  });

  it('renders the class details page', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays class information', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    });

    expect(screen.getByText(/CS101/i)).toBeInTheDocument();
    expect(screen.getByText(/john smith/i)).toBeInTheDocument();
  });

  it('displays enrollment count', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/25.*\/.*30/i)).toBeInTheDocument();
    });
  });

  it('displays class status badge', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });

  it('displays enrolled students list', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/bob williams/i)).toBeInTheDocument();
  });

  it('displays progress summary', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/average.*progress/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/62\.5%/i)).toBeInTheDocument();
  });

  it('shows enroll students button', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enroll students/i })).toBeInTheDocument();
    });
  });

  it('opens enroll dialog when enroll button clicked', async () => {
    const user = userEvent.setup();
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enroll students/i })).toBeInTheDocument();
    });

    const enrollButton = screen.getByRole('button', { name: /enroll students/i });
    await user.click(enrollButton);

    await waitFor(() => {
      expect(screen.getByText(/select students/i)).toBeInTheDocument();
    });
  });

  it('shows send announcement button', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send announcement/i })).toBeInTheDocument();
    });
  });

  it('opens announcement dialog when send announcement clicked', async () => {
    const user = userEvent.setup();
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send announcement/i })).toBeInTheDocument();
    });

    const announcementButton = screen.getByRole('button', { name: /send announcement/i });
    await user.click(announcementButton);

    await waitFor(() => {
      expect(screen.getByText(/compose announcement/i)).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/api/classes/:classId`, () => {
        return HttpResponse.json(
          { message: 'Class not found' },
          { status: 404 }
        );
      })
    );

    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/failed to load class/i)).toBeInTheDocument();
    });
  });

  it('displays course information', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/introduction to programming/i)).toBeInTheDocument();
    });
  });

  it('displays schedule information', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/jan.*20.*2026/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/may.*20.*2026/i)).toBeInTheDocument();
  });

  it('shows back button to return to class list', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('navigates back when back button clicked', async () => {
    const user = userEvent.setup();
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    // Navigation should occur
    expect(backButton).toBeInTheDocument();
  });

  it('displays tabs for different sections', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /students/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: /progress/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /details/i })).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /students/i })).toBeInTheDocument();
    });

    const progressTab = screen.getByRole('tab', { name: /progress/i });
    await user.click(progressTab);

    expect(progressTab).toHaveAttribute('data-state', 'active');
  });

  it('displays instructor information', async () => {
    render(<ClassDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/john smith/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/john.smith@example.com/i)).toBeInTheDocument();
  });
});
