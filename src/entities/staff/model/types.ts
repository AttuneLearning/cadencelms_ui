/**
 * Staff Entity Types
 * Represents a staff member in the LMS - Role System V2
 */

import type { DepartmentMembership as SharedDepartmentMembership } from '@/shared/types/auth';

/**
 * Department membership type (V2 - use shared type)
 * Re-exported for backward compatibility
 */
export type DepartmentMembership = SharedDepartmentMembership;

/**
 * Staff roles available in the system
 */
export type StaffRole = 'instructor' | 'content-admin' | 'department-admin' | 'billing-admin';

/**
 * Legacy department membership structure (deprecated)
 */
export interface LegacyDepartmentMembership {
  departmentId: string;
  roles: StaffRole[];
  isPrimary: boolean;
}

export type StaffStatus = 'active' | 'inactive';

/**
 * Staff Profile (V2)
 * Aligned with backend StaffProfile model
 */
export interface StaffProfile {
  _id: string;
  userId: string;
  employeeId?: string;
  title?: string;

  /** Department memberships with roles and access rights (V2) */
  departmentMemberships: DepartmentMembership[];

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Staff entity (legacy/UI view)
 * Used in staff management UI - may contain joined user data
 */
export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  title?: string;

  /** Department memberships (V2) */
  departmentMemberships: DepartmentMembership[];

  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Related User fields (from join)
  email?: string;
  roles?: string[];
  userId?: string;
  employeeId?: string;
}

/**
 * Staff list item for UI display
 */
export interface StaffListItem {
  _id: string;
  id?: string; // Alias for _id for backward compatibility
  firstName: string;
  lastName: string;
  title?: string;

  /** Department memberships (V2) */
  departmentMemberships: DepartmentMembership[];

  isActive: boolean;
  email?: string;
  createdAt: string;

  // Computed/joined fields for UI
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    code?: string;
  };
  role?: string;
  status?: 'active' | 'inactive';
  phone?: string;
  phoneNumber?: string;
  updatedAt?: string;
  employeeId?: string;
}

export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  title?: string;
  departmentMemberships: DepartmentMembership[];
  isActive: boolean;
}

export interface StaffFilters {
  search?: string;
  departmentId?: string;
  role?: StaffRole;
  isActive?: boolean;
  department?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface StaffListResponse {
  staff: StaffListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
