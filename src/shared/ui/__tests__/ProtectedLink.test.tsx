/**
 * ProtectedLink Component Tests - Track G
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Comprehensive tests for permission-aware link component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedLink, ProtectedLinkMultiple } from '../ProtectedLink';

// Mock the permission hooks
vi.mock('@/shared/hooks/usePermission', () => ({
  usePermission: vi.fn(),
  useScopedPermission: vi.fn(),
}));

import { usePermission, useScopedPermission } from '@/shared/hooks/usePermission';

// Wrapper for React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ProtectedLink Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should render link when user has required permission', () => {
      vi.mocked(usePermission).mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink to="/courses" requiredPermission="content:courses:read">
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /courses/i });
      expect(link).toBeInTheDocument();
    });

    it('should not render link when user lacks required permission', () => {
      vi.mocked(usePermission).mockReturnValue(false);

      render(
        <RouterWrapper>
          <ProtectedLink to="/admin" requiredPermission="admin:access">
            Admin
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should pass className to Link component', () => {
      vi.mocked(usePermission).mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/courses"
            requiredPermission="content:courses:read"
            className="text-blue-500 hover:underline"
          >
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-blue-500', 'hover:underline');
    });
  });

  describe('Single Permission Requirement', () => {
    it('should check single permission', () => {
      vi.mocked(usePermission).mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink to="/courses" requiredPermission="content:courses:read">
            Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(usePermission).toHaveBeenCalledWith('content:courses:read', undefined);
    });

    it('should use department ID when provided', () => {
      vi.mocked(usePermission).mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLink
            to="/department/courses"
            requiredPermission="content:courses:read"
            departmentId="dept-123"
          >
            Department Courses
          </ProtectedLink>
        </RouterWrapper>
      );

      expect(usePermission).toHaveBeenCalledWith('content:courses:read', 'dept-123');
    });
  });

  describe('Multiple Permissions', () => {
    it('should show link when user has any of the required permissions (default)', () => {
      vi.mocked(usePermission).mockReturnValue(true);

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
    });

    it('should respect requireAll flag', () => {
      // First permission returns true, but for requireAll=true, we need to check the logic
      vi.mocked(usePermission).mockReturnValue(true);

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
    });

    it('should hide link when user lacks all required permissions', () => {
      vi.mocked(usePermission).mockReturnValue(false);

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
    });
  });

  describe('Department Scoped Checking', () => {
    it('should use scoped permission hook when departmentScoped is true', () => {
      vi.mocked(useScopedPermission).mockReturnValue(true);

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

      expect(useScopedPermission).toHaveBeenCalledWith('content:courses:read');
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should prioritize departmentId over departmentScoped', () => {
      vi.mocked(usePermission).mockReturnValue(true);

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

      expect(usePermission).toHaveBeenCalledWith('content:courses:read', 'dept-specific');
    });
  });

  describe('Fallback Rendering', () => {
    it('should render fallback when permission is denied', () => {
      vi.mocked(usePermission).mockReturnValue(false);

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
      vi.mocked(usePermission).mockReturnValue(false);

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
      vi.mocked(usePermission).mockReturnValue(false);

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
      vi.mocked(usePermission).mockReturnValue(true);

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
      // Note: Testing replace and state props is limited in this context
    });

    it('should handle onClick handler', () => {
      vi.mocked(usePermission).mockReturnValue(true);
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

    it('should handle both requiredPermission and requiredPermissions', () => {
      vi.mocked(usePermission).mockReturnValue(true);

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

      // requiredPermissions should take precedence
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should handle missing children', () => {
      vi.mocked(usePermission).mockReturnValue(true);

      const { container } = render(
        <RouterWrapper>
          <ProtectedLink to="/courses" requiredPermission="content:courses:read" />
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link.textContent).toBe('');
    });
  });
});

describe('ProtectedLinkMultiple Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Multiple Permission Checks', () => {
    it('should render when user has any permission (default)', () => {
      vi.mocked(usePermission)
        .mockReturnValueOnce(true) // First permission
        .mockReturnValueOnce(false); // Second permission

      render(
        <RouterWrapper>
          <ProtectedLinkMultiple
            to="/content"
            permissions={['content:courses:read', 'content:courses:create']}
          >
            Content
          </ProtectedLinkMultiple>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should require all permissions when requireAll is true', () => {
      vi.mocked(usePermission)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      render(
        <RouterWrapper>
          <ProtectedLinkMultiple
            to="/content"
            permissions={['content:courses:read', 'content:courses:create']}
            requireAll={true}
          >
            Content Management
          </ProtectedLinkMultiple>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should hide link when requireAll is true and user lacks any permission', () => {
      vi.mocked(usePermission)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      render(
        <RouterWrapper>
          <ProtectedLinkMultiple
            to="/content"
            permissions={['content:courses:read', 'content:courses:create']}
            requireAll={true}
          >
            Content Management
          </ProtectedLinkMultiple>
        </RouterWrapper>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should check each permission with department ID', () => {
      vi.mocked(usePermission)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      const deptId = 'dept-123';

      render(
        <RouterWrapper>
          <ProtectedLinkMultiple
            to="/department/content"
            permissions={['content:courses:read', 'content:courses:create']}
            departmentId={deptId}
          >
            Department Content
          </ProtectedLinkMultiple>
        </RouterWrapper>
      );

      expect(usePermission).toHaveBeenCalledWith('content:courses:read', deptId);
      expect(usePermission).toHaveBeenCalledWith('content:courses:create', deptId);
    });
  });

  describe('Fallback Behavior', () => {
    it('should render fallback when permissions are denied', () => {
      vi.mocked(usePermission)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      render(
        <RouterWrapper>
          <ProtectedLinkMultiple
            to="/admin"
            permissions={['admin:access', 'admin:settings']}
            fallback={<span>Admin Access Required</span>}
          >
            Admin Panel
          </ProtectedLinkMultiple>
        </RouterWrapper>
      );

      expect(screen.getByText('Admin Access Required')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permissions array', () => {
      render(
        <RouterWrapper>
          <ProtectedLinkMultiple to="/courses" permissions={[]}>
            Courses
          </ProtectedLinkMultiple>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should handle single permission in array', () => {
      vi.mocked(usePermission).mockReturnValue(true);

      render(
        <RouterWrapper>
          <ProtectedLinkMultiple to="/courses" permissions={['content:courses:read']}>
            Courses
          </ProtectedLinkMultiple>
        </RouterWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });
});
