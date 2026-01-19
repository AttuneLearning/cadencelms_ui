/**
 * User Entity - Public API
 * Updated for Role System V2
 */

export { userApi } from './api/userApi';
export { staffApi } from './api/staffApi';
export type { StaffListParams, StaffListResponse, DepartmentRoleUpdate } from './api/staffApi';
export * from './hooks';
export type {
  User,
  UserListItem,
  UserFormData,
  UserFilters,
  Role,
  UserStatus,
  StaffDepartment,
} from './model/types';
export { UserAvatar, UserProfileCard, UserProfileForm } from './ui';

// Re-export shared auth types for convenience
export type { UserType, DashboardType } from '@/shared/types/auth';
