/**
 * User Entity Types
 * Represents a user in the LMS - Role System V2
 */

import type { UserType, DashboardType } from '@/shared/types/auth';

// Legacy Role type (deprecated - use UserType from @/shared/types/auth)
export type Role = 'learner' | 'staff' | 'global-admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

/**
 * User entity - V2 with userTypes and department context
 */
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;

  /** User types this user has (V2) - can have multiple */
  userTypes: UserType[];

  /** Default dashboard to show on login (V2) */
  defaultDashboard: DashboardType;

  /** Last selected department ID for UX persistence (V2) */
  lastSelectedDepartment?: string | null;

  /** Legacy roles field (deprecated - use userTypes) */
  roles?: Role[];

  status: UserStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLogin?: string | null;
  avatar?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
}

export interface UserListItem {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;

  /** User types (V2) */
  userTypes: UserType[];

  /** Default dashboard (V2) */
  defaultDashboard?: DashboardType;

  /** Legacy roles field (deprecated) */
  roles?: Role[];

  status: UserStatus;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;

  /** User types (V2) */
  userTypes: UserType[];

  /** Default dashboard (V2) */
  defaultDashboard?: DashboardType;

  /** Legacy roles field (deprecated) */
  roles?: Role[];

  status: UserStatus;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
}

export interface UserFilters {
  search?: string;

  /** Filter by user type (V2) */
  userType?: UserType;

  /** Legacy role filter (deprecated) */
  role?: Role;

  status?: UserStatus;
}
