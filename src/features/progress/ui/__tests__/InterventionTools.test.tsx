/**
 * Tests for InterventionTools Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InterventionTools } from '../InterventionTools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('InterventionTools', () => {
  describe('Rendering', () => {
    it('should render all intervention action buttons', () => {
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      expect(screen.getByRole('button', { name: /send reminder/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /extend deadline/i })).toBeInTheDocument();
    });

    it('should render component title', () => {
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      expect(screen.getByText(/intervention actions/i)).toBeInTheDocument();
    });
  });

  describe('Send Reminder', () => {
    it('should open message dialog when send reminder is clicked', async () => {
      const user = userEvent.setup();
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      const sendButton = screen.getByRole('button', { name: /send reminder/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should have message input field in dialog', async () => {
      const user = userEvent.setup();
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      const sendButton = screen.getByRole('button', { name: /send reminder/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });
    });

    it('should call onSendMessage when message is submitted', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();

      render(
        <InterventionTools studentId="1" enrollmentId="e1" onSendMessage={onSendMessage} />,
        { wrapper }
      );

      const sendButton = screen.getByRole('button', { name: /send reminder/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Please complete your coursework');

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSendMessage).toHaveBeenCalledWith('1', expect.stringContaining('Please complete'));
      });
    });
  });

  describe('Reset Quiz', () => {
    it('should open confirmation dialog when reset quiz is clicked', async () => {
      const user = userEvent.setup();
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      const resetButton = screen.getByRole('button', { name: /reset quiz/i });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it('should call onResetQuiz when confirmed', async () => {
      const user = userEvent.setup();
      const onResetQuiz = vi.fn();

      render(
        <InterventionTools studentId="1" enrollmentId="e1" onResetQuiz={onResetQuiz} />,
        { wrapper }
      );

      const resetButton = screen.getByRole('button', { name: /reset quiz/i });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onResetQuiz).toHaveBeenCalledWith('1');
      });
    });

    it('should close dialog when cancelled', async () => {
      const user = userEvent.setup();
      const onResetQuiz = vi.fn();

      render(
        <InterventionTools studentId="1" enrollmentId="e1" onResetQuiz={onResetQuiz} />,
        { wrapper }
      );

      const resetButton = screen.getByRole('button', { name: /reset quiz/i });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(onResetQuiz).not.toHaveBeenCalled();
    });
  });

  describe('Extend Deadline', () => {
    it('should open deadline extension dialog', async () => {
      const user = userEvent.setup();
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      const extendButton = screen.getByRole('button', { name: /extend deadline/i });
      await user.click(extendButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/days/i)).toBeInTheDocument();
      });
    });

    it('should allow selecting number of days to extend', async () => {
      const user = userEvent.setup();
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      const extendButton = screen.getByRole('button', { name: /extend deadline/i });
      await user.click(extendButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const daysInput = screen.getByLabelText(/days/i) as HTMLInputElement;
      await user.clear(daysInput);
      await user.type(daysInput, '14');

      expect(daysInput.value).toBe('14');
    });

    it('should call onExtendDeadline with correct days', async () => {
      const user = userEvent.setup();
      const onExtendDeadline = vi.fn();

      render(
        <InterventionTools studentId="1" enrollmentId="e1" onExtendDeadline={onExtendDeadline} />,
        { wrapper }
      );

      const extendButton = screen.getByRole('button', { name: /extend deadline/i });
      await user.click(extendButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const daysInput = screen.getByLabelText(/days/i);
      await user.clear(daysInput);
      await user.type(daysInput, '14');

      const submitButton = screen.getByRole('button', { name: /extend/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onExtendDeadline).toHaveBeenCalledWith('e1', 14);
      });
    });
  });

  describe('Manual Override', () => {
    it('should render manual completion override button', () => {
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument();
    });

    it('should open override dialog with reason field', async () => {
      const user = userEvent.setup();
      render(<InterventionTools studentId="1" enrollmentId="e1" />, { wrapper });

      const overrideButton = screen.getByRole('button', { name: /mark complete/i });
      await user.click(overrideButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });
    });

    it('should call onManualOverride with reason', async () => {
      const user = userEvent.setup();
      const onManualOverride = vi.fn();

      render(
        <InterventionTools studentId="1" enrollmentId="e1" onManualOverride={onManualOverride} />,
        { wrapper }
      );

      const overrideButton = screen.getByRole('button', { name: /mark complete/i });
      await user.click(overrideButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const reasonInput = screen.getByLabelText(/reason/i);
      await user.type(reasonInput, 'Student completed work offline');

      const submitButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onManualOverride).toHaveBeenCalledWith(
          'e1',
          expect.stringContaining('offline')
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should disable buttons when actions are in progress', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      render(
        <InterventionTools studentId="1" enrollmentId="e1" onSendMessage={onSendMessage} />,
        { wrapper }
      );

      const sendButton = screen.getByRole('button', { name: /send reminder/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      // Button should show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
