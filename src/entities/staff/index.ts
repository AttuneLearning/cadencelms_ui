/**
 * Staff Entity - Public API
 * Updated for Role System V2
 */

export * from './api/staffApi';
export * from './hooks';
export * from './ui';
export type {
  Staff,
  StaffProfile,
  StaffListItem,
  StaffFormData,
  StaffFilters,
  StaffRole,
  StaffStatus,
  DepartmentMembership,
  LegacyDepartmentMembership,
} from './model/types';
