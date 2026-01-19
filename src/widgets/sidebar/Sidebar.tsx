/**
 * Sidebar Navigation Component
 * Three-section navigation structure (ISS-007)
 * Version: 3.0.0
 * Date: 2026-01-13
 *
 * Section 1: Base Navigation - Always visible
 * Section 2: Context Navigation - Changes based on current dashboard
 * Section 3: Department Navigation - Collapsible department selector
 */

import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
import {
  BASE_NAV_ITEMS,
  LEARNER_CONTEXT_NAV,
  STAFF_CONTEXT_NAV,
  ADMIN_CONTEXT_NAV,
  DEPARTMENT_NAV_ITEMS,
  DEPARTMENT_ACTION_GROUPS,
  type BaseNavItem,
  type ContextNavItem,
  type DepartmentActionGroup,
} from './config/navItems';
import { NavLink } from './ui/NavLink';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface UserDepartment {
  id: string;
  name: string;
  isPrimary: boolean;
  type: 'staff' | 'learner';
}

interface ProcessedBaseNavItem extends BaseNavItem {
  path: string;
  disabled: boolean;
}

interface ProcessedContextNavItem extends ContextNavItem {
  disabled: boolean;
}

interface ProcessedDepartmentNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  group: DepartmentActionGroup;
}

/**
 * Grouped department nav items for collapsible sections
 */
interface GroupedDepartmentNavItems {
  content: ProcessedDepartmentNavItem[];
  people: ProcessedDepartmentNavItem[];
  analytics: ProcessedDepartmentNavItem[];
}

