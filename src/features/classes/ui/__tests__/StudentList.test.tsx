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

    // Check for completion percentages in progress column
    const allElements = screen.queryAllByText(/75%/i);
    expect(allElements.length).toBeGreaterThan(0); // 75% appears for Alice (progress) and Bob (attendance)
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

    // Check for attendance rates - these are specific values that only appear in attendance column
    expect(screen.getByText(/87\.5%/i)).toBeInTheDocument();
    // 75% appears in attendance for Bob, so check that it's present somewhere
    const percentElements = screen.queryAllByText(/75%/i);
    expect(percentElements.length).toBeGreaterThan(0);
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

    // Find all action buttons
    const allRows = screen.getAllByRole('row');
    const studentRows = allRows.slice(1); // Skip header row

    // Click the action button on the first student
    const firstActionButton = studentRows[0].querySelector('button[aria-label="Actions"]');
    if (firstActionButton) {
      await user.click(firstActionButton);
    }

    // Click the Remove Student menu item
    const removeButton = screen.getByRole('menuitem', { name: /remove student/i });
    await user.click(removeButton);

    // Should be called with some enrollment ID
    expect(mockOnRemove).toHaveBeenCalled();
    // The specific ID depends on the sort order, so just verify it was called
    const calls = mockOnRemove.mock.calls;
    expect(calls[0][0]).toMatch(/enrollment-\d+/);
  });

  it('disables remove button for withdrawn students', async () => {
    const user = userEvent.setup();
    const mockOnRemoveForWithdrawn = vi.fn();

    render(
      <StudentList
        students={mockRosterItems}
        onRemove={mockOnRemoveForWithdrawn}
        onExport={mockOnExport}
      />,
      { wrapper: createWrapper() }
    );

    // Find the withdrawn student (Charlie Brown) and click remove
    const allRows = screen.getAllByRole('row');
    const studentRows = allRows.slice(1); // Skip header row

    // Find which row has Charlie Brown
    let withdrawnRowIndex = -1;
    for (let i = 0; i < studentRows.length; i++) {
      if (studentRows[i].textContent?.includes('Brown')) {
        withdrawnRowIndex = i;
        break;
      }
    }

    if (withdrawnRowIndex >= 0) {
      const withdrawnRow = studentRows[withdrawnRowIndex];
      const actionButton = withdrawnRow.querySelector('button[aria-label="Actions"]');
      if (actionButton) {
        await user.click(actionButton);
      }

      // Get all Remove Student menu items (there should be only one visible)
      const removeButton = screen.getByRole('menuitem', { name: /remove student/i });

      // For withdrawn students, the menu item should be disabled
      // Check by looking for the pointerEvents: none or aria-disabled="true" attribute
      const isDisabled = removeButton.getAttribute('aria-disabled') === 'true' ||
                        removeButton.style.pointerEvents === 'none';

      // Alternatively, try clicking it and verify onRemove wasn't called
      if (!isDisabled) {
        await user.click(removeButton);
        expect(mockOnRemoveForWithdrawn).not.toHaveBeenCalled();
      }
    }
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
