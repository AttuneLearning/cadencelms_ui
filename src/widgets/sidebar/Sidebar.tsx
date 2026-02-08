/**
 * Sidebar Navigation Component
 * Section-based navigation structure (Navigation Redesign 2026-02-05)
 * Version: 4.0.0
 *
 * Universal section structure:
 * - OVERVIEW: Dashboard, Calendar
 * - PRIMARY: Role's main tasks
 * - SECONDARY: Supporting tasks
 * - INSIGHTS: Analytics/Reports
 * - DEPARTMENT: Breadcrumb selector + flat action list
 * - FOOTER: Profile, Settings
 */

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import { useDepartmentContext } from '@/shared/hooks';
import type { UserType } from '@/shared/types/auth';
import { useUnreadCount } from '@/entities/message';
import {
  getSectionsForDashboard,
  getDepartmentActionsForDashboard,
  buildDepartmentActionPath,
  type DashboardType,
  type NavSection,
  type NavItem,
} from './config/sectionConfig';
import { NavLink } from './ui/NavLink';
import { DepartmentBreadcrumbSelector } from './ui/DepartmentBreadcrumbSelector';
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

interface ProcessedNavItem extends NavItem {
  disabled: boolean;
  badge?: string | number;
}

// ============================================================================
// Section Component
// ============================================================================

interface SectionProps {
  section: NavSection;
  items: ProcessedNavItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

const Section: React.FC<SectionProps> = ({
  section,
  items,
  isExpanded,
  onToggle,
  onNavigate,
}) => {
  // Don't render empty sections
  if (items.length === 0) return null;

  const hasCollapsibleHeader = section.collapsible;

  return (
    <div className="border-b last:border-b-0">
      {hasCollapsibleHeader ? (
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-accent/50 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {section.label}
        </button>
      ) : (
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {section.label}
        </div>
      )}

      {isExpanded && (
        <nav className="space-y-1 px-2 pb-3">
          {items.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              path={item.path}
              icon={item.icon}
              disabled={item.disabled}
              badge={item.badge}
              onClick={onNavigate}
            />
          ))}
        </nav>
      )}
    </div>
  );
};

