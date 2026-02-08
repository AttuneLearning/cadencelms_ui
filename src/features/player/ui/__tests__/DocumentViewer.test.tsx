import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DocumentViewer } from '../DocumentViewer';

describe('DocumentViewer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const renderDocumentViewer = (props = {}) => {
    const defaultProps = {
      attemptId: 'attempt-1',
      documentUrl: 'https://example.com/document.pdf',
      documentType: 'pdf' as const,
      onViewed: vi.fn(),
      onError: vi.fn(),
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <DocumentViewer {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  it('should render PDF in an iframe', () => {
    renderDocumentViewer();

    const iframe = screen.getByTitle('PDF Document');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/document.pdf');
  });

  it('should show loading state initially', () => {
    renderDocumentViewer();

    expect(screen.getByText(/loading document/i)).toBeInTheDocument();
  });

  it('should render download button', () => {
    renderDocumentViewer();

    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('should show error state when no URL provided', () => {
    renderDocumentViewer({ documentUrl: '' });

    expect(screen.getByText(/invalid document url/i)).toBeInTheDocument();
    expect(screen.getByText(/no document url provided/i)).toBeInTheDocument();
  });

  it('should render image for non-PDF document type', () => {
    renderDocumentViewer({
      documentUrl: 'https://example.com/image.png',
      documentType: 'image',
    });

    const img = screen.getByAltText('Document');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.png');
  });

  it('should call onViewed when iframe loads', () => {
    const onViewed = vi.fn();
    renderDocumentViewer({ onViewed });

    const iframe = screen.getByTitle('PDF Document');
    fireEvent.load(iframe);

    expect(onViewed).toHaveBeenCalledTimes(1);
  });

  it('should hide loading spinner when iframe loads successfully', () => {
    renderDocumentViewer();

    // Initially loading
    expect(screen.getByText(/loading document/i)).toBeInTheDocument();

    const iframe = screen.getByTitle('PDF Document');
    fireEvent.load(iframe);

    // Loading should be gone
    expect(screen.queryByText(/loading document/i)).not.toBeInTheDocument();
  });

  it('should open document URL on download click', () => {
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderDocumentViewer();

    fireEvent.click(screen.getByRole('button', { name: /download/i }));

    expect(windowOpen).toHaveBeenCalledWith('https://example.com/document.pdf', '_blank');
    windowOpen.mockRestore();
  });
});