// ============================================================================
// Sidebar Component
// ============================================================================

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { roleHierarchy, user, hasPermission: hasGlobalPermission } = useAuthStore();
  const {
    selectedDepartmentId,
    setSelectedDepartment,
    rememberDepartment,
    lastAccessedDepartments,
    isSidebarOpen,
    setSidebarOpen,
  } = useNavigationStore();
  const {
    hasPermission: hasDeptPermission,
    switchDepartment,
    isSwitching,
    switchError,
  } = useDepartmentContext();

  const [isDepartmentSectionExpanded, setIsDepartmentSectionExpanded] = React.useState(isSwitching);

  // Auto-expand when switching
  React.useEffect(() => {
    if (isSwitching) {
      setIsDepartmentSectionExpanded(true);
    }
  }, [isSwitching]);

  // Guard: Must have auth data
  if (!roleHierarchy || !user) {
    return null;
  }

  const primaryUserType = roleHierarchy.primaryUserType;
  const allUserTypes = roleHierarchy.allUserTypes || [primaryUserType];

  // ================================================================
  // Detect Current Dashboard Context
  // ================================================================

  const currentDashboard = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    return pathSegments[1]; // 'learner', 'staff', or 'admin'
  }, [location.pathname]);

  const settingsPath = useMemo(() => {
    const allowedDashboards = new Set(['learner', 'staff', 'admin']);
    const fallbackDashboard =
      roleHierarchy.defaultDashboard ||
      (primaryUserType === 'global-admin' ? 'admin' : primaryUserType);
    const targetDashboard = allowedDashboards.has(currentDashboard)
      ? currentDashboard
      : allowedDashboards.has(fallbackDashboard)
        ? fallbackDashboard
        : 'staff';

    if (targetDashboard === 'admin') {
      return '/admin/settings';
    }
    if (targetDashboard === 'staff') {
      return '/staff/settings';
    }
    return '/learner/settings';
  }, [currentDashboard, roleHierarchy.defaultDashboard, primaryUserType]);

  // ================================================================
  // SECTION 1: Process Base Navigation Items
  // ================================================================

  const baseNavItems: ProcessedBaseNavItem[] = useMemo(() => {
    return BASE_NAV_ITEMS.map((item) => {
      // Resolve path if it's a function
      const path =
        typeof item.path === 'function'
          ? item.path(primaryUserType, currentDashboard)
          : item.path;

      // Determine if link should be disabled
      let disabled = false;

      // Check if user has required userType (if specified)
      if (item.userTypes && item.showDisabled) {
        const hasRequiredUserType = item.userTypes.some((ut) => allUserTypes.includes(ut));
        if (!hasRequiredUserType) {
          disabled = true;
        }
      }

      // Check permission (only if not already disabled)
      if (!disabled && item.requiredPermission) {
        if (item.departmentScoped) {
          disabled = !hasDeptPermission(item.requiredPermission);
        } else {
          disabled = !hasGlobalPermission(item.requiredPermission);
        }
      }

      return {
        ...item,
        path,
        disabled,
      };
    });
  }, [primaryUserType, allUserTypes, hasDeptPermission, hasGlobalPermission, currentDashboard]);

  // ================================================================
  // SECTION 2: Get Context-Specific Navigation Items
  // ================================================================

  const contextNavItems: ProcessedContextNavItem[] = useMemo(() => {
    let items: ContextNavItem[] = [];

    switch (currentDashboard) {
      case 'learner':
        items = LEARNER_CONTEXT_NAV;
        break;
      case 'staff':
        items = STAFF_CONTEXT_NAV;
        break;
      case 'admin':
        items = ADMIN_CONTEXT_NAV;
        break;
      default:
        items = [];
    }

    // Process items with permission checks
    return items.map((item) => {
      let disabled = false;

      if (item.requiredPermission) {
        if (item.departmentScoped) {
          disabled = !hasDeptPermission(item.requiredPermission);
        } else {
          disabled = !hasGlobalPermission(item.requiredPermission);
        }
      }

      return {
        ...item,
        disabled,
      };
    });
  }, [currentDashboard, hasDeptPermission, hasGlobalPermission]);

  // ================================================================
  // Get User's Departments
  // ================================================================

  const userDepartments: UserDepartment[] = useMemo(() => {
    const departments: UserDepartment[] = [];

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
    if (selectedDepartmentId) return;

    const lastDept = lastAccessedDepartments[user._id];
    if (lastDept && userDepartments.some((d) => d.id === lastDept)) {
      setSelectedDepartment(lastDept);
    }
  }, [user, userDepartments, selectedDepartmentId, lastAccessedDepartments, setSelectedDepartment]);

  // ================================================================
  // Handle Department Selection
  // ================================================================

  const handleDepartmentClick = async (deptId: string) => {
    if (selectedDepartmentId === deptId) {
      setSelectedDepartment(null);
      return;
    }

    try {
      await switchDepartment(deptId);
      if (user) {
        rememberDepartment(user._id, deptId);
      }
    } catch (error) {
      console.error('[Sidebar] Failed to switch department:', error);
    }
  };

  // ================================================================
  // SECTION 3: Get Department-Specific Nav Items (Grouped)
  // ================================================================

  // State for which group is expanded (accordion behavior)
  const [expandedGroup, setExpandedGroup] = React.useState<DepartmentActionGroup | null>('content');

  const departmentNavItems: ProcessedDepartmentNavItem[] = useMemo(() => {
    if (!selectedDepartmentId) return [];

    return DEPARTMENT_NAV_ITEMS.filter((item) => {
      const hasMatchingUserType = item.userTypes.some((ut) => allUserTypes.includes(ut));
      if (!hasMatchingUserType) return false;

      return hasDeptPermission(item.requiredPermission);
    }).map((item) => ({
      label: item.label,
      path: item.pathTemplate.replace(':deptId', selectedDepartmentId),
      icon: item.icon,
      group: item.group,
    }));
  }, [selectedDepartmentId, allUserTypes, hasDeptPermission]);

  // Group nav items by category
  const groupedNavItems: GroupedDepartmentNavItems = useMemo(() => {
    const groups: GroupedDepartmentNavItems = {
      content: [],
      people: [],
      analytics: [],
    };

    departmentNavItems.forEach((item) => {
      groups[item.group].push(item);
    });

    return groups;
  }, [departmentNavItems]);

  // Get groups that have items
  const availableGroups = useMemo(() => {
    return (['content', 'people', 'analytics'] as DepartmentActionGroup[]).filter(
      (group) => groupedNavItems[group].length > 0
    );
  }, [groupedNavItems]);

  // Toggle group expansion (accordion - only one open)
  const handleGroupToggle = (group: DepartmentActionGroup) => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };


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
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-accent rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SECTION 1: Base Navigation */}
        <div className="flex-shrink-0 border-b">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </div>
          <nav className="space-y-1 px-2 pb-4">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.path}
                label={item.label}
                path={item.path}
                icon={item.icon}
                disabled={item.disabled}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* SECTION 2: Context-Specific Navigation */}
        {contextNavItems.length > 0 && (
          <div className="flex-shrink-0 border-b">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {currentDashboard === 'learner' && 'Learner'}
              {currentDashboard === 'staff' && 'Staff'}
              {currentDashboard === 'admin' && 'Admin'}
            </div>
            <nav className="space-y-1 px-2 pb-4">
              {contextNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  icon={item.icon}
                  disabled={item.disabled}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </nav>
          </div>
        )}

        {/* SECTION 3: Department Navigation */}
        {userDepartments.length > 0 && (
          <>
            {/* Department Selector */}
            <div className="flex-shrink-0 border-b">
              <button
                onClick={() => setIsDepartmentSectionExpanded(!isDepartmentSectionExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-accent/50 transition-colors"
              >
                {isDepartmentSectionExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                My Departments
              </button>

              {isDepartmentSectionExpanded && (
                <>
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
                </>
              )}
            </div>

            {/* Department Actions - Grouped Collapsible */}
            <div className="flex-1 overflow-y-auto border-b">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Department Actions
              </div>

              {!selectedDepartmentId && (
                <div className="px-4 py-8 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a department above to see available actions
                  </p>
                </div>
              )}

              {selectedDepartmentId && availableGroups.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No actions available for this department
                  </p>
                </div>
              )}

              {selectedDepartmentId && availableGroups.length > 0 && (
                <div className="pb-2">
                  {availableGroups.map((group) => {
                    const groupConfig = DEPARTMENT_ACTION_GROUPS[group];
                    const GroupIcon = groupConfig.icon;
                    const isExpanded = expandedGroup === group;
                    const items = groupedNavItems[group];

                    return (
                      <div key={group} className="border-b border-border/50 last:border-b-0">
                        {/* Group Header */}
                        <button
                          onClick={() => handleGroupToggle(group)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                            'hover:bg-accent/50',
                            isExpanded && 'bg-accent/30'
                          )}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          )}
                          <GroupIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span className="flex-1 text-left font-medium">{groupConfig.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {items.length}
                          </Badge>
                        </button>

                        {/* Group Items */}
                        {isExpanded && (
                          <nav className="space-y-0.5 px-2 pb-2">
                            {items.map((item) => (
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
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Settings Footer */}
        <div className="flex-shrink-0 p-2 border-t">
          <NavLink
            label="Settings"
            path={settingsPath}
            icon={Settings}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      </aside>
    </>
  );
};
