/**
 * Tests for DepartmentCreateCoursePage
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DepartmentCreateCoursePage } from '../DepartmentCreateCoursePage';

// Mock CourseEditorPage
vi.mock('@/pages/staff/courses/CourseEditorPage', () => ({
  CourseEditorPage: ({ defaultDepartmentId }: { defaultDepartmentId?: string }) => (
    <div data-testid="course-editor-page">
      CourseEditorPage
      {defaultDepartmentId && <span data-testid="default-dept-id">{defaultDepartmentId}</span>}
    </div>
  ),
}));

const mockSwitchDepartment = vi.fn().mockResolvedValue(undefined);

// Mock the useDepartmentContext hook
vi.mock('@/shared/hooks', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/hooks')>();
  return {
    ...original,
    useDepartmentContext: () => ({
      currentDepartmentId: 'dept-123',
      currentDepartmentRoles: ['instructor'],
      currentDepartmentAccessRights: ['course:create-department'],
      currentDepartmentName: 'Computer Science',
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      hasRole: () => true,
      switchDepartment: mockSwitchDepartment,
      isSwitching: false,
      switchError: null,
    }),
  };
});

describe('DepartmentCreateCoursePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<DepartmentCreateCoursePage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-123/courses/create'],
        routePath: '/staff/departments/:deptId/courses/create',
      },
    });

    expect(screen.getByTestId('course-editor-page')).toBeInTheDocument();
  });

  it('passes department ID from URL to CourseEditorPage', () => {
    renderWithProviders(<DepartmentCreateCoursePage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-456/courses/create'],
        routePath: '/staff/departments/:deptId/courses/create',
      },
    });

    const deptIdElement = screen.queryByTestId('default-dept-id');
    expect(deptIdElement).toBeInTheDocument();
    expect(deptIdElement).toHaveTextContent('dept-456');
  });

  it('renders CourseEditorPage with department pre-filled', () => {
    renderWithProviders(<DepartmentCreateCoursePage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-789/courses/create'],
        routePath: '/staff/departments/:deptId/courses/create',
      },
    });

    expect(screen.getByTestId('course-editor-page')).toBeInTheDocument();
    const deptIdElement = screen.queryByTestId('default-dept-id');
    expect(deptIdElement).toHaveTextContent('dept-789');
  });
});
