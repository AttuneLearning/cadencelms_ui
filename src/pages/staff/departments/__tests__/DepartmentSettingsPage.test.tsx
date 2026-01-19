/**
 * Tests for DepartmentSettingsPage
 * Tests the department-scoped settings page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderWithProviders } from '@/test/utils';
import { DepartmentSettingsPage } from '../DepartmentSettingsPage';

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

// Mock the useDepartmentContext hook
vi.mock('@/shared/hooks', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/hooks')>();
  return {
    ...original,
    useDepartmentContext: () => ({
      currentDepartmentId: 'dept-1',
      currentDepartmentRoles: ['admin'],
      currentDepartmentAccessRights: ['settings:view-department', 'settings:manage-department'],
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

describe('DepartmentSettingsPage', () => {
  beforeEach(() => {
    // Setup default API handlers
    server.use(
      // Department endpoint
      http.get(`${env.apiBaseUrl}/api/v2/departments/:deptId`, ({ params }) => {
        if (params.deptId === 'dept-1') {
          return HttpResponse.json({ data: mockDepartment });
        }
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );
  });

  it('renders the page and shows loading then content', async () => {
    renderWithProviders(<DepartmentSettingsPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/settings'],
        routePath: '/staff/departments/:deptId/settings',
      },
    });

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Computer Science Settings/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('displays General settings tab by default', async () => {
    renderWithProviders(<DepartmentSettingsPage />, {
      wrapperOptions: {
        initialEntries: ['/staff/departments/dept-1/settings'],
        routePath: '/staff/departments/:deptId/settings',
      },
    });

    await waitFor(() => {
      // General tab should be visible
      expect(screen.getByRole('tab', { name: /General/i })).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
