/**
 * React Query keys for department queries
 * Organized hierarchically for efficient cache invalidation
 */

import type {
  DepartmentListParams,
  DepartmentHierarchyParams,
  DepartmentProgramsParams,
  DepartmentStaffParams,
  DepartmentStatsParams,
} from './types';

export const departmentKeys = {
  all: ['departments'] as const,

  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params?: DepartmentListParams) => [...departmentKeys.lists(), params] as const,

  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,

  hierarchies: () => [...departmentKeys.all, 'hierarchy'] as const,
  hierarchy: (id: string, params?: DepartmentHierarchyParams) =>
    [...departmentKeys.hierarchies(), id, params] as const,

  programs: () => [...departmentKeys.all, 'programs'] as const,
  departmentPrograms: (id: string, params?: DepartmentProgramsParams) =>
    [...departmentKeys.programs(), id, params] as const,

  staff: () => [...departmentKeys.all, 'staff'] as const,
  departmentStaff: (id: string, params?: DepartmentStaffParams) =>
    [...departmentKeys.staff(), id, params] as const,

  stats: () => [...departmentKeys.all, 'stats'] as const,
  departmentStats: (id: string, params?: DepartmentStatsParams) =>
    [...departmentKeys.stats(), id, params] as const,
};