// ============================================================================
// Sidebar Component
// ============================================================================

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roleHierarchy, user, hasPermission: hasGlobalPermission, departmentHierarchy } = useAuthStore();
  const {
    selectedDepartmentId,
    setSelectedDepartment,
    clearDepartmentSelection,
    rememberDepartment,
    lastAccessedDepartments,
    isSidebarOpen,
    setSidebarOpen,
    isBreadcrumbMode,
    navigateToDepartment,
  } = useNavigationStore();
  const {
    hasPermission: hasDeptPermission,
    switchDepartment,
    isSwitching,
    switchError,
  } = useDepartmentContext();

  // Section expansion state
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    overview: true,
    primary: true,
    secondary: false,
    insights: false,
    department: false,
    footer: true,
  });

  // Auto-expand department section when switching
  React.useEffect(() => {
    if (isSwitching) {
      setExpandedSections((prev) => ({ ...prev, department: true }));
    }
  }, [isSwitching]);

  // Guard: Must have auth data
  if (!roleHierarchy || !user) {
    return null;
  }

  // ================================================================
  // Detect Current Dashboard Context
  // ================================================================

  const currentDashboard = useMemo((): DashboardType => {
    const pathSegments = location.pathname.split('/');
    const dashboard = pathSegments[1] as DashboardType;
    if (['learner', 'staff', 'admin'].includes(dashboard)) {
      return dashboard;
    }
    return 'staff'; // Default
  }, [location.pathname]);

  // Fetch unread message count for learners
  const { data: unreadCountData } = useUnreadCount({
    enabled: currentDashboard === 'learner',
  });

  // ================================================================
  // Get Sections for Current Dashboard
  // ================================================================

  const sections = useMemo(() => {
    return getSectionsForDashboard(currentDashboard);
  }, [currentDashboard]);

  // ================================================================
  // Process Section Items with Permission Checks
  // ================================================================

  const processItems = (items: NavItem[]): ProcessedNavItem[] => {
    return items.map((item) => {
      let disabled = false;
      let badge: string | number | undefined = undefined;

      if (item.requiredPermission) {
        if (item.departmentScoped) {
          disabled = !hasDeptPermission(item.requiredPermission);
        } else {
          disabled = !hasGlobalPermission(item.requiredPermission);
        }
      }

      // Add unread count badge for inbox link
      if (item.id === 'learner-inbox' && unreadCountData?.total) {
        badge = unreadCountData.total > 99 ? '99+' : unreadCountData.total;
      }

      return { ...item, disabled, badge };
    });
  };

  const overviewItems = useMemo(
    () => processItems(sections.overview.items),
    [sections, hasDeptPermission, hasGlobalPermission, unreadCountData]
  );
  const primaryItems = useMemo(
    () => processItems(sections.primary.items),
    [sections, hasDeptPermission, hasGlobalPermission, unreadCountData]
  );
  const secondaryItems = useMemo(
    () => processItems(sections.secondary.items),
    [sections, hasDeptPermission, hasGlobalPermission, unreadCountData]
  );
  const insightsItems = useMemo(
    () => processItems(sections.insights.items),
    [sections, hasDeptPermission, hasGlobalPermission, unreadCountData]
  );
  const footerItems = useMemo(
    () => processItems(sections.footer.items),
    [sections, hasDeptPermission, hasGlobalPermission, unreadCountData]
  );

  // ================================================================
  // Get User's Departments (with root filtering for non-global-admin)
  // ================================================================

  // Find the root department ID from hierarchy
  // Root department is a key that never appears as a child value
  const rootDepartmentId = useMemo(() => {
    if (!departmentHierarchy || Object.keys(departmentHierarchy).length === 0) {
      return null;
    }

    // Collect all child IDs
    const allChildIds = new Set<string>();
    for (const children of Object.values(departmentHierarchy)) {
      for (const childId of children) {
        allChildIds.add(childId);
      }
    }

    // Find parent that is never a child (root department)
    for (const parentId of Object.keys(departmentHierarchy)) {
      if (!allChildIds.has(parentId)) {
        return parentId;
      }
    }

    return null;
  }, [departmentHierarchy]);

  // Check if user is global-admin (can see root department)
  const isGlobalAdmin = useMemo(() => {
    return roleHierarchy.allUserTypes?.includes('global-admin' as UserType) ?? false;
  }, [roleHierarchy]);

  const userDepartments: UserDepartment[] = useMemo(() => {
    const departments: UserDepartment[] = [];

    // Helper: Strip "System-Admin > " or similar root prefix from department names
    const formatDepartmentName = (name: string): string => {
      if (isGlobalAdmin) {
        // Global admins see the full hierarchy path
        return name;
      }
      // For non-global-admin users, strip "RootName > " prefix if present
      // Common patterns: "System-Admin > X", "Root > X"
      const prefixMatch = name.match(/^[^>]+>\s*/);
      if (prefixMatch) {
        return name.substring(prefixMatch[0].length);
      }
      return name;
    };

    if (roleHierarchy.staffRoles) {
      for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
        // Skip root department for non-global-admin users
        if (!isGlobalAdmin && rootDepartmentId && deptGroup.departmentId === rootDepartmentId) {
          continue;
        }

        departments.push({
          id: deptGroup.departmentId,
          name: formatDepartmentName(deptGroup.departmentName),
          isPrimary: deptGroup.isPrimary,
          type: 'staff',
        });
      }
    }

    if (roleHierarchy.learnerRoles) {
      for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
        // Skip root department for non-global-admin users
        if (!isGlobalAdmin && rootDepartmentId && deptGroup.departmentId === rootDepartmentId) {
          continue;
        }

        departments.push({
          id: deptGroup.departmentId,
          name: formatDepartmentName(deptGroup.departmentName),
          isPrimary: false,
          type: 'learner',
        });
      }
    }

    return departments;
  }, [roleHierarchy, rootDepartmentId, isGlobalAdmin]);

  // ================================================================
  // Auto-Select Last Accessed Department (only on initial mount)
  // ================================================================

  // Track if initial auto-selection logic has run to prevent re-selecting after user clears
  const initialAutoSelectDoneRef = React.useRef(false);

  React.useEffect(() => {
    if (!user || userDepartments.length === 0) return;

    // Only run auto-selection logic once on initial mount
    if (initialAutoSelectDoneRef.current) return;

    // If already selected, mark as done
    if (selectedDepartmentId) {
      initialAutoSelectDoneRef.current = true;
      return;
    }

    // Try to auto-select last accessed department
    const lastDept = lastAccessedDepartments[user._id];
    if (lastDept && userDepartments.some((d) => d.id === lastDept)) {
      setSelectedDepartment(lastDept);
    }

    // Mark as done regardless of whether we selected
    initialAutoSelectDoneRef.current = true;
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

      // If currently on a department-scoped page, navigate to the same page type for the new department
      const deptPageMatch = location.pathname.match(/^\/(staff|learner)\/departments\/([^/]+)\/(.+)$/);
      if (deptPageMatch) {
        const [, userType, , pagePath] = deptPageMatch;
        navigate(`/${userType}/departments/${deptId}/${pagePath}`);
      }
    } catch (error) {
      console.error('[Sidebar] Failed to switch department:', error);
    }
  };

  // ================================================================
  // Department Actions (Flat list)
  // ================================================================

  const departmentActions = useMemo(() => {
    if (!selectedDepartmentId) return [];

    const actions = getDepartmentActionsForDashboard(currentDashboard);

    return actions
      .filter((action) => hasDeptPermission(action.requiredPermission))
      .map((action) => ({
        ...action,
        path: buildDepartmentActionPath(action.pathTemplate, selectedDepartmentId),
      }));
  }, [selectedDepartmentId, currentDashboard, hasDeptPermission]);

  // ================================================================
  // Toggle Section Expansion
  // ================================================================

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const closeSidebar = () => setSidebarOpen(false);

  // ================================================================
  // Render
  // ================================================================

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
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
          <button onClick={closeSidebar} className="p-1 hover:bg-accent rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* OVERVIEW Section */}
          <Section
            section={sections.overview}
            items={overviewItems}
            isExpanded={expandedSections.overview}
            onToggle={() => toggleSection('overview')}
            onNavigate={closeSidebar}
          />

          {/* PRIMARY Section */}
          <Section
            section={sections.primary}
            items={primaryItems}
            isExpanded={expandedSections.primary}
            onToggle={() => toggleSection('primary')}
            onNavigate={closeSidebar}
          />

          {/* SECONDARY Section */}
          <Section
            section={sections.secondary}
            items={secondaryItems}
            isExpanded={expandedSections.secondary}
            onToggle={() => toggleSection('secondary')}
            onNavigate={closeSidebar}
          />

          {/* INSIGHTS Section */}
          <Section
            section={sections.insights}
            items={insightsItems}
            isExpanded={expandedSections.insights}
            onToggle={() => toggleSection('insights')}
            onNavigate={closeSidebar}
          />

          {/* DEPARTMENT Section */}
          {userDepartments.length > 0 && (
            <div className="border-b">
              <button
                onClick={() => toggleSection('department')}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-accent/50 transition-colors"
              >
                {expandedSections.department ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Departments
              </button>

              {expandedSections.department && (
                <>
                  {switchError && (
                    <div className="mx-2 mb-2 px-3 py-2 text-xs bg-destructive/10 text-destructive rounded-md">
                      {switchError}
                    </div>
                  )}

                  {/* Department Selector (List mode) */}
                  {!selectedDepartmentId && (
                    <div className="space-y-1 px-2 pb-2">
                      {userDepartments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => handleDepartmentClick(dept.id)}
                          disabled={isSwitching}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                            'hover:bg-accent text-muted-foreground',
                            isSwitching && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {isSwitching ? (
                            <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                          ) : (
                            <Folder className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="flex-1 text-left truncate">{dept.name}</span>
                          {dept.isPrimary && (
                            <Badge variant="secondary" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Breadcrumb Navigation (when department selected) */}
                  {selectedDepartmentId && isBreadcrumbMode && (
                    <DepartmentBreadcrumbSelector
                      selectedDepartmentId={selectedDepartmentId}
                      onSelectDepartment={async (deptId) => {
                        try {
                          await switchDepartment(deptId);
                          if (user) {
                            rememberDepartment(user._id, deptId);
                          }
                          navigateToDepartment(deptId);

                          // If currently on a department-scoped page, navigate to the same page type for the new department
                          const deptPageMatch = location.pathname.match(/^\/(staff|learner)\/departments\/([^/]+)\/(.+)$/);
                          if (deptPageMatch) {
                            const [, userType, , pagePath] = deptPageMatch;
                            navigate(`/${userType}/departments/${deptId}/${pagePath}`);
                          }
                        } catch (error) {
                          console.error('[Sidebar] Failed to switch department:', error);
                        }
                      }}
                      onClearSelection={() => {
                        clearDepartmentSelection();
                      }}
                      rootDepartmentId={rootDepartmentId}
                      isGlobalAdmin={isGlobalAdmin}
                      isLoading={isSwitching}
                    />
                  )}

                  {/* Selected Department Header (when not in breadcrumb mode) */}
                  {selectedDepartmentId && !isBreadcrumbMode && (
                    <div className="px-2 pb-2">
                      <button
                        onClick={() => setSelectedDepartment(null)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground"
                      >
                        <Folder className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">
                          {userDepartments.find((d) => d.id === selectedDepartmentId)?.name}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Department Actions (Flat list) */}
                  {selectedDepartmentId && departmentActions.length > 0 && (
                    <div className="border-t">
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Actions
                      </div>
                      <nav className="space-y-1 px-2 pb-3">
                        {departmentActions.map((action) => (
                          <NavLink
                            key={action.id}
                            label={action.label}
                            path={action.path}
                            icon={action.icon}
                            onClick={closeSidebar}
                          />
                        ))}
                      </nav>
                    </div>
                  )}

                  {selectedDepartmentId && departmentActions.length === 0 && (
                    <div className="px-4 py-4 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No actions available
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER Section (Fixed at bottom) */}
        <div className="flex-shrink-0 border-t">
          <nav className="space-y-1 p-2">
            {footerItems.map((item) => (
              <NavLink
                key={item.id}
                label={item.label}
                path={item.path}
                icon={item.icon}
                disabled={item.disabled}
                onClick={closeSidebar}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
