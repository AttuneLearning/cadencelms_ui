/**
 * Tests for Admin Dashboard Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../AdminDashboardPage';

// Mock the API client to avoid actual requests
vi.mock('@/shared/api/client', () => ({
  client: {
    get: vi.fn(),
  },
}));

import { client } from '@/shared/api/client';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title and description', () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} });

    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Overview of your learning management system')
    ).toBeInTheDocument();
  });

  it('should render all stat cards', () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} });

    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('Total Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Average Progress')).toBeInTheDocument();
  });

  it('should render quick action links', () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} });

    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Manage Courses')).toBeInTheDocument();
    expect(screen.getByText('View Reports')).toBeInTheDocument();
  });

  it('should show loading skeletons while fetching data', () => {
    // Make client.get hang (never resolve) to simulate loading
    vi.mocked(client.get).mockReturnValue(new Promise(() => {}));

    const { container } = render(<AdminDashboardPage />, {
      wrapper: createWrapper(),
    });

    // Skeleton elements should be present during loading
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display stat values after successful fetch', async () => {
    vi.mocked(client.get).mockResolvedValue({
      data: {
        data: {
          summary: {
            totalLearners: 250,
            activeLearners: 180,
            totalCourses: 42,
            publishedCourses: 30,
            totalEnrollments: 1500,
            averageCompletionRate: 75,
          },
        },
      },
    });

    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    // Wait for the query to resolve and values to appear
    expect(await screen.findByText('250')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should show zero values when API fails', async () => {
    vi.mocked(client.get).mockRejectedValue(new Error('API error'));

    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    // Should render 0 values on error (component catches errors)
    const zeros = await screen.findAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('should have correct navigation links', () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} });

    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/admin/users');
    expect(hrefs).toContain('/admin/courses');
    expect(hrefs).toContain('/admin/reports');
  });
});
