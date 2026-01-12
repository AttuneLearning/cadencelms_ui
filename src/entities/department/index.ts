/**
 * Department Entity - Public API
 * Generated from: departments.contract.ts v1.0.0
 */

// Types
export type {
  Department,
  DepartmentStatus,
  DepartmentListItem,
  DepartmentDetails,
  DepartmentListParams,
  DepartmentListResponse,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentHierarchy,
  DepartmentHierarchyNode,
  DepartmentHierarchyParams,
  DepartmentProgram,
  DepartmentProgramsParams,
  DepartmentProgramsResponse,
  DepartmentStaffMember,
  DepartmentStaffParams,
  DepartmentStaffResponse,
  DepartmentStats,
  DepartmentStatsParams,
  Pagination,
} from './model/types';

// Hooks
export {
  useDepartments,
  useDepartment,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useDepartmentHierarchy,
  useDepartmentPrograms,
  useDepartmentStaff,
  useDepartmentStats,
} from './model/useDepartment';

export { departmentKeys } from './model/departmentKeys';

// API (for advanced use cases)
export * as departmentApi from './api/departmentApi';

// UI Components
export { DepartmentCard } from './ui/DepartmentCard';
export { DepartmentList, DepartmentHierarchyList } from './ui/DepartmentList';
export { DepartmentForm } from './ui/DepartmentForm';
