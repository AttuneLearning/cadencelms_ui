/**
 * ProtectedComponent Tests
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Comprehensive test suite for ProtectedComponent and convenience wrappers.
 * Target: >85% coverage
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ProtectedComponent,
  StaffOnly,
  LearnerOnly,
  AdminOnly,
} from '../ProtectedComponent';

// ============================================================================
// Mock Dependencies
// ============================================================================

// Mock useAuthStore
const mockAuthStore = {
  isAuthenticated: true,
  roleHierarchy: {
    allUserTypes: ['staff'],
    primaryUserType: 'staff',
    defaultDashboard: 'staff',
    globalRoles: [],
    allPermissions: [],
    userTypeDisplayMap: {},
    roleDisplayMap: {},
  },
  isLoading: false,
  isAdminSessionActive: false,
};

vi.mock('@/features/auth/model/authStore', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}));

// Mock useDepartmentContext
const mockDepartmentContext = {
  currentDepartmentId: 'dept-123',
  currentDepartmentRoles: ['instructor'],
  currentDepartmentAccessRights: ['content:courses:read', 'content:courses:manage'],
  currentDepartmentName: 'Test Department',
  hasPermission: vi.fn((perm: string) => {
    return mockDepartmentContext.currentDepartmentAccessRights.includes(perm);
  }),
  hasAnyPermission: vi.fn((perms: string[]) => {
    return perms.some((p) => mockDepartmentContext.currentDepartmentAccessRights.includes(p));
  }),
  hasAllPermissions: vi.fn((perms: string[]) => {
    return perms.every((p) => mockDepartmentContext.currentDepartmentAccessRights.includes(p));
  }),
  hasRole: vi.fn(),
  switchDepartment: vi.fn(),
  isSwitching: false,
  switchError: null,
};

vi.mock('@/shared/hooks/useDepartmentContext', () => ({
  useDepartmentContext: vi.fn(() => mockDepartmentContext),
}));

// Import mocked hooks for type safety
import { useAuthStore } from '@/features/auth/model/authStore';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Reset all mocks to default state
 */
function resetMocks() {
  // Reset auth store
  mockAuthStore.isAuthenticated = true;
  mockAuthStore.roleHierarchy = {
    allUserTypes: ['staff'],
    primaryUserType: 'staff',
    defaultDashboard: 'staff',
    globalRoles: [],
    allPermissions: [],
    userTypeDisplayMap: {},
    roleDisplayMap: {},
  };
  mockAuthStore.isLoading = false;
  mockAuthStore.isAdminSessionActive = false;

  // Reset department context
  mockDepartmentContext.currentDepartmentId = 'dept-123';
  mockDepartmentContext.currentDepartmentRoles = ['instructor'];
  mockDepartmentContext.currentDepartmentAccessRights = [
    'content:courses:read',
    'content:courses:manage',
  ];
  mockDepartmentContext.isSwitching = false;

  // Reset mock functions
  vi.clearAllMocks();
}

// ============================================================================
// Test Suite: Basic Rendering
// ============================================================================

