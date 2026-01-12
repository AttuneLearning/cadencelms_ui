/**
 * Department List Component
 * Displays a list or grid of departments with hierarchy support
 */

import { useState } from 'react';
import { DepartmentCard } from './DepartmentCard';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react';
import type { DepartmentListItem, DepartmentHierarchyNode } from '../model/types';

interface DepartmentListProps {
  departments: DepartmentListItem[];
  variant?: 'grid' | 'list';
  emptyMessage?: string;
  isLoading?: boolean;
  onDepartmentClick?: (department: DepartmentListItem) => void;
}

export function DepartmentList({
  departments,
  variant = 'grid',
  emptyMessage = 'No departments found',
  isLoading = false,
  onDepartmentClick,
}: DepartmentListProps) {
  if (isLoading) {
    return (
      <div
        className={
          variant === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <DepartmentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={
        variant === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-4'
      }
    >
      {departments.map((department) => (
        <DepartmentCard
          key={department.id}
          department={department}
          onClick={onDepartmentClick ? () => onDepartmentClick(department) : undefined}
        />
      ))}
    </div>
  );
}

interface DepartmentHierarchyListProps {
  nodes: DepartmentHierarchyNode[];
  level?: number;
  onNodeClick?: (node: DepartmentHierarchyNode) => void;
}

export function DepartmentHierarchyList({
  nodes,
  level = 0,
  onNodeClick,
}: DepartmentHierarchyListProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <DepartmentHierarchyNode
          key={node.id}
          node={node}
          level={level}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  );
}

interface DepartmentHierarchyNodeProps {
  node: DepartmentHierarchyNode;
  level: number;
  onNodeClick?: (node: DepartmentHierarchyNode) => void;
}

function DepartmentHierarchyNode({
  node,
  level,
  onNodeClick,
}: DepartmentHierarchyNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-md p-2 hover:bg-accent transition-colors"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <Button
          variant="ghost"
          className="flex-1 justify-start gap-2 h-auto py-2"
          onClick={() => onNodeClick?.(node)}
        >
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{node.name}</span>
          <span className="text-sm text-muted-foreground">({node.code})</span>
          {node.status === 'inactive' && (
            <span className="ml-auto text-xs text-muted-foreground">Inactive</span>
          )}
          {hasChildren && (
            <span className="ml-auto text-xs text-muted-foreground">
              {node.childCount} {node.childCount === 1 ? 'child' : 'children'}
            </span>
          )}
        </Button>
      </div>

      {isExpanded && hasChildren && (
        <DepartmentHierarchyList
          nodes={node.children}
          level={level + 1}
          onNodeClick={onNodeClick}
        />
      )}
    </div>
  );
}

function DepartmentCardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
