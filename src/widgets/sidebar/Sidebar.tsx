/**
 * Sidebar Navigation Component - Phase 3 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Complete navigation system with:
 * - Section 1: Global Navigation (userType-based)
 * - Section 2: Department Selector (when user has departments)
 * - Section 3: Department Actions (when department selected)
 * - Mobile responsive with slide-in behavior
 * - Auto-restore last accessed department
 */

import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  AlertCircle,
  Settings,
  X,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import { useDepartmentContext } from '@/shared/hooks';
import { GLOBAL_NAV_ITEMS, DEPARTMENT_NAV_ITEMS } from './config/navItems';
import { NavLink } from './ui/NavLink';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { DepartmentNavItem } from './config/navItems';

// ============================================================================
// Types
// ============================================================================

interface UserDepartment {
  id: string;
  name: string;
  isPrimary: boolean;
  type: 'staff' | 'learner';
}

interface ProcessedDepartmentNavItem extends Omit<DepartmentNavItem, 'pathTemplate'> {
  path: string;
}

// ============================================================================
// Sidebar Component
// ============================================================================

export const Sidebar: React.FC = () => {
  const { roleHierarchy, user } = useAuthStore();
  const {
    selectedDepartmentId,
    setSelectedDepartment,
    rememberDepartment,
    lastAccessedDepartments,
    isSidebarOpen,
    setSidebarOpen,
  } = useNavigationStore();
  const {
    hasPermission,
    switchDepartment,
    isSwitching,
    switchError,
  } = useDepartmentContext();

  // Guard: Must have auth data
  if (!roleHierarchy || !user) {
    return null;
  }

  const primaryUserType = roleHierarchy.primaryUserType;

  // ================================================================
  // Filter Global Nav Items
  // ================================================================

  const globalNavItems = GLOBAL_NAV_ITEMS.filter((item) => {
    // Check if this item applies to current userType
    if (!item.userTypes.includes(primaryUserType)) {
      return false;
    }

    // Check permission if required
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission);
    }

    return true;
  });

  // ================================================================
  // Get User's Departments
  // ================================================================

  const userDepartments: UserDepartment[] = React.useMemo(() => {
    const departments: UserDepartment[] = [];

    // Add staff departments
    if (roleHierarchy.staffRoles) {
      for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
        departments.push({
          id: deptGroup.departmentId,
          name: deptGroup.departmentName,
          isPrimary: deptGroup.isPrimary,
          type: 'staff',
        });
      }
    }

    // Add learner departments
    if (roleHierarchy.learnerRoles) {
      for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
        departments.push({
          id: deptGroup.departmentId,
          name: deptGroup.departmentName,
          isPrimary: false,
          type: 'learner',
        });
      }
    }

    return departments;
  }, [roleHierarchy]);

  // ================================================================
  // Auto-Select Last Accessed Department
  // ================================================================

  React.useEffect(() => {
    if (!user || userDepartments.length === 0) return;
    if (selectedDepartmentId) return; // Already selected

    // Try to restore last accessed department
    const lastDept = lastAccessedDepartments[user._id];

    if (lastDept && userDepartments.some((d) => d.id === lastDept)) {
      setSelectedDepartment(lastDept);
      console.log('[Sidebar] Restored last department:', lastDept);
    }

    // Otherwise, default to NO department selected
    // User must explicitly choose
  }, [
    user,
    userDepartments,
    selectedDepartmentId,
    lastAccessedDepartments,
    setSelectedDepartment,
  ]);

  // ================================================================
  // Handle Department Selection
  // ================================================================

  const handleDepartmentClick = async (deptId: string) => {
    // Toggle: clicking selected department deselects it
    if (selectedDepartmentId === deptId) {
      setSelectedDepartment(null);
      return;
    }

    // Call API to switch department
    try {
      await switchDepartment(deptId);

      // Remember this selection for next time
      if (user) {
        rememberDepartment(user._id, deptId);
      }
    } catch (error) {
      console.error('[Sidebar] Failed to switch department:', error);
      // Error is already stored in switchError from the hook
    }
  };

  // ================================================================
  // Get Department-Specific Nav Items
  // ================================================================

  const departmentNavItems: ProcessedDepartmentNavItem[] = React.useMemo(() => {
    if (!selectedDepartmentId) return [];

    return DEPARTMENT_NAV_ITEMS.filter((item) => {
      // Check if this item applies to current userType
      if (!item.userTypes.includes(primaryUserType)) {
        return false;
      }

      // Check if user has permission in THIS department
      return hasPermission(item.requiredPermission, {
        type: 'department',
        id: selectedDepartmentId,
      });
    }).map((item) => ({
      ...item,
      path: item.pathTemplate.replace(':deptId', selectedDepartmentId),
    }));
  }, [selectedDepartmentId, primaryUserType, hasPermission]);

  // ================================================================
  // Render
  // ================================================================

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] border-r bg-background',
          'lg:sticky lg:top-14 lg:z-30',
          'w-64 transition-transform duration-300 flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Navigation</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-accent rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: Global Navigation */}
        <div className="flex-shrink-0 border-b">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </div>
          <nav className="space-y-1 px-2 pb-4">
            {globalNavItems.map((item) => (
              <NavLink
                key={item.path}
                label={item.label}
                path={item.path}
                icon={item.icon}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Section 2: Department Selector */}
        {userDepartments.length > 0 && (
          <div className="flex-shrink-0 border-b">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              My Departments
            </div>
            {switchError && (
              <div className="mx-2 mb-2 px-3 py-2 text-xs bg-destructive/10 text-destructive rounded-md">
                {switchError}
              </div>
            )}
            <div className="space-y-1 px-2 pb-4">
              {userDepartments.map((dept) => {
                const isSelected = selectedDepartmentId === dept.id;

                return (
                  <button
                    key={dept.id}
                    onClick={() => handleDepartmentClick(dept.id)}
                    disabled={isSwitching}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground',
                      isSwitching && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isSwitching && selectedDepartmentId === dept.id ? (
                      <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                    ) : isSelected ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{dept.name}</span>
                    {dept.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Department-Specific Actions */}
        {userDepartments.length > 0 && (
          <div className="flex-1 overflow-y-auto border-b">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Department Actions
            </div>

            {/* No Department Selected */}
            {!selectedDepartmentId && (
              <div className="px-4 py-8 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a department above to see available actions
                </p>
              </div>
            )}

            {/* No Actions Available */}
            {selectedDepartmentId && departmentNavItems.length === 0 && (
              <div className="px-4 py-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No actions available for this department
                </p>
              </div>
            )}

            {/* Department Actions */}
            {selectedDepartmentId && departmentNavItems.length > 0 && (
              <nav className="space-y-1 px-2 pb-4">
                {departmentNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Settings Footer */}
        <div className="flex-shrink-0 p-2 border-t">
          <NavLink
            label="Settings"
            path="/settings"
            icon={Settings}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      </aside>
    </>
  );
};
