/**
 * ProtectedNavLink Component Tests - Track 2B
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Comprehensive tests for permission-aware NavLink component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ProtectedNavLink } from '../ProtectedNavLink';

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

describe('ProtectedNavLink Component', () => {
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
    it('should render NavLink when no permissions are required', () => {
      render(
        <RouterWrapper>
          <ProtectedNavLink to="/test">Test Link</ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /test link/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render NavLink with className function', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/courses']}>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            className={({ isActive }) =>
              isActive ? 'bg-blue-600 text-white' : 'text-gray-600'
            }
          >
            Courses
          </ProtectedNavLink>
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // Active class should be applied since we're on /courses
      expect(link).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should render NavLink with static className', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            className="px-4 py-2"
          >
            Courses
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-4', 'py-2');
    });

    it('should handle missing children', () => {
      render(
        <RouterWrapper>
          <ProtectedNavLink to="/courses" />
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link.textContent).toBe('');
    });
  });

  describe('Single Permission - Global Scope', () => {
    it('should render NavLink when user has the required permission', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink to="/courses" requiredPermission="content:courses:read">
            Courses
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /courses/i });
      expect(link).toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should not render NavLink when user lacks the required permission', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedNavLink to="/admin" requiredPermission="admin:access">
            Admin
          </ProtectedNavLink>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('admin:access');
    });
  });

  describe('Multiple Permissions - Global Scope', () => {
    it('should render NavLink when user has ANY of the required permissions (default OR logic)', () => {
      mockHasAnyPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
          >
            Content
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasAnyPermission).toHaveBeenCalledWith([
        'content:courses:read',
        'content:courses:create',
      ]);
    });

    it('should render NavLink when user has ALL required permissions (AND logic)', () => {
      mockHasAllPermissions.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            requireAll={true}
          >
            Content Management
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasAllPermissions).toHaveBeenCalledWith([
        'content:courses:read',
        'content:courses:create',
      ]);
    });

    it('should hide NavLink when user lacks any permission (AND logic)', () => {
      mockHasAllPermissions.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/admin"
            requiredPermissions={['admin:access', 'admin:settings']}
            requireAll={true}
          >
            Admin Panel
          </ProtectedNavLink>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Department-Scoped Permissions', () => {
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
          <ProtectedNavLink
            to="/department/courses"
            requiredPermission="content:courses:read"
            departmentScoped={true}
          >
            Department Courses
          </ProtectedNavLink>
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
          <ProtectedNavLink
            to="/department/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            departmentScoped={true}
          >
            Department Content
          </ProtectedNavLink>
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
          <ProtectedNavLink
            to="/department/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            departmentScoped={true}
            requireAll={true}
          >
            Department Content Management
          </ProtectedNavLink>
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

  describe('Active State Styling', () => {
    it('should apply active className when route matches', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/courses']}>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            className={({ isActive }) =>
              isActive
                ? 'bg-blue-600 text-white font-bold'
                : 'text-gray-600 hover:bg-gray-100'
            }
          >
            Courses
          </ProtectedNavLink>
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-blue-600', 'text-white', 'font-bold');
      expect(link).not.toHaveClass('text-gray-600', 'hover:bg-gray-100');
    });

    it('should apply inactive className when route does not match', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            className={({ isActive }) =>
              isActive
                ? 'bg-blue-600 text-white font-bold'
                : 'text-gray-600 hover:bg-gray-100'
            }
          >
            Courses
          </ProtectedNavLink>
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      expect(link).not.toHaveClass('bg-blue-600', 'text-white', 'font-bold');
      expect(link).toHaveClass('text-gray-600', 'hover:bg-gray-100');
    });
  });

  describe('Sidebar Navigation Use Case', () => {
    it('should work in a typical sidebar navigation pattern', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/courses']}>
          <nav>
            <ProtectedNavLink
              to="/dashboard"
              requiredPermission="system:dashboard:view"
              className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`
              }
            >
              Dashboard
            </ProtectedNavLink>
            <ProtectedNavLink
              to="/courses"
              requiredPermission="content:courses:read"
              className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`
              }
            >
              Courses
            </ProtectedNavLink>
            <ProtectedNavLink
              to="/learners"
              requiredPermission="learners:profiles:read"
              className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`
              }
            >
              Learners
            </ProtectedNavLink>
          </nav>
        </MemoryRouter>
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      const coursesLink = screen.getByRole('link', { name: /courses/i });
      const learnersLink = screen.getByRole('link', { name: /learners/i });

      // Only courses link should have active styling
      expect(dashboardLink).toHaveClass('hover:bg-gray-100');
      expect(coursesLink).toHaveClass('bg-blue-600', 'text-white');
      expect(learnersLink).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Fallback Rendering', () => {
    it('should render fallback when permission is denied', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/admin"
            requiredPermission="admin:access"
            fallback={<span>No Access</span>}
          >
            Admin Panel
          </ProtectedNavLink>
        </RouterWrapper>
      );

      expect(screen.getByText('No Access')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render null by default when permission is denied', () => {
      mockHasPermission.mockReturnValue(false);

      const { container } = render(
        <RouterWrapper>
          <ProtectedNavLink to="/admin" requiredPermission="admin:access">
            Admin Panel
          </ProtectedNavLink>
        </RouterWrapper>
      );

      expect(container.textContent).toBe('');
    });

    it('should render complex fallback component', () => {
      mockHasPermission.mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/premium"
            requiredPermission="premium:access"
            fallback={
              <span className="text-gray-400">
                Premium Feature <span className="text-xs">(Upgrade Required)</span>
              </span>
            }
          >
            Premium Content
          </ProtectedNavLink>
        </RouterWrapper>
      );

      expect(screen.getByText(/premium feature/i)).toBeInTheDocument();
      expect(screen.getByText(/upgrade required/i)).toBeInTheDocument();
    });
  });

  describe('NavLink Props Passthrough', () => {
    it('should pass through standard NavLink props', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            replace={true}
            state={{ from: '/home' }}
          >
            Courses
          </ProtectedNavLink>
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
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            onClick={handleClick}
          >
            Courses
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      link.click();

      expect(handleClick).toHaveBeenCalled();
    });

    it('should support end prop for exact matching', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/courses/123']}>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            end={false}
            className={({ isActive }) => (isActive ? 'active' : 'inactive')}
          >
            Courses
          </ProtectedNavLink>
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      // With end={false}, /courses should match /courses/123
      expect(link).toHaveClass('active');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty requiredPermissions array', () => {
      render(
        <RouterWrapper>
          <ProtectedNavLink to="/courses" requiredPermissions={[]}>
            Courses
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should prioritize requiredPermissions over requiredPermission', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
            requiredPermissions={['content:courses:create']}
          >
            Courses
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // When requiredPermissions has single element, it's treated as single permission
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:create');
    });
  });

  describe('Comparison with ProtectedLink', () => {
    it('should have same permission checking logic as ProtectedLink', () => {
      mockHasPermission.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/courses"
            requiredPermission="content:courses:read"
          >
            Courses
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should support all ProtectedLink permission patterns', () => {
      mockHasAllPermissions.mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedNavLink
            to="/content"
            requiredPermissions={['content:courses:read', 'content:courses:create']}
            requireAll={true}
          >
            Content Management
          </ProtectedNavLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(mockHasAllPermissions).toHaveBeenCalledWith([
        'content:courses:read',
        'content:courses:create',
      ]);
    });
  });
});
