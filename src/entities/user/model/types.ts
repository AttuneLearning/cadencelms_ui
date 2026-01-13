/**
 * User Entity Types
 * Represents a user in the LMS - Role System V2
 *
 * BREAKING CHANGES v2.0:
 * - Person data now nested in `person` object
 * - Flat fields (firstName, lastName, etc.) are deprecated
 */

import type { UserType, DashboardType } from '@/shared/types/auth';
import type { IPerson } from '@/shared/types/person';

// Legacy Role type (deprecated - use UserType from @/shared/types/auth)
export type Role = 'learner' | 'staff' | 'global-admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

/**
 * User entity - V2 with userTypes and department context
 * V2.0: Now includes nested person object
 */
export interface User {
  _id: string;
  email: string;

  // ⚠️ BREAKING CHANGE: Person data now nested ⚠️
  person: IPerson;

  // @deprecated Use person.firstName instead
  firstName: string;
  // @deprecated Use person.lastName instead
  lastName: string;
  // @deprecated Use person.avatar instead
  avatar?: string;
  // @deprecated Use person.phones[0].number instead
  phoneNumber?: string;

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
