/**
 * Tests for DepartmentReportsPage
 * Tests the department-scoped reports page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderWithProviders } from '@/test/utils';
import { DepartmentReportsPage } from '../DepartmentReportsPage';

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

// Mock report jobs
const mockReportJobs = [
  {
    _id: 'job-1',
    organizationId: 'org-1',
    reportType: 'enrollment',
    name: 'Enrollment Summary Report',
    state: 'ready',
    priority: 'normal',
    createdAt: '2024-02-01T00:00:00Z',
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
      currentDepartmentAccessRights: ['report:view-department', 'report:create-department', 'report:export-department'],
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

describe('DepartmentReportsPage', () => {
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
      // Report jobs endpoint
      http.get(`${env.apiBaseUrl}/api/v2/reports/jobs`, () => {
        return HttpResponse.json({
          data: {
            jobs: mockReportJobs,
            pagination: {
              page: 1,
              limit: 10,
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
    renderWithProviders(<DepartmentReportsPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/reports'],
        routePath: '/staff/departments/:deptId/reports',
      },
    });

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Computer Science Reports/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('displays Quick Reports tab by default', async () => {
    renderWithProviders(<DepartmentReportsPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/reports'],
        routePath: '/staff/departments/:deptId/reports',
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Quick Reports/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
