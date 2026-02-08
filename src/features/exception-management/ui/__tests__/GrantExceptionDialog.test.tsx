/**
 * Tests for GrantExceptionDialog
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GrantExceptionDialog } from '../GrantExceptionDialog';

// Mock hooks
vi.mock('@/entities/exception');

import { useGrantException } from '@/entities/exception';

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

describe('GrantExceptionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with trigger button', () => {
    (useGrantException as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <GrantExceptionDialog
        enrollmentId="enrollment1"
        learnerName="John Doe"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /grant exception/i })).toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    (useGrantException as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <GrantExceptionDialog
        enrollmentId="enrollment1"
        learnerName="John Doe"
      />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: /grant exception/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText('Exception Type')).toBeInTheDocument();
    });
  });

  it('should show exception type selector', async () => {
    const user = userEvent.setup();
    (useGrantException as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <GrantExceptionDialog
        enrollmentId="enrollment1"
        learnerName="John Doe"
      />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByRole('button', { name: /grant exception/i }));

    await waitFor(() => {
      expect(screen.getByText('Exception Type')).toBeInTheDocument();
    });
  });

  it('should show type-specific fields for extra attempts', async () => {
    const user = userEvent.setup();
    (useGrantException as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <GrantExceptionDialog
        enrollmentId="enrollment1"
        learnerName="John Doe"
      />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByRole('button', { name: /grant exception/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/content id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/additional attempts/i)).toBeInTheDocument();
    });
  });

  it('should require reason field', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const mutateAsync = vi.fn();
    (useGrantException as any).mockReturnValue({ mutateAsync, isPending: false });

    render(
      <GrantExceptionDialog
        enrollmentId="enrollment1"
        learnerName="John Doe"
      />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByRole('button', { name: /grant exception/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
    });

    // Try to submit without reason
    const grantButton = screen.getAllByRole('button', { name: /grant exception/i })[1];
    await user.click(grantButton);

    // Should show validation error toast
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('should submit with correct payload', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (useGrantException as any).mockReturnValue({ mutateAsync, isPending: false });

    render(
      <GrantExceptionDialog
        enrollmentId="enrollment1"
        learnerName="John Doe"
      />,
      { wrapper: createWrapper() }
    );

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /grant exception/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/content id/i)).toBeInTheDocument();
    });

    // Fill in required fields using fireEvent for reliability in dialogs
    fireEvent.change(screen.getByLabelText(/content id/i), { target: { value: 'content123' } });
    fireEvent.change(screen.getByLabelText(/additional attempts/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: 'Student was sick' } });

    // Click submit - find the button inside the dialog footer
    const buttons = screen.getAllByRole('button', { name: /grant exception/i });
    const submitButton = buttons[buttons.length - 1];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          enrollmentId: 'enrollment1',
          type: 'extra_attempts',
          reason: 'Student was sick',
        })
      );
    });
  });
});
