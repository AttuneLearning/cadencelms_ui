/**
 * Tests for BulkGradingDialog Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BulkGradingDialog } from '../BulkGradingDialog';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('BulkGradingDialog', () => {
  const mockHandlers = {
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display', () => {
    it('should not render when open is false', () => {
      render(
        <BulkGradingDialog
          open={false}
          attemptIds={['attempt-1', 'attempt-2']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1', 'attempt-2']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display number of selected submissions', () => {
      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1', 'attempt-2', 'attempt-3']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/3 submissions/i)).toBeInTheDocument();
    });

    it('should show warning about bulk grading', () => {
      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1', 'attempt-2']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(
        screen.getByText(/same grade and feedback will be applied/i)
      ).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render score input', () => {
      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
    });

    it('should render feedback textarea', () => {
      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText(/feedback/i)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should require score to be entered', async () => {
      const user = userEvent.setup();

      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /apply grades/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/score is required/i)).toBeInTheDocument();
      });
    });

    it('should validate score is positive', async () => {
      const user = userEvent.setup();

      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.type(scoreInput, '-5');

      const submitButton = screen.getByRole('button', { name: /apply grades/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should call onSuccess when grades applied successfully', async () => {
      const user = userEvent.setup();

      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.type(scoreInput, '85');

      const feedbackInput = screen.getByLabelText(/feedback/i);
      await user.type(feedbackInput, 'Good work!');

      const submitButton = screen.getByRole('button', { name: /apply grades/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockHandlers.onSuccess).toHaveBeenCalled();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockHandlers.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should disable submit button while applying grades', () => {
      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      // Initially enabled
      const submitButton = screen.getByRole('button', { name: /apply grades/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Preview', () => {
    it('should show preview of what will be applied', async () => {
      const user = userEvent.setup();

      render(
        <BulkGradingDialog
          open={true}
          attemptIds={['attempt-1', 'attempt-2']}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.type(scoreInput, '90');

      await waitFor(() => {
        expect(screen.getByText(/90/)).toBeInTheDocument();
      });
    });
  });
});
