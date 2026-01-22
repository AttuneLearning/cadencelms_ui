/**
 * ProtectedLink Component Tests - Track G (Enhanced for Track 2B)
 * Version: 2.0.0
 * Date: 2026-01-11
 *
 * Comprehensive tests for permission-aware link component
 * Now includes extensive tests for multiple permission checking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedLink } from '../ProtectedLink';

// Mock the auth store
vi.mock('@/features/auth/model/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the department context hook
vi.mock('@/shared/hooks/useDepartmentContext', () => ({
  useDepartmentContext: vi.fn(),
}));

import { useAuthStore } from '@/features/auth/model/authStore';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';

// Wrapper for React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ProtectedLink Component', () => {
  // Default mock implementations
  const mockHasPermission = vi.fn();
  const mockHasAnyPermission = vi.fn();
  const mockHasAllPermissions = vi.fn();
  const mockHasDeptPermission = vi.fn();
  const mockHasAnyDeptPermission = vi.fn();
  const mockHasAllDeptPermissions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default authStore mock
    vi.mocked(useAuthStore).mockReturnValue({
      hasPermission: mockHasPermission,
      hasAnyPermission: mockHasAnyPermission,
      hasAllPermissions: mockHasAllPermissions,
    } as any);

    // Default departmentContext mock
    vi.mocked(useDepartmentContext).mockReturnValue({
      hasPermission: mockHasDeptPermission,
      hasAnyPermission: mockHasAnyDeptPermission,
      hasAllPermissions: mockHasAllDeptPermissions,
      currentDepartmentId: null,
      currentDepartmentRoles: [],
      currentDepartmentAccessRights: [],
      currentDepartmentName: null,
      switchDepartment: vi.fn(),
      isSwitching: false,
      switchError: null,
    } as any);
  });

  describe('Basic Rendering', () => {
    it('should render link when no permissions are required', () => {
      render(
        <RouterWrapper>
          <ProtectedLink to="/test">Test Link</ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /test link/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should pass className to Link component', () => {
      render(
        <RouterWrapper>
          <ProtectedLink to="/test" className="text-blue-500 hover:underline">
            Test Link
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-blue-500', 'hover:underline');
    });

    it('should handle missing children', () => {
      render(
        <RouterWrapper>
          <ProtectedLink to="/courses" />
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link.textContent).toBe('');
    });
  });

  describe('Single Permission - Global Scope', () => {
    it('should render link when user has the required permission', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink to="/courses" requiredPermission="content:courses:read">
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /courses/i });
      expect(link).toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should not render link when user lacks the required permission', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedLink to="/admin" requiredPermission="admin:access">
            Admin
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('admin:access');
    });
  });

  describe('Multiple Permissions - Global Scope (NEW - Track 2B)', () => {
    it('should render link when user has ANY of the required permissions (default OR logic)', () => {
      mockHasAnyPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
          >
            Content
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasAnyPermission).toHaveBeenCalledWith([
        'content:courses:read',
        'content:courses:create',
      ]);
    });

    it('should render link when user has ALL required permissions (AND logic)', () => {
      mockHasAllPermissions.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            requireAll={true}
          >
            Content Management
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasAllPermissions).toHaveBeenCalledWith([
        'content:courses:read',
        'content:courses:create',
      ]);
    });

    it('should hide link when user lacks any permission (AND logic)', () => {
      mockHasAllPermissions.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/admin"
            requiredPermissions={['admin:access', 'admin:settings']}
            requireAll={true}
          >
            Admin Panel
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(mockHasAllPermissions).toHaveBeenCalledWith(['admin:access', 'admin:settings']);
    });

    it('should hide link when user has none of the permissions (OR logic)', () => {
      mockHasAnyPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/admin"
            requiredPermissions={['admin:access', 'admin:settings']}
          >
            Admin Panel
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(mockHasAnyPermission).toHaveBeenCalledWith(['admin:access', 'admin:settings']);
    });
  });

  describe('Department-Scoped Permissions (NEW - Track 2B)', () => {
    beforeEach(() => {
      // Mock current department context
      vi.mocked(useDepartmentContext).mockReturnValue({
        hasPermission: mockHasDeptPermission,
        hasAnyPermission: mockHasAnyDeptPermission,
        hasAllPermissions: mockHasAllDeptPermissions,
        currentDepartmentId: 'dept-123',
        currentDepartmentRoles: ['staff'],
        currentDepartmentAccessRights: ['content:courses:read'],
        currentDepartmentName: 'Engineering',
        switchDepartment: vi.fn(),
        isSwitching: false,
        switchError: null,
      } as any);
    });

    it('should use department context when departmentScoped is true (single permission)', () => {
      mockHasDeptPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/courses"
            requiredPermission="content:courses:read"
            departmentScoped={true}
          >
            Department Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasDeptPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should use department context with multiple permissions (OR logic)', () => {
      mockHasAnyDeptPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            departmentScoped={true}
          >
            Department Content
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasAnyDeptPermission).toHaveBeenCalledWith([
        'content:courses:read',
        'content:courses:create',
      ]);
    });

    it('should use department context with multiple permissions (AND logic)', () => {
      mockHasAllDeptPermissions.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            departmentScoped={true}
            requireAll={true}
          >
            Department Content Management
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasAllDeptPermissions).toHaveBeenCalledWith([
        'content:courses:read',
        'content:courses:create',
      ]);
    });
  });

  describe('Specific Department ID (NEW - Track 2B)', () => {
    it('should check single permission with specific department ID', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/courses"
            requiredPermission="content:courses:read"
            departmentId="dept-456"
          >
            Specific Department Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // UNIFIED AUTHORIZATION: Now passes departmentId directly
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read', 'dept-456');
    });

    it('should check multiple permissions with specific department ID (AND logic)', () => {
      mockHasPermission.mockImplementation(() => true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            departmentId="dept-456"
            requireAll={true}
          >
            Department Content Management
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // UNIFIED AUTHORIZATION: Now passes departmentId directly
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read', 'dept-456');
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:create', 'dept-456');
    });

    it('should check multiple permissions with specific department ID (OR logic)', () => {
      mockHasPermission
        .mockReturnValueOnce(true) // First permission check
        .mockReturnValueOnce(false); // Second permission check

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            departmentId="dept-456"
          >
            Department Content
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should hide link when user lacks all permissions with specific department ID (OR logic)', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            departmentId="dept-456"
          >
            Department Content
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should prioritize departmentId over departmentScoped', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/courses"
            requiredPermission="content:courses:read"
            departmentScoped={true}
            departmentId="dept-specific"
          >
            Specific Department
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // UNIFIED AUTHORIZATION: Now passes departmentId directly
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read', 'dept-specific');
      expect(mockHasDeptPermission).not.toHaveBeenCalled();
    });
  });

  describe('Fallback Rendering', () => {
    it('should render fallback when permission is denied', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/admin"
            requiredPermission="admin:access"
            fallback={<span>No Access</span>}
          >
            Admin Panel
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(screen.getByText('No Access')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render null by default when permission is denied', () => {
      mockHasPermission.mockReturnValue(false);

      const { container } = render(
        <RouterWrapper>
          <ProtectedLink to="/admin" requiredPermission="admin:access">
            Admin Panel
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(container.textContent).toBe('');
    });

    it('should render complex fallback component', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/premium"
            requiredPermission="premium:access"
            fallback={
              <span className="text-gray-400">
                Premium Feature <span className="text-xs">(Upgrade Required)</span>
              </span>
            }
          >
            Premium Content
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(screen.getByText(/premium feature/i)).toBeInTheDocument();
      expect(screen.getByText(/upgrade required/i)).toBeInTheDocument();
    });
  });

  describe('Link Props Passthrough', () => {
    it('should pass through standard Link props', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/courses"
            requiredPermission="content:courses:read"
            replace={true}
            state={{ from: '/home' }}
          >
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should handle onClick handler', () => {
      mockHasPermission.mockReturnValue(true);
      const handleClick = vi.fn((e) => e.preventDefault());

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/courses"
            requiredPermission="content:courses:read"
            onClick={handleClick}
          >
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      link.click();

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty requiredPermissions array', () => {
      render(
        <RouterWrapper>
          <ProtectedLink to="/courses" requiredPermissions={[]}>
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should prioritize requiredPermissions over requiredPermission', () => {
      mockHasAnyPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/courses"
            requiredPermission="content:courses:read"
            requiredPermissions={['content:courses:create']}
          >
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // When requiredPermissions has only 1 element, it uses hasPermission (optimized path)
      // requiredPermissions should take priority over requiredPermission
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:create');
      // Should NOT have checked the requiredPermission value
      expect(mockHasPermission).not.toHaveBeenCalledWith('content:courses:read');
    });
  });

  describe('Backward Compatibility (Track 2B)', () => {
    it('should maintain backward compatibility with single requiredPermission', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink to="/courses" requiredPermission="content:courses:read">
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should work with existing departmentScoped pattern', () => {
      mockHasDeptPermission.mockReturnValue(true);
      vi.mocked(useDepartmentContext).mockReturnValue({
        hasPermission: mockHasDeptPermission,
        hasAnyPermission: mockHasAnyDeptPermission,
        hasAllPermissions: mockHasAllDeptPermissions,
        currentDepartmentId: 'dept-123',
        currentDepartmentRoles: [],
        currentDepartmentAccessRights: [],
        currentDepartmentName: null,
        switchDepartment: vi.fn(),
        isSwitching: false,
        switchError: null,
      } as any);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/courses"
            requiredPermission="content:courses:read"
            departmentScoped={true}
          >
            Department Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasDeptPermission).toHaveBeenCalledWith('content:courses:read');
    });
  });
});
