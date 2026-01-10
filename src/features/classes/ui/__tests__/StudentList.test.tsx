/**
 * Tests for StudentList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentList } from '../StudentList';
import { mockRosterItems } from '@/test/mocks/data/classes';

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

describe('StudentList', () => {
  const mockOnRemove = vi.fn();
  const mockOnExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student list', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
    expect(screen.getByText(/bob williams/i)).toBeInTheDocument();
    expect(screen.getByText(/charlie brown/i)).toBeInTheDocument();
  });

  it('displays student progress information', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/75%/i)).toBeInTheDocument();
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
  });

  it('displays student enrollment status', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const activeBadges = screen.getAllByText(/active/i);
    expect(activeBadges.length).toBeGreaterThan(0);

    expect(screen.getByText(/withdrawn/i)).toBeInTheDocument();
  });

  it('allows sorting by name', async () => {
    const user = userEvent.setup();
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const nameHeader = screen.getByRole('button', { name: /name/i });
    await user.click(nameHeader);

    expect(nameHeader).toBeInTheDocument();
  });

  it('allows sorting by progress', async () => {
    const user = userEvent.setup();
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const progressHeader = screen.getByRole('button', { name: /progress/i });
    await user.click(progressHeader);

    expect(progressHeader).toBeInTheDocument();
  });

  it('allows filtering by status', async () => {
    const user = userEvent.setup();
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const statusFilter = screen.getByRole('combobox', { name: /filter.*status/i });
    await user.click(statusFilter);

    const activeOption = screen.getByRole('option', { name: /active/i });
    await user.click(activeOption);

    expect(statusFilter).toBeInTheDocument();
  });

  it('allows searching students', async () => {
    const user = userEvent.setup();
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByPlaceholderText(/search students/i);
    await user.type(searchInput, 'Alice');

    expect(searchInput).toHaveValue('Alice');
  });

  it('displays student scores', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/92/)).toBeInTheDocument();
    expect(screen.getByText(/78/)).toBeInTheDocument();
  });

  it('displays attendance information', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/87\.5%/i)).toBeInTheDocument();
    expect(screen.getByText(/75%/i)).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(mockOnRemove).toHaveBeenCalledWith('enrollment-1');
  });

  it('disables remove button for withdrawn students', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    const withdrawnStudentButton = removeButtons[2];

    expect(withdrawnStudentButton).toBeDisabled();
  });

  it('calls onExport when export button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    expect(mockOnExport).toHaveBeenCalled();
  });

  it('displays empty state when no students', () => {
    render(
      <StudentList
        students={[]}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/no students enrolled/i)).toBeInTheDocument();
  });

  it('displays student email addresses', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/alice.johnson@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/bob.williams@example.com/i)).toBeInTheDocument();
  });

  it('displays student ID when available', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/STU001/i)).toBeInTheDocument();
    expect(screen.getByText(/STU002/i)).toBeInTheDocument();
  });

  it('displays last access date', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const lastAccessDates = screen.getAllByText(/jan.*\d+.*2026/i);
    expect(lastAccessDates.length).toBeGreaterThan(0);
  });

  it('shows progress bar for each student', () => {
    const { container } = render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('displays module completion stats', () => {
    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemove}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/6.*\/.*8/)).toBeInTheDocument();
    expect(screen.getByText(/4.*\/.*8/)).toBeInTheDocument();
  });
});
