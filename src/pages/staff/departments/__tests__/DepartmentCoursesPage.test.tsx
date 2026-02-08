/**
 * Tests for DepartmentCoursesPage
 * Tests the department-scoped course management page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderWithProviders } from '@/test/utils';
import { DepartmentCoursesPage } from '../DepartmentCoursesPage';
import { mockCourseListItems } from '@/test/mocks/data/courses';

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

// Mock the useDepartmentContext hook directly
vi.mock('@/shared/hooks', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/hooks')>();
  return {
    ...original,
    useDepartmentContext: () => ({
      currentDepartmentId: 'dept-1',
      currentDepartmentRoles: ['instructor'],
      currentDepartmentAccessRights: ['content:courses:read', 'content:courses:manage'],
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

describe('DepartmentCoursesPage', () => {
  beforeEach(() => {
    // Setup default API handlers
    server.use(
      // Department endpoint - return wrapped in data property
      http.get(`${env.apiBaseUrl}/api/v2/departments/:deptId`, ({ params }) => {
        if (params.deptId === 'dept-1') {
          return HttpResponse.json({ data: mockDepartment });
        }
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }),
      // Courses list endpoint
      http.get(`${env.apiBaseUrl}/api/v2/courses`, () => {
        return HttpResponse.json({
          data: {
            courses: mockCourseListItems.slice(0, 3),
            pagination: {
              page: 1,
              limit: 12,
              total: 3,
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
    renderWithProviders(<DepartmentCoursesPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/courses'],
        routePath: '/staff/departments/:deptId/courses',
      },
    });

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Computer Science Courses/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('displays breadcrumb with Dashboard link', async () => {
    renderWithProviders(<DepartmentCoursesPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/courses'],
        routePath: '/staff/departments/:deptId/courses',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
