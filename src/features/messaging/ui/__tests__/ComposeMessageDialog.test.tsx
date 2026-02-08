/**
 * ComposeMessageDialog Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComposeMessageDialog } from '../ComposeMessageDialog';

// Mock entity hooks
vi.mock('@/entities/message');
import { useSendMessage } from '@/entities/message';

// Mock toast
vi.mock('@/shared/ui/use-toast');
import { useToast } from '@/shared/ui/use-toast';

const mockToast = vi.fn();
const mockMutateAsync = vi.fn();

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

describe('ComposeMessageDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    });

    vi.mocked(useSendMessage).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it('renders dialog with form fields when open', () => {
    render(
      <ComposeMessageDialog open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Compose Message')).toBeInTheDocument();
    expect(screen.getByText('Send a message to another user')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows recipient inputs when no initial recipient provided', () => {
    render(
      <ComposeMessageDialog open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByPlaceholderText('Recipient User ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Recipient Name (optional)')).toBeInTheDocument();
  });

  it('shows pre-filled recipient when recipientId and recipientName provided', () => {
    render(
      <ComposeMessageDialog
        open={true}
        onOpenChange={vi.fn()}
        recipientId="user-123"
        recipientName="John Doe"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Recipient User ID')).not.toBeInTheDocument();
  });

  it('shows validation toast when subject is empty on submit', async () => {
    render(
      <ComposeMessageDialog
        open={true}
        onOpenChange={vi.fn()}
        recipientId="user-123"
      />,
      { wrapper: createWrapper() }
    );

    // Fill body but not subject — use whitespace to pass HTML required but fail trim()
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Some body text' },
    });

    // Use fireEvent.submit on the form directly (Radix sets pointer-events: none on body)
    const form = screen.getByRole('button', { name: /send message/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Subject Required',
          variant: 'destructive',
        })
      );
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows validation toast when body is empty on submit', async () => {
    render(
      <ComposeMessageDialog
        open={true}
        onOpenChange={vi.fn()}
        recipientId="user-123"
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test subject' },
    });

    // Use fireEvent.submit on the form directly (Radix sets pointer-events: none on body)
    const form = screen.getByRole('button', { name: /send message/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Message Body Required',
          variant: 'destructive',
        })
      );
    });
  });

  it('shows validation toast when recipient is empty on submit', async () => {
    render(
      <ComposeMessageDialog open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test subject' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Some body text' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Recipient Required',
          variant: 'destructive',
        })
      );
    });
  });

  it('sends message and shows success toast on valid submission', async () => {
    const mockOnOpenChange = vi.fn();
    mockMutateAsync.mockResolvedValue({});

    render(
      <ComposeMessageDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        recipientId="user-123"
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test subject' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello there' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        recipientId: 'user-123',
        subject: 'Test subject',
        body: 'Hello there',
        type: 'direct',
      });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Message Sent',
        })
      );
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows error toast when send fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    render(
      <ComposeMessageDialog
        open={true}
        onOpenChange={vi.fn()}
        recipientId="user-123"
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test subject' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello there' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to Send Message',
          description: 'Network error',
          variant: 'destructive',
        })
      );
    });
  });

  it('disables inputs while sending', () => {
    vi.mocked(useSendMessage).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);

    render(
      <ComposeMessageDialog open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByPlaceholderText('Recipient User ID')).toBeDisabled();
    expect(screen.getByLabelText('Subject')).toBeDisabled();
    expect(screen.getByLabelText('Message')).toBeDisabled();
  });

  it('resets form and closes dialog on cancel', () => {
    const mockOnOpenChange = vi.fn();

    render(
      <ComposeMessageDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test subject' },
    });

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
