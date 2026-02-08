/**
 * Tests for CertificatesPage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CertificatesPage } from '../CertificatesPage';

// Mock hooks
vi.mock('@/entities/credential/hooks/useCredentials');
vi.mock('@/features/auth/model/authStore');

import { useLearnerCertificates } from '@/entities/credential/hooks/useCredentials';
import { useAuthStore } from '@/features/auth/model/authStore';
import type { CertificateIssuanceListItem } from '@/entities/credential';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Helper to create mock certificate issuance
const createMockCertificate = (id: string, overrides?: Partial<CertificateIssuanceListItem>): CertificateIssuanceListItem => ({
  id,
  learner: {
    id: 'l1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  credentialGroup: {
    id: 'cg1',
    name: 'React Developer Certification',
    code: 'REACT-CERT',
    type: 'certificate',
    badgeImageUrl: null,
  },
  certificateDefinition: {
    id: 'cd1',
    version: 1,
    title: 'React Fundamentals Certificate',
  },
  verificationCode: `CERT-${id}`.toUpperCase(),
  issuedAt: '2024-01-15T10:30:00Z',
  expiresAt: null,
  isRevoked: false,
  ...overrides,
});

// Helper to create mock query result
const createMockQueryResult = (data: CertificateIssuanceListItem[] | undefined, isLoading: boolean, error: Error | null) => ({
  data,
  isLoading,
  error,
  isError: !!error,
  isSuccess: !isLoading && !error && data !== undefined,
  status: isLoading ? 'pending' as const : error ? 'error' as const : 'success' as const,
  refetch: vi.fn(),
  fetchStatus: 'idle' as const,
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: error,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isInitialLoading: isLoading,
  isLoadingError: false,
  isPaused: false,
  isPlaceholderData: false,
  isPending: isLoading,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
}) as any;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CertificatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuthStore
    vi.mocked(useAuthStore).mockReturnValue({
      _id: 'user-1',
      email: 'john@example.com',
      userTypes: ['learner'],
    } as any);
  });

  describe('Rendering', () => {
    it('should render page title and description', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Certificates/i)).toBeInTheDocument();
      expect(screen.getByText(/View and download/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/Search certificates/i)).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when data is loading', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(undefined, true, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no certificates', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/No certificates earned yet/i)).toBeInTheDocument();
    });

    it('should show encouragement message in empty state', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Complete courses to earn certificates/i)).toBeInTheDocument();
    });

    it('should show link to course catalog in empty state', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const catalogLink = screen.getByRole('link', { name: /Browse Course Catalog/i });
      expect(catalogLink).toHaveAttribute('href', '/learner/catalog');
    });
  });

  describe('Certificate Display', () => {
    it('should display issued certificates', () => {
      const mockCertificates = [
        createMockCertificate('cert-1', {
          certificateDefinition: {
            id: 'cd1',
            version: 1,
            title: 'React Fundamentals Certificate',
          },
        }),
        createMockCertificate('cert-2', {
          certificateDefinition: {
            id: 'cd2',
            version: 1,
            title: 'Advanced TypeScript Certificate',
          },
        }),
      ];

      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(mockCertificates, false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Fundamentals Certificate')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript Certificate')).toBeInTheDocument();
    });

    it('should display credential group name for each certificate', () => {
      const mockCertificates = [
        createMockCertificate('cert-1', {
          credentialGroup: {
            id: 'cg1',
            name: 'React Developer Certification',
            code: 'REACT-CERT',
            type: 'certificate',
            badgeImageUrl: null,
          },
        }),
      ];

      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(mockCertificates, false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Developer Certification')).toBeInTheDocument();
    });

    it('should display issue date for each certificate', () => {
      const mockCertificates = [
        createMockCertificate('cert-1'),
      ];

      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(mockCertificates, false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Issued/i)).toBeInTheDocument();
    });

    it('should display verification code for each certificate', () => {
      const mockCertificates = [
        createMockCertificate('cert-123456'),
      ];

      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(mockCertificates, false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/CERT-CERT-123456/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter certificates by title', async () => {
      const mockCertificates = [
        createMockCertificate('cert-1', {
          certificateDefinition: {
            id: 'cd1',
            version: 1,
            title: 'React Fundamentals Certificate',
          },
        }),
        createMockCertificate('cert-2', {
          certificateDefinition: {
            id: 'cd2',
            version: 1,
            title: 'Advanced TypeScript Certificate',
          },
          credentialGroup: {
            id: 'cg2',
            name: 'TypeScript Developer Certification',
            code: 'TS-CERT',
            type: 'certificate',
            badgeImageUrl: null,
          },
        }),
      ];

      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(mockCertificates, false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/Search certificates/i);
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals Certificate')).toBeInTheDocument();
        expect(screen.queryByText('Advanced TypeScript Certificate')).not.toBeInTheDocument();
      });
    });

    it('should show empty result message when search has no matches', async () => {
      const mockCertificates = [
        createMockCertificate('cert-1'),
      ];

      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(mockCertificates, false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/Search certificates/i);
      fireEvent.change(searchInput, { target: { value: 'Python' } });

      await waitFor(() => {
        expect(screen.getByText(/No certificates found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sort Functionality', () => {
    it('should initialize with default sort (newest first)', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Issue Date \(Newest\)/i)).toBeInTheDocument();
    });

    it('should have sort options available', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const sortButton = screen.getByRole('combobox');
      expect(sortButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(undefined, false, new Error('Failed to fetch certificates'))
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/unable to load certificates/i)).toBeInTheDocument();
    });
  });

  describe('Date Range Filter', () => {
    it('should display date range filter inputs', () => {
      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult([], false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/From Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/To Date/i)).toBeInTheDocument();
    });

    it('should filter certificates by date range', async () => {
      const mockCertificates = [
        createMockCertificate('cert-1', {
          issuedAt: '2023-01-15T10:30:00Z',
        }),
        createMockCertificate('cert-2', {
          issuedAt: '2024-06-15T10:30:00Z',
          certificateDefinition: {
            id: 'cd2',
            version: 1,
            title: 'New Certificate',
          },
        }),
      ];

      vi.mocked(useLearnerCertificates).mockReturnValue(
        createMockQueryResult(mockCertificates, false, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const fromDate = screen.getByLabelText(/From Date/i);
      const toDate = screen.getByLabelText(/To Date/i);

      fireEvent.change(fromDate, { target: { value: '2024-01-01' } });
      fireEvent.change(toDate, { target: { value: '2024-12-31' } });

      await waitFor(() => {
        expect(screen.getByText('New Certificate')).toBeInTheDocument();
        expect(screen.queryByText('React Fundamentals Certificate')).not.toBeInTheDocument();
      });
    });
  });
});
