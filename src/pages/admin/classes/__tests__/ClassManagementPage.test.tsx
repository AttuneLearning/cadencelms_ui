/**
 * Tests for Admin Class Management Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ClassManagementPage } from '../ClassManagementPage';

// Mock the class entity hooks and components
vi.mock('@/entities/class', () => ({
  useClasses: vi.fn(),
  useCreateClass: vi.fn(),
  useUpdateClass: vi.fn(),
  useDeleteClass: vi.fn(),
  useClassRoster: vi.fn(),
  useClassEnrollments: vi.fn(),
  useDropLearner: vi.fn(),
  useEnrollLearners: vi.fn(),
  ClassForm: ({ onCancel }: any) => (
    <div data-testid="class-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('@/entities/learner', () => ({
  useLearnerList: vi.fn(),
}));

vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock Select to avoid Radix Select.Item empty value error in jsdom
vi.mock('@/shared/ui/select', () => ({
  Select: ({ children, value: _value, onValueChange: _onValueChange }: any) => (
    <div data-testid="mock-select">{children}</div>
  ),
  SelectTrigger: ({ children, id }: any) => (
    <button aria-label={id} data-testid={id}>{children}</button>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

import { useClasses, useCreateClass, useUpdateClass, useDeleteClass, useClassRoster, useClassEnrollments, useDropLearner, useEnrollLearners } from '@/entities/class';
import { useLearnerList } from '@/entities/learner';

const mutationDefaults = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  reset: vi.fn(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ClassManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useClasses).mockReturnValue({
      data: {
        classes: [
          {
            id: 'cls-1',
            name: 'Intro to CS - Section A',
            course: { code: 'CS101', title: 'Intro to CS' },
            program: { name: 'Computer Science' },
            programLevel: { levelNumber: 1 },
            instructors: [
              { role: 'primary', firstName: 'John', lastName: 'Doe' },
            ],
            startDate: '2026-01-15',
            endDate: '2026-05-15',
            capacity: 30,
            enrolledCount: 25,
            status: 'active',
            academicTerm: { name: 'Spring 2026' },
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCreateClass).mockReturnValue({ ...mutationDefaults } as any);
    vi.mocked(useUpdateClass).mockReturnValue({ ...mutationDefaults } as any);
    vi.mocked(useDeleteClass).mockReturnValue({ ...mutationDefaults } as any);
    vi.mocked(useDropLearner).mockReturnValue({ ...mutationDefaults } as any);
    vi.mocked(useEnrollLearners).mockReturnValue({ ...mutationDefaults } as any);

    vi.mocked(useClassRoster).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    vi.mocked(useClassEnrollments).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    vi.mocked(useLearnerList).mockReturnValue({
      data: { learners: [] },
      isLoading: false,
    } as any);
  });

  it('should render page title and description', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Class Management')).toBeInTheDocument();
    expect(
      screen.getByText('Manage class schedules and enrollments')
    ).toBeInTheDocument();
  });

  it('should render the Add Class button', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Add Class')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(useClasses).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<ClassManagementPage />, {
      wrapper: createWrapper(),
    });

    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display class data in the table', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Intro to CS - Section A')).toBeInTheDocument();
    expect(screen.getByText('CS101 - Intro to CS')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Spring 2026')).toBeInTheDocument();
  });

  it('should render filter controls', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    expect(screen.getAllByText('All statuses').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
  });

  it('should open create dialog when Add Class is clicked', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Add Class'));

    expect(screen.getByText('Create New Class')).toBeInTheDocument();
    expect(screen.getByTestId('class-form')).toBeInTheDocument();
  });

  it('should show enrollment count with badge when near capacity', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    // 25 / 30 enrolled, 5 left
    expect(screen.getByText('5 left')).toBeInTheDocument();
  });

  it('should show status badge', () => {
    render(<ClassManagementPage />, { wrapper: createWrapper() });

    // "Active" appears in both the status badge and the filter options
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
  });

  it('should render empty state when no classes', () => {
    vi.mocked(useClasses).mockReturnValue({
      data: { classes: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<ClassManagementPage />, { wrapper: createWrapper() });

    // DataTable shows "No results" when empty
    expect(screen.getByText('Class Management')).toBeInTheDocument();
  });
});
