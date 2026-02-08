/**
 * Department Breadcrumb Selector Component
 * Navigation Redesign Phase 2 - 2026-02-05
 *
 * Provides flat navigation to departments via breadcrumb trail.
 * Replaces nested accordion navigation with 1-2 click access.
 *
 * Features:
 * - Shows current department path (ancestors + current)
 * - Click any ancestor to navigate up
 * - Shows children for drill-down
 * - Integrates with useDepartmentHierarchy hook
 */

import React, { useMemo } from 'react';
import { ChevronRight, Home, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { useDepartmentHierarchy } from '@/entities/department/model/useDepartment';
import { cn } from '@/shared/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface DepartmentBreadcrumbSelectorProps {
  /** Currently selected department ID */
  selectedDepartmentId: string;
  /** Callback when a department is selected */
  onSelectDepartment: (departmentId: string) => void;
  /** Callback to clear selection and return to department list */
  onClearSelection?: () => void;
  /** Root department ID to filter from breadcrumbs (for non-global-admin) */
  rootDepartmentId?: string | null;
  /** Whether user is global admin (can see root in breadcrumbs) */
  isGlobalAdmin?: boolean;
  /** Optional class name */
  className?: string;
  /** Whether selection is in progress (loading state) */
  isLoading?: boolean;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  level: number;
}

// ============================================================================
// Component
// ============================================================================

export const DepartmentBreadcrumbSelector: React.FC<DepartmentBreadcrumbSelectorProps> = ({
  selectedDepartmentId,
  onSelectDepartment,
  onClearSelection,
  rootDepartmentId,
  isGlobalAdmin = false,
  className,
  isLoading = false,
}) => {
  // Fetch hierarchy for the selected department
  const {
    data: hierarchy,
    isLoading: isLoadingHierarchy,
    error,
  } = useDepartmentHierarchy(selectedDepartmentId, { depth: 1 });

  // Build breadcrumb trail from ancestors + current (filtering root for non-global-admin)
  const breadcrumbTrail: BreadcrumbItem[] = useMemo(() => {
    if (!hierarchy) return [];

    const trail: BreadcrumbItem[] = [];

    // Add ancestors (filter out root department for non-global-admin)
    hierarchy.ancestors.forEach((ancestor) => {
      // Skip root department for non-global-admin users
      if (!isGlobalAdmin && rootDepartmentId && ancestor.id === rootDepartmentId) {
        return;
      }
      trail.push({
        id: ancestor.id,
        name: ancestor.name,
        level: ancestor.level,
      });
    });

    // Add current department (unless it's the root and user is not global admin)
    if (isGlobalAdmin || !rootDepartmentId || hierarchy.current.id !== rootDepartmentId) {
      trail.push({
        id: hierarchy.current.id,
        name: hierarchy.current.name,
        level: hierarchy.current.level,
      });
    }

    return trail;
  }, [hierarchy, rootDepartmentId, isGlobalAdmin]);

  // Get children for drill-down
  const children = hierarchy?.children ?? [];

  const loading = isLoading || isLoadingHierarchy;

  // Error state
  if (error) {
    return (
      <div className={cn('text-xs text-destructive px-3 py-2', className)}>
        Failed to load department hierarchy
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Breadcrumb Trail */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-1 text-xs">
        {/* Home icon - returns to department list */}
        <button
          onClick={() => {
            if (onClearSelection) {
              onClearSelection();
            }
          }}
          disabled={loading}
          className={cn(
            'p-1 rounded hover:bg-accent transition-colors',
            loading && 'opacity-50 cursor-not-allowed'
          )}
          title="Back to department list"
        >
          <Home className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Breadcrumb items */}
        {breadcrumbTrail.map((item) => {
          const isCurrent = item.id === selectedDepartmentId;

          return (
            <React.Fragment key={item.id}>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <button
                onClick={() => !isCurrent && onSelectDepartment(item.id)}
                disabled={loading || isCurrent}
                className={cn(
                  'px-1.5 py-0.5 rounded text-xs transition-colors truncate max-w-[100px]',
                  isCurrent
                    ? 'font-medium text-foreground bg-accent/50'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                title={item.name}
              >
                {item.name}
              </button>
            </React.Fragment>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <Loader2 className="h-3 w-3 ml-1 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Children (for drill-down) */}
      {children.length > 0 && (
        <div className="border-t pt-2">
          <div className="px-3 pb-1 text-xs text-muted-foreground">
            Sub-departments
          </div>
          <div className="space-y-0.5 px-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => onSelectDepartment(child.id)}
                disabled={loading}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
                  'hover:bg-accent text-muted-foreground hover:text-foreground',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {child.hasChildren ? (
                  <FolderOpen className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="flex-1 text-left truncate">{child.name}</span>
                {child.hasChildren && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No children message */}
      {hierarchy && children.length === 0 && (
        <div className="px-3 py-2 text-xs text-muted-foreground italic">
          No sub-departments
        </div>
      )}
    </div>
  );
};

export default DepartmentBreadcrumbSelector;
