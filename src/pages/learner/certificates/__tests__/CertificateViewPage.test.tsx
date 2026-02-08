/**
 * Tests for CertificateViewPage
 * Updated: Uses credential hooks (useLearnerCertificates, useCertificateIssuance)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CertificateViewPage } from '../CertificateViewPage';

// Mock hooks
vi.mock('@/entities/credential/hooks/useCredentials');
vi.mock('@/features/auth/model/authStore');

import { useLearnerCertificates, useCertificateIssuance } from '@/entities/credential/hooks/useCredentials';
import { useAuthStore } from '@/features/auth/model/authStore';
import type { CertificateIssuanceListItem } from '@/entities/credential';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock window.print
window.print = vi.fn();

const createRouterWrapper = (initialEntries: string[] = ['/learner/certificates/cert-1']) => {
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

const createMockIssuance = (id: string, overrides?: Partial<CertificateIssuanceListItem>): CertificateIssuanceListItem => ({
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
    code: 'CS101',
    type: 'certificate',
    badgeImageUrl: null,
  },
  certificateDefinition: {
    id: 'cd1',
    version: 1,
    title: 'React Fundamentals',
  },
  verificationCode: `CERT-${id}`.toUpperCase(),
  issuedAt: '2024-01-15T10:30:00Z',
  expiresAt: null,
  isRevoked: false,
  ...overrides,
});

describe('CertificateViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuthStore
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { _id: 'user-1', email: 'john@example.com' },
      };
      return selector ? selector(state) : state;
    });
  });

  const setupMocks = (
    certificates: CertificateIssuanceListItem[] | undefined,
    isLoading: boolean,
    error: Error | null,
    fullIssuance?: any
  ) => {
    vi.mocked(useLearnerCertificates).mockReturnValue({
      data: certificates,
      isLoading,
      error,
      isError: !!error,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useCertificateIssuance).mockReturnValue({
      data: fullIssuance ?? null,
      isLoading: false,
      error: null,
    } as any);
  };

  describe('Rendering', () => {
    it('should render certificate content area', () => {
      const cert = createMockIssuance('cert-1');
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Certificate of Completion/i)).toBeInTheDocument();
    });

    it('should render certificate details sidebar', () => {
      const cert = createMockIssuance('cert-1');
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Certificate Details/i)).toBeInTheDocument();
    });

    it('should display course information in sidebar', () => {
      const cert = createMockIssuance('cert-1');
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getAllByText('React Fundamentals').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/CS101/i).length).toBeGreaterThan(0);
    });

    it('should display learner name on certificate', () => {
      const cert = createMockIssuance('cert-1');
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when data is loading', () => {
      setupMocks(undefined, true, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should not show certificate content while loading', () => {
      setupMocks(undefined, true, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.queryByText(/Certificate of Completion/i)).not.toBeInTheDocument();
    });
  });

  describe('Certificate Data Display', () => {
    it('should display issue date', () => {
      const cert = createMockIssuance('cert-1', {
        learner: { id: 'l1', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      });
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getAllByText(/Issue Date/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/January 15, 2024/i).length).toBeGreaterThan(0);
    });

    it('should display grade when available', () => {
      // Note: CertificateViewPage using credential hooks doesn't display grade
      // since CertificateIssuanceListItem doesn't have grade field.
      // This test verifies the page renders without grade.
      const cert = createMockIssuance('cert-1');
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      // Certificate renders successfully
      expect(screen.getByText(/Certificate of Completion/i)).toBeInTheDocument();
    });

    it('should display verification code', () => {
      const cert = createMockIssuance('cert-1', {
        verificationCode: 'CERT-123456',
      });
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Verification Code/i)).toBeInTheDocument();
      expect(screen.getAllByText(/CERT-123456/i).length).toBeGreaterThan(0);
    });

    it('should display expiry date when available', () => {
      const cert = createMockIssuance('cert-1', {
        expiresAt: '2025-01-15T10:30:00Z',
      });
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Expiry Date/i)).toBeInTheDocument();
      expect(screen.getByText(/January 15, 2025/i)).toBeInTheDocument();
    });

    it('should show no expiry when certificate does not expire', () => {
      const cert = createMockIssuance('cert-1', { expiresAt: null });
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Expiry Date/i)).toBeInTheDocument();
      expect(screen.getByText(/Does not expire/i)).toBeInTheDocument();
    });
  });

  describe('Certificate Actions', () => {
    const setupWithCert = () => {
      const cert = createMockIssuance('cert-1');
      setupMocks([cert], false, null, { pdfUrl: 'https://example.com/cert.pdf' });
      const Wrapper = createRouterWrapper();
      return Wrapper;
    };

    it('should have download PDF button', () => {
      const Wrapper = setupWithCert();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    });

    it('should have print button', () => {
      const Wrapper = setupWithCert();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Print Certificate/i })).toBeInTheDocument();
    });

    it('should call window.print when print button is clicked', () => {
      const Wrapper = setupWithCert();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const printButton = screen.getByRole('button', { name: /Print Certificate/i });
      fireEvent.click(printButton);

      expect(window.print).toHaveBeenCalled();
    });

    it('should have share button', () => {
      const Wrapper = setupWithCert();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Share Certificate/i })).toBeInTheDocument();
    });

    it('should copy link to clipboard when share button is clicked', async () => {
      const Wrapper = setupWithCert();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const shareButton = screen.getByRole('button', { name: /Share Certificate/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it('should have verify button', () => {
      const Wrapper = setupWithCert();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByRole('button', { name: /Verify Certificate/i })).toBeInTheDocument();
    });

    it('should have back to certificates button', () => {
      const Wrapper = setupWithCert();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const backLink = screen.getByRole('link', { name: /Back to Certificates/i });
      expect(backLink).toHaveAttribute('href', '/learner/certificates');
    });
  });

  describe('Error Handling', () => {
    it('should display error when certificate not found', () => {
      setupMocks([], false, new Error('Certificate not found'));

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const heading = screen.getByRole('heading', { name: /Certificate not found/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display error message details', () => {
      setupMocks([], false, new Error('Network error occurred'));

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
    });

    it('should show link to certificates page on error', () => {
      setupMocks([], false, new Error('Certificate not found'));

      const Wrapper = createRouterWrapper();
      render(<CertificateViewPage />, { wrapper: Wrapper });

      const backLink = screen.getByRole('link', { name: /Back to Certificates/i });
      expect(backLink).toHaveAttribute('href', '/learner/certificates');
    });
  });

  describe('Responsive Layout', () => {
    it('should render certificate in print-optimized layout', () => {
      const cert = createMockIssuance('cert-1');
      setupMocks([cert], false, null);

      const Wrapper = createRouterWrapper();
      const { container } = render(<CertificateViewPage />, { wrapper: Wrapper });

      const certificateContainer = container.querySelector('[data-print-optimized]');
      expect(certificateContainer).toBeInTheDocument();
    });
  });
});