describe('ProtectedComponent - Basic Rendering', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user is authenticated with no restrictions', () => {
    render(
      <ProtectedComponent>
        <div>Protected Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when user is not authenticated', () => {
    mockAuthStore.isAuthenticated = false;

    render(
      <ProtectedComponent>
        <div>Protected Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render children when roleHierarchy is null', () => {
    mockAuthStore.roleHierarchy = null;

    render(
      <ProtectedComponent>
        <div>Protected Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render fallback when user lacks access', () => {
    mockAuthStore.isAuthenticated = false;

    render(
      <ProtectedComponent fallback={<div>Access Denied</div>}>
        <div>Protected Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render null fallback by default', () => {
    mockAuthStore.isAuthenticated = false;

    const { container } = render(
      <ProtectedComponent>
        <div>Protected Content</div>
      </ProtectedComponent>
    );

    expect(container.textContent).toBe('');
  });
});

// ============================================================================
// Test Suite: Permission Checking (Single Permission)
// ============================================================================

describe('ProtectedComponent - Single Permission', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user has required permission', () => {
    render(
      <ProtectedComponent requiredRights="content:courses:read">
        <div>Course Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Course Content')).toBeInTheDocument();
    // Note: With requireAll=true (default), it calls hasAllPermissions instead
    expect(mockDepartmentContext.hasAllPermissions).toHaveBeenCalledWith([
      'content:courses:read',
    ]);
  });

  it('should not render children when user lacks required permission', () => {
    render(
      <ProtectedComponent requiredRights="billing:invoices:read">
        <div>Billing Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Billing Content')).not.toBeInTheDocument();
  });

  it('should handle permission as string', () => {
    render(
      <ProtectedComponent requiredRights="content:courses:manage">
        <div>Manage Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Manage Content')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Multiple Permissions (AND Logic)
// ============================================================================

describe('ProtectedComponent - Multiple Permissions (AND)', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user has ALL required permissions', () => {
    render(
      <ProtectedComponent
        requiredRights={['content:courses:read', 'content:courses:manage']}
        requireAll={true}
      >
        <div>Advanced Settings</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    expect(mockDepartmentContext.hasAllPermissions).toHaveBeenCalledWith([
      'content:courses:read',
      'content:courses:manage',
    ]);
  });

  it('should not render children when user lacks one required permission', () => {
    render(
      <ProtectedComponent
        requiredRights={['content:courses:read', 'billing:invoices:read']}
        requireAll={true}
      >
        <div>Advanced Settings</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Advanced Settings')).not.toBeInTheDocument();
  });

  it('should default to requireAll=true', () => {
    render(
      <ProtectedComponent requiredRights={['content:courses:read', 'content:courses:manage']}>
        <div>Default AND Logic</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Default AND Logic')).toBeInTheDocument();
    expect(mockDepartmentContext.hasAllPermissions).toHaveBeenCalled();
  });
});

// ============================================================================
// Test Suite: Multiple Permissions (OR Logic)
// ============================================================================

describe('ProtectedComponent - Multiple Permissions (OR)', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user has ANY required permission', () => {
    render(
      <ProtectedComponent
        requiredRights={['content:courses:manage', 'billing:invoices:read']}
        requireAll={false}
      >
        <div>OR Logic Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('OR Logic Content')).toBeInTheDocument();
    expect(mockDepartmentContext.hasAnyPermission).toHaveBeenCalledWith([
      'content:courses:manage',
      'billing:invoices:read',
    ]);
  });

  it('should not render children when user lacks all permissions', () => {
    render(
      <ProtectedComponent
        requiredRights={['billing:invoices:read', 'system:admin']}
        requireAll={false}
      >
        <div>OR Logic Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('OR Logic Content')).not.toBeInTheDocument();
  });

  it('should handle single permission in array with OR logic', () => {
    render(
      <ProtectedComponent requiredRights={['content:courses:read']} requireAll={false}>
        <div>Single OR Permission</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Single OR Permission')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: User Type Restrictions
// ============================================================================

describe('ProtectedComponent - User Type Restrictions', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user has allowed user type', () => {
    render(
      <ProtectedComponent allowedUserTypes={['staff']}>
        <div>Staff Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Staff Content')).toBeInTheDocument();
  });

  it('should not render children when user lacks allowed user type', () => {
    render(
      <ProtectedComponent allowedUserTypes={['learner']}>
        <div>Learner Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Learner Content')).not.toBeInTheDocument();
  });

  it('should render children when user has one of multiple allowed user types', () => {
    render(
      <ProtectedComponent allowedUserTypes={['staff', 'global-admin']}>
        <div>Multi-Type Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Multi-Type Content')).toBeInTheDocument();
  });

  it('should work with user having multiple user types', () => {
    mockAuthStore.roleHierarchy!.allUserTypes = ['staff', 'learner'];

    render(
      <ProtectedComponent allowedUserTypes={['learner']}>
        <div>Learner Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Learner Content')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Department Context Requirement
// ============================================================================

describe('ProtectedComponent - Department Context', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when department context is required and available', () => {
    render(
      <ProtectedComponent requireDepartmentContext={true}>
        <div>Department Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Department Content')).toBeInTheDocument();
  });

  it('should not render children when department context is required but not available', () => {
    mockDepartmentContext.currentDepartmentId = null;

    render(
      <ProtectedComponent requireDepartmentContext={true}>
        <div>Department Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Department Content')).not.toBeInTheDocument();
  });

  it('should work without department context when not required', () => {
    mockDepartmentContext.currentDepartmentId = null;

    render(
      <ProtectedComponent requireDepartmentContext={false}>
        <div>Global Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Global Content')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Loading States
// ============================================================================

describe('ProtectedComponent - Loading States', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should show loading spinner when auth is loading and showLoading=true', () => {
    mockAuthStore.isLoading = true;

    render(
      <ProtectedComponent showLoading={true}>
        <div>Content</div>
      </ProtectedComponent>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should show loading spinner when department is switching and showLoading=true', () => {
    mockDepartmentContext.isSwitching = true;

    render(
      <ProtectedComponent showLoading={true}>
        <div>Content</div>
      </ProtectedComponent>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should not show loading spinner when showLoading=false', () => {
    mockAuthStore.isLoading = true;

    render(
      <ProtectedComponent showLoading={false}>
        <div>Content</div>
      </ProtectedComponent>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Combined Restrictions
// ============================================================================

describe('ProtectedComponent - Combined Restrictions', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should check both permission and user type', () => {
    render(
      <ProtectedComponent requiredRights="content:courses:manage" allowedUserTypes={['staff']}>
        <div>Combined Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Combined Content')).toBeInTheDocument();
  });

  it('should fail if user type matches but permission does not', () => {
    render(
      <ProtectedComponent requiredRights="billing:invoices:read" allowedUserTypes={['staff']}>
        <div>Combined Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Combined Content')).not.toBeInTheDocument();
  });

  it('should fail if permission matches but user type does not', () => {
    render(
      <ProtectedComponent requiredRights="content:courses:manage" allowedUserTypes={['learner']}>
        <div>Combined Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Combined Content')).not.toBeInTheDocument();
  });

  it('should check permission, user type, and department context together', () => {
    render(
      <ProtectedComponent
        requiredRights="content:courses:manage"
        allowedUserTypes={['staff']}
        requireDepartmentContext={true}
      >
        <div>All Requirements</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('All Requirements')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Convenience Wrappers
// ============================================================================

describe('StaffOnly Wrapper', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user is staff', () => {
    render(
      <StaffOnly>
        <div>Staff Content</div>
      </StaffOnly>
    );

    expect(screen.getByText('Staff Content')).toBeInTheDocument();
  });

  it('should not render children when user is not staff', () => {
    mockAuthStore.roleHierarchy!.allUserTypes = ['learner'];

    render(
      <StaffOnly>
        <div>Staff Content</div>
      </StaffOnly>
    );

    expect(screen.queryByText('Staff Content')).not.toBeInTheDocument();
  });

  it('should support fallback', () => {
    mockAuthStore.roleHierarchy!.allUserTypes = ['learner'];

    render(
      <StaffOnly fallback={<div>Not Staff</div>}>
        <div>Staff Content</div>
      </StaffOnly>
    );

    expect(screen.getByText('Not Staff')).toBeInTheDocument();
  });

  it('should support additional props like requiredRights', () => {
    render(
      <StaffOnly requiredRights="content:courses:manage">
        <div>Staff with Permission</div>
      </StaffOnly>
    );

    expect(screen.getByText('Staff with Permission')).toBeInTheDocument();
  });
});

describe('LearnerOnly Wrapper', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user is learner', () => {
    mockAuthStore.roleHierarchy!.allUserTypes = ['learner'];

    render(
      <LearnerOnly>
        <div>Learner Content</div>
      </LearnerOnly>
    );

    expect(screen.getByText('Learner Content')).toBeInTheDocument();
  });

  it('should not render children when user is not learner', () => {
    render(
      <LearnerOnly>
        <div>Learner Content</div>
      </LearnerOnly>
    );

    expect(screen.queryByText('Learner Content')).not.toBeInTheDocument();
  });

  it('should support fallback', () => {
    render(
      <LearnerOnly fallback={<div>Not Learner</div>}>
        <div>Learner Content</div>
      </LearnerOnly>
    );

    expect(screen.getByText('Not Learner')).toBeInTheDocument();
  });
});

describe('AdminOnly Wrapper', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should render children when user is global-admin AND session is active', () => {
    mockAuthStore.roleHierarchy!.allUserTypes = ['global-admin'];
    mockAuthStore.isAdminSessionActive = true;

    render(
      <AdminOnly>
        <div>Admin Content</div>
      </AdminOnly>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should not render children when user is global-admin but session is not active', () => {
    mockAuthStore.roleHierarchy!.allUserTypes = ['global-admin'];
    mockAuthStore.isAdminSessionActive = false;

    render(
      <AdminOnly>
        <div>Admin Content</div>
      </AdminOnly>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should not render children when session is active but user is not global-admin', () => {
    mockAuthStore.roleHierarchy!.allUserTypes = ['staff'];
    mockAuthStore.isAdminSessionActive = true;

    render(
      <AdminOnly>
        <div>Admin Content</div>
      </AdminOnly>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should support fallback', () => {
    mockAuthStore.isAdminSessionActive = false;

    render(
      <AdminOnly fallback={<div>Not Admin</div>}>
        <div>Admin Content</div>
      </AdminOnly>
    );

    expect(screen.getByText('Not Admin')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Edge Cases
// ============================================================================

describe('ProtectedComponent - Edge Cases', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should handle empty requiredRights array', () => {
    render(
      <ProtectedComponent requiredRights={[]}>
        <div>Empty Rights</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Empty Rights')).toBeInTheDocument();
  });

  it('should handle empty allowedUserTypes array', () => {
    render(
      <ProtectedComponent allowedUserTypes={[]}>
        <div>Empty Types</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Empty Types')).toBeInTheDocument();
  });

  it('should work with complex fallback component', () => {
    mockAuthStore.isAuthenticated = false;

    render(
      <ProtectedComponent
        fallback={
          <div>
            <h1>Access Denied</h1>
            <p>You do not have permission</p>
          </div>
        }
      >
        <div>Protected Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission')).toBeInTheDocument();
  });

  it('should work with nested ProtectedComponents', () => {
    render(
      <ProtectedComponent allowedUserTypes={['staff']}>
        <div>
          <ProtectedComponent requiredRights="content:courses:manage">
            <div>Nested Protected</div>
          </ProtectedComponent>
        </div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Nested Protected')).toBeInTheDocument();
  });

  it('should re-render when permissions change', () => {
    const { rerender } = render(
      <ProtectedComponent requiredRights="content:courses:read">
        <div>Course Content</div>
      </ProtectedComponent>
    );

    expect(screen.getByText('Course Content')).toBeInTheDocument();

    // Change permissions - update both the array and the mock function behavior
    mockDepartmentContext.currentDepartmentAccessRights = [];
    mockDepartmentContext.hasAllPermissions = vi.fn(() => false);

    rerender(
      <ProtectedComponent requiredRights="content:courses:read">
        <div>Course Content</div>
      </ProtectedComponent>
    );

    expect(screen.queryByText('Course Content')).not.toBeInTheDocument();
  });
});
