import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubdepartmentList } from '../SubdepartmentList';
import { createTestWrapper } from '@/test/utils/testWrapper';

// Mock the department entity hooks
vi.mock('@/entities/department', async () => {
  const actual = await vi.importActual('@/entities/department');
  return {
    ...actual,
    useDepartments: vi.fn(),
    useDeleteDepartment: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    })),
    DepartmentForm: vi.fn(({ onCancel }) => (
      <div data-testid="department-form">
        <button onClick={onCancel}>Cancel</button>
      </div>
    )),
  };
});

vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const { useDepartments } = await import('@/entities/department');
const mockUseDepartments = vi.mocked(useDepartments);

const mockSubdepartments = [
  {
    id: 'sub-1',
    name: 'Computer Science',
    code: 'CS',
    description: 'CS Department',
    parentId: 'dept-1',
    status: 'active' as const,
    level: 1,
    hasChildren: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    metadata: { totalStaff: 5, totalPrograms: 2, totalCourses: 10 },
  },
  {
    id: 'sub-2',
    name: 'Information Technology',
    code: 'IT',
    description: null,
    parentId: 'dept-1',
    status: 'inactive' as const,
    level: 1,
    hasChildren: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    metadata: { totalStaff: 3, totalPrograms: 1, totalCourses: 5 },
  },
];

describe('SubdepartmentList', () => {
  const defaultProps = {
    parentId: 'dept-1',
    parentName: 'Engineering',
    availableParents: [{ id: 'root-1', name: 'Root', code: 'ROOT' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseDepartments.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<SubdepartmentList {...defaultProps} />, { wrapper: createTestWrapper() });
    expect(screen.getByText(/loading subdepartments/i)).toBeInTheDocument();
  });

  it('renders empty state when no subdepartments', () => {
    mockUseDepartments.mockReturnValue({
      data: { departments: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
    } as any);

    render(<SubdepartmentList {...defaultProps} />, { wrapper: createTestWrapper() });
    expect(screen.getByText(/no subdepartments under engineering/i)).toBeInTheDocument();
  });

  it('renders subdepartment list', () => {
    mockUseDepartments.mockReturnValue({
      data: { departments: mockSubdepartments, pagination: { page: 1, limit: 100, total: 2, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
    } as any);

    render(<SubdepartmentList {...defaultProps} />, { wrapper: createTestWrapper() });
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Information Technology')).toBeInTheDocument();
    expect(screen.getByText('CS')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText(/2 subdepartment/)).toBeInTheDocument();
  });

  it('renders status badges', () => {
    mockUseDepartments.mockReturnValue({
      data: { departments: mockSubdepartments, pagination: { page: 1, limit: 100, total: 2, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
    } as any);

    render(<SubdepartmentList {...defaultProps} />, { wrapper: createTestWrapper() });
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('shows create subdepartment button', () => {
    mockUseDepartments.mockReturnValue({
      data: { departments: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
    } as any);

    render(<SubdepartmentList {...defaultProps} />, { wrapper: createTestWrapper() });
    expect(screen.getByRole('button', { name: /create subdepartment/i })).toBeInTheDocument();
  });

  it('opens create dialog when clicking create button', async () => {
    const user = userEvent.setup();
    mockUseDepartments.mockReturnValue({
      data: { departments: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
    } as any);

    render(<SubdepartmentList {...defaultProps} />, { wrapper: createTestWrapper() });
    await user.click(screen.getByRole('button', { name: /create subdepartment/i }));
    expect(screen.getByText(/create a new subdepartment under engineering/i)).toBeInTheDocument();
  });

  it('fetches departments filtered by parentId', () => {
    mockUseDepartments.mockReturnValue({
      data: { departments: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
    } as any);

    render(<SubdepartmentList {...defaultProps} />, { wrapper: createTestWrapper() });
    expect(mockUseDepartments).toHaveBeenCalledWith({ parentId: 'dept-1', limit: 100 });
  });
});
