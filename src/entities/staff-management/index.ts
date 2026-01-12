/**
 * Staff Management Entity - Public API
 */

// Types
export type {
  Staff,
  StaffRole,
  StaffStatus,
  DefaultDashboard,
  StaffDepartmentAssignment,
  Pagination,
  StaffListParams,
  StaffListResponse,
  DepartmentAssignment,
  RegisterStaffPayload,
  UpdateStaffPayload,
  UpdateDepartmentsPayload,
  DeleteStaffResponse,
  UpdateDepartmentsResponse,
} from './model/types';

// Hooks
export {
  useStaffList,
  useStaff,
  useRegisterStaff,
  useUpdateStaff,
  useDeleteStaff,
  useUpdateStaffDepartments,
} from './model/useStaff';
export { staffKeys } from './model/staffKeys';

// API (for advanced use cases)
export * as staffApi from './api/staffApi';

// UI Components
export { StaffCard } from './ui/StaffCard';
export { StaffList } from './ui/StaffList';
export { StaffForm } from './ui/StaffForm';
