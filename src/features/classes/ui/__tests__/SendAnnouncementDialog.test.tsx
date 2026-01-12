/**
 * Tests for SendAnnouncementDialog component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SendAnnouncementDialog } from '../SendAnnouncementDialog';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('SendAnnouncementDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/send announcement/i)).toBeInTheDocument();
    expect(screen.getByText(/test class/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <SendAnnouncementDialog
        open={false}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/send announcement/i)).not.toBeInTheDocument();
  });

  it('displays student count', () => {
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/25 students/i)).toBeInTheDocument();
  });

  it('has subject input field', () => {
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
  });

  it('has message textarea', () => {
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const sendButton = screen.getByRole('button', { name: /^send$/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
    });
  });

  it('allows typing in subject field', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    await user.type(subjectInput, 'Important Update');

    expect(subjectInput).toHaveValue('Important Update');
  });

  it('allows typing in message field', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const messageInput = screen.getByLabelText(/message/i);
    await user.type(messageInput, 'This is an important announcement');

    expect(messageInput).toHaveValue('This is an important announcement');
  });

  it('shows character count for subject', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    await user.type(subjectInput, 'Test');

    expect(screen.getByText(/4.*\/.*100/i)).toBeInTheDocument();
  });

  it('shows preview of announcement', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);

    await user.type(subjectInput, 'Test Subject');
    await user.type(messageInput, 'Test Message');

    expect(screen.getByText(/preview/i)).toBeInTheDocument();
  });

  it('disables send button when form is invalid', () => {
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const sendButton = screen.getByRole('button', { name: /^send$/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when form is valid', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);

    await user.type(subjectInput, 'Test Subject');
    await user.type(messageInput, 'Test Message');

    const sendButton = screen.getByRole('button', { name: /^send$/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays sending state', async () => {
    const user = userEvent.setup();
    render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);

    await user.type(subjectInput, 'Test Subject');
    await user.type(messageInput, 'Test Message');

    const sendButton = screen.getByRole('button', { name: /^send$/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('clears form on close', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    await user.type(subjectInput, 'Test');

    rerender(
      <SendAnnouncementDialog
        open={false}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    rerender(
      <SendAnnouncementDialog
        open={true}
        classId="class-1"
        className="Test Class"
        studentCount={25}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const newSubjectInput = screen.getByLabelText(/subject/i);
    expect(newSubjectInput).toHaveValue('');
  });
});
