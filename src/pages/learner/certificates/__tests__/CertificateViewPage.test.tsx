/**
 * Tests for CertificateViewPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CertificateViewPage } from '../CertificateViewPage';
import * as enrollmentModule from '@/entities/enrollment';

// Mock hooks
vi.mock('@/entities/enrollment', () => ({
  useEnrollment: vi.fn(),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock window.print
window.print = vi.fn();

const useEnrollment = enrollmentModule.useEnrollment as ReturnType<typeof vi.fn>;

const createRouterWrapper = (initialEntries: string[] = ['/learner/certificates/enr-1']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/learner/certificates/:certificateId" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CertificateViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render certificate content area', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
          learner: {
            id: 'l1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          department: { id: 'd1', name: 'Computer Science', code: 'CS' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Certificate of Completion/i)).toBeInTheDocument();
    });

    it('should render certificate details sidebar', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
          learner: {
            id: 'l1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          department: { id: 'd1', name: 'Computer Science', code: 'CS' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Certificate Details/i)).toBeInTheDocument();
    });

    it('should display course information in sidebar', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
          learner: {
            id: 'l1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          department: { id: 'd1', name: 'Computer Science', code: 'CS' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      // Should display course name (appears in both certificate and sidebar)
      expect(screen.getAllByText('React Fundamentals').length).toBeGreaterThan(0);
      // Should display course code
      expect(screen.getAllByText(/CS101/i).length).toBeGreaterThan(0);
    });

    it('should display learner name on certificate', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
          learner: {
            id: 'l1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          department: { id: 'd1', name: 'Computer Science', code: 'CS' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when data is loading', () => {
      useEnrollment.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should not show certificate content while loading', () => {
      useEnrollment.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.queryByText(/Certificate of Completion/i)).not.toBeInTheDocument();
    });
  });

  describe('Certificate Data Display', () => {
    it('should display issue date', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      // "Issue Date" appears multiple times (certificate footer and sidebar)
      expect(screen.getAllByText(/Issue Date/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Jan 15, 2024/i).length).toBeGreaterThan(0);
    });

    it('should display grade when available', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 95, letter: 'A', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      // "Grade" text appears multiple times (sidebar and certificate)
      expect(screen.getAllByText(/Grade/i).length).toBeGreaterThan(0);
      // Grade letter appears multiple times (certificate and sidebar)
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
      // Percentage appears multiple times
      expect(screen.getAllByText(/95%/i).length).toBeGreaterThan(0);
    });

    it('should display verification code', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-123456',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Verification Code/i)).toBeInTheDocument();
      // Verification code appears multiple times (certificate footer and sidebar)
      expect(screen.getAllByText(/ENR-123456/i).length).toBeGreaterThan(0);
    });

    it('should display expiry date when available', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: '2025-01-15T10:30:00Z',
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Expiry Date/i)).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();
    });

    it('should show no expiry when certificate does not expire', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Expiry Date/i)).toBeInTheDocument();
      expect(screen.getByText(/Does not expire/i)).toBeInTheDocument();
    });
  });

  describe('Certificate Actions', () => {
    it('should have download PDF button', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    });

    it('should have print button', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Print Certificate/i })).toBeInTheDocument();
    });

    it('should call window.print when print button is clicked', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const printButton = screen.getByRole('button', { name: /Print Certificate/i });
      fireEvent.click(printButton);

      expect(window.print).toHaveBeenCalled();
    });

    it('should have share button', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Share Certificate/i })).toBeInTheDocument();
    });

    it('should copy link to clipboard when share button is clicked', async () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const shareButton = screen.getByRole('button', { name: /Share Certificate/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it('should have verify button', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Verify Certificate/i })).toBeInTheDocument();
    });

    it('should have back to certificates button', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const backLink = screen.getByRole('link', { name: /Back to Certificates/i });
      expect(backLink).toHaveAttribute('href', '/learner/certificates');
    });
  });

  describe('Error Handling', () => {
    it('should display error when certificate not found', () => {
      useEnrollment.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Certificate not found'),
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      // Should show error heading
      const heading = screen.getByRole('heading', { name: /Certificate not found/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display error message details', () => {
      useEnrollment.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error occurred'),
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
    });

    it('should show link to certificates page on error', () => {
      useEnrollment.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Certificate not found'),
      });

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const backLink = screen.getByRole('link', { name: /Back to Certificates/i });
      expect(backLink).toHaveAttribute('href', '/learner/certificates');
    });
  });

  describe('Responsive Layout', () => {
    it('should render certificate in print-optimized layout', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      const { container } = render(<CertificateViewPage />, { wrapper: Wrapper });

      // Check for print-specific classes/attributes
      const certificateContainer = container.querySelector('[data-print-optimized]');
      expect(certificateContainer).toBeInTheDocument();
    });

    it('should hide sidebar action buttons on print', () => {
      useEnrollment.mockReturnValue({
        data: {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          learner: {
            id: 'l1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          department: { id: 'd1', name: 'Department', code: 'DEPT' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          withdrawnAt: null,
          expiresAt: null,
        },
        isLoading: false,
        error: null,
      });

      const Wrapper = createRouterWrapper();
      const { container } = render(<CertificateViewPage />, { wrapper: Wrapper });

      // Check that buttons have print:hidden class or similar
      const actionButtons = container.querySelectorAll('button');
      actionButtons.forEach(button => {
        expect(button.className).toContain('print:hidden');
      });
    });
  });
});
