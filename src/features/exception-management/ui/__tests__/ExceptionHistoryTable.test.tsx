/**
 * ExceptionHistoryTable Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExceptionHistoryTable } from '../ExceptionHistoryTable';
import type { LearnerExceptionListItem } from '@/entities/exception';

// Mock entity hooks
vi.mock('@/entities/exception');
import { useEnrollmentExceptions } from '@/entities/exception';

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

const mockExceptions: LearnerExceptionListItem[] = [
  {
    id: 'exc-1',
    enrollmentId: 'enroll-1',
    learnerId: 'learner-1',
    learnerName: 'Jane Doe',
    courseId: 'course-1',
    type: 'extra_attempts',
    details: { additionalAttempts: 2, contentType: 'exercise' },
    reason: 'Technical issues during exam',
    grantedBy: { id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    grantedAt: '2024-06-15T10:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'exc-2',
    enrollmentId: 'enroll-1',
    learnerId: 'learner-1',
    learnerName: 'Jane Doe',
    courseId: 'course-1',
    type: 'extended_access',
    details: { newExpirationDate: '2025-03-01T00:00:00Z' },
    reason: 'Medical leave',
    grantedBy: { id: 'admin-2', firstName: 'Staff', lastName: 'Member' },
    grantedAt: '2024-05-01T08:00:00Z',
    expiresAt: null,
    isActive: false,
  },
  {
    id: 'exc-3',
    enrollmentId: 'enroll-1',
    learnerId: 'learner-1',
    learnerName: 'Jane Doe',
    courseId: 'course-1',
    type: 'module_unlock',
    details: { moduleName: 'Advanced Topics' },
    reason: 'Prior experience verified',
    grantedBy: { id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    grantedAt: '2024-07-01T12:00:00Z',
    expiresAt: null,
    isActive: true,
  },
];

describe('ExceptionHistoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while fetching', () => {
    vi.mocked(useEnrollmentExceptions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<ExceptionHistoryTable enrollmentId="enroll-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Exception History')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', () => {
    vi.mocked(useEnrollmentExceptions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as any);

    render(<ExceptionHistoryTable enrollmentId="enroll-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Error loading exceptions')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders empty state when no exceptions', () => {
    vi.mocked(useEnrollmentExceptions).mockReturnValue({
      data: { exceptions: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
    } as any);

    render(<ExceptionHistoryTable enrollmentId="enroll-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Exception History (0)')).toBeInTheDocument();
    expect(screen.getByText('No exceptions granted yet')).toBeInTheDocument();
  });

  it('renders exception rows with correct data', () => {
    vi.mocked(useEnrollmentExceptions).mockReturnValue({
      data: { exceptions: mockExceptions, pagination: { page: 1, limit: 10, total: 3, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
    } as any);

    render(<ExceptionHistoryTable enrollmentId="enroll-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Exception History (3)')).toBeInTheDocument();

    // Table headers
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
    expect(screen.getByText('Granted By')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Exception type labels
    expect(screen.getByText('Extra Attempts')).toBeInTheDocument();
    expect(screen.getByText('Extended Access')).toBeInTheDocument();
    expect(screen.getByText('Module Unlock')).toBeInTheDocument();

    // Reasons
    expect(screen.getByText('Technical issues during exam')).toBeInTheDocument();
    expect(screen.getByText('Medical leave')).toBeInTheDocument();
    expect(screen.getByText('Prior experience verified')).toBeInTheDocument();

    // Granted by
    expect(screen.getAllByText('Admin User')).toHaveLength(2);
    expect(screen.getByText('Staff Member')).toBeInTheDocument();
  });

  it('shows Active badge for active exceptions', () => {
    vi.mocked(useEnrollmentExceptions).mockReturnValue({
      data: { exceptions: mockExceptions, pagination: { page: 1, limit: 10, total: 3, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
    } as any);

    render(<ExceptionHistoryTable enrollmentId="enroll-1" />, {
      wrapper: createWrapper(),
    });

    // 2 active + 1 expired
    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges).toHaveLength(2);

    const expiredBadges = screen.getAllByText('Expired');
    expect(expiredBadges).toHaveLength(1);
  });

  it('formats exception details correctly', () => {
    vi.mocked(useEnrollmentExceptions).mockReturnValue({
      data: { exceptions: mockExceptions, pagination: { page: 1, limit: 10, total: 3, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
    } as any);

    render(<ExceptionHistoryTable enrollmentId="enroll-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('+2 attempts for exercise')).toBeInTheDocument();
    expect(screen.getByText('Unlocked: Advanced Topics')).toBeInTheDocument();
  });

  it('passes enrollmentId to useEnrollmentExceptions', () => {
    vi.mocked(useEnrollmentExceptions).mockReturnValue({
      data: { exceptions: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
    } as any);

    render(<ExceptionHistoryTable enrollmentId="enroll-42" />, {
      wrapper: createWrapper(),
    });

    expect(useEnrollmentExceptions).toHaveBeenCalledWith('enroll-42');
  });
});
