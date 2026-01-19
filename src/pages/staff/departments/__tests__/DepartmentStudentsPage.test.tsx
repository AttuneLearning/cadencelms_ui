/**
 * Tests for DepartmentStudentsPage
 * Tests the department-scoped student/enrollment management page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderWithProviders } from '@/test/utils';
import { DepartmentStudentsPage } from '../DepartmentStudentsPage';

// Mock department data matching DepartmentDetails type
const mockDepartment = {
  id: 'dept-1',
  name: 'Computer Science',
  code: 'CS',
  description: 'Computer Science Department',
  parentId: null,
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock enrollments
const mockEnrollments = [
  {
    id: 'enr-1',
    type: 'course',
    learner: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    target: {
      id: 'course-1',
      name: 'Introduction to Programming',
      code: 'CS101',
      type: 'course',
    },
    status: 'active',
    enrolledAt: '2024-01-15T00:00:00Z',
    completedAt: null,
    withdrawnAt: null,
    expiresAt: '2024-12-31T00:00:00Z',
    progress: {
      percentage: 45,
      completedItems: 9,
      totalItems: 20,
      lastActivityAt: '2024-02-01T10:30:00Z',
    },
    grade: {
      score: null,
      letter: null,
      passed: null,
    },
    department: {
      id: 'dept-1',
      name: 'Computer Science',
      code: 'CS',
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

// Mock the useDepartmentContext hook
vi.mock('@/shared/hooks', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/hooks')>();
  return {
    ...original,
    useDepartmentContext: () => ({
      currentDepartmentId: 'dept-1',
      currentDepartmentRoles: ['admin'],
      currentDepartmentAccessRights: ['enrollment:view-department', 'enrollment:manage-department', 'enrollment:export-department'],
      currentDepartmentName: 'Computer Science',
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      hasRole: () => true,
      switchDepartment: vi.fn().mockResolvedValue(undefined),
      isSwitching: false,
      switchError: null,
    }),
  };
});

describe('DepartmentStudentsPage', () => {
  beforeEach(() => {
    // Setup default API handlers
    server.use(
      // Department endpoint
      http.get(`${env.apiBaseUrl}/api/v2/departments/:deptId`, ({ params }) => {
        if (params.deptId === 'dept-1') {
          return HttpResponse.json({ data: mockDepartment });
        }
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }),
      // Enrollments endpoint
      http.get(`${env.apiBaseUrl}/api/v2/enrollments`, () => {
        return HttpResponse.json({
          data: {
            enrollments: mockEnrollments,
            pagination: {
              page: 1,
              limit: 12,
              total: 1,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      })
    );
  });

  it('renders the page and shows loading then content', async () => {
    renderWithProviders(<DepartmentStudentsPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/students'],
        routePath: '/staff/departments/:deptId/students',
      },
    });

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Computer Science Students/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('displays breadcrumb with Dashboard link', async () => {
    renderWithProviders(<DepartmentStudentsPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/students'],
        routePath: '/staff/departments/:deptId/students',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
