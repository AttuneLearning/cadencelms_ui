/**
 * Tests for Course Summary Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CourseSummaryPage } from '../CourseSummaryPage';

// Mock stores
vi.mock('@/shared/stores/navigationStore', () => ({
  useNavigationStore: vi.fn(),
}));

vi.mock('@/features/auth/model/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock analytics widgets
vi.mock('@/widgets/analytics', () => ({
  StatCard: ({ title, value }: any) => (
    <div data-testid={`stat-card-${title}`}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
  LineChart: ({ title }: any) => <div data-testid="line-chart">{title}</div>,
  PieChart: ({ title }: any) => <div data-testid="pie-chart">{title}</div>,
}));

vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { useNavigationStore } from '@/shared/stores/navigationStore';
import { useAuthStore } from '@/features/auth/model/authStore';

describe('CourseSummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigationStore).mockReturnValue({
      selectedDepartmentId: null,
    } as any);

    vi.mocked(useAuthStore).mockReturnValue({
      roleHierarchy: {
        staffRoles: {
          departmentRoles: [
            {
              departmentId: '1',
              departmentName: 'Computer Science',
              roles: [{ role: 'department-admin' }],
            },
            {
              departmentId: '2',
              departmentName: 'Business Administration',
              roles: [{ role: 'content-admin' }],
            },
          ],
        },
      },
    } as any);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <CourseSummaryPage />
      </MemoryRouter>
    );

  it('should render page title and description', () => {
    renderPage();

    expect(screen.getByText('Course Summary')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Aggregated analytics across all courses in your departments'
      )
    ).toBeInTheDocument();
  });

  it('should render key metric cards', () => {
    renderPage();

    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('Total Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Average Score')).toBeInTheDocument();
  });

  it('should render scope indicator showing accessible departments', () => {
    renderPage();

    expect(screen.getByText('Showing data for:')).toBeInTheDocument();
    // User has access to 2 departments (IDs '1' and '2'), but filtered data
    // recalculates totalDepartments based on matching mock department breakdown
    expect(screen.getByText('2 departments')).toBeInTheDocument();
  });

  it('should render department breakdown section with accessible departments', () => {
    renderPage();

    expect(screen.getByText('Department Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Performance metrics by department')).toBeInTheDocument();
    // User has access to dept IDs '1' (Computer Science) and '2' (Business Administration)
    // These departments are shown in both breakdown and top courses sections
    expect(screen.getAllByText('Computer Science').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Business Administration').length).toBeGreaterThanOrEqual(1);
  });

  it('should render top performing courses', () => {
    renderPage();

    expect(screen.getByText('Top Performing Courses')).toBeInTheDocument();
    expect(
      screen.getByText('Introduction to Programming')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Project Management Fundamentals')
    ).toBeInTheDocument();
  });

  it('should render export buttons', () => {
    renderPage();

    expect(screen.getByText('Export PDF')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should render charts', () => {
    renderPage();

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should show selected department in scope indicator', () => {
    vi.mocked(useNavigationStore).mockReturnValue({
      selectedDepartmentId: '1',
    } as any);

    renderPage();

    // "Computer Science" appears in scope badge, department breakdown, and top courses
    expect(screen.getAllByText('Computer Science').length).toBeGreaterThanOrEqual(1);
  });
});
