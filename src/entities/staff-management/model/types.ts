/**
 * Staff Management Entity Types
 * Generated from: /contracts/api/staff.contract.ts v1.0.0
 *
 * Types for staff user management matching backend contract.
 */

export type StaffRole = 'instructor' | 'content-admin' | 'enrollment-admin' | 'dept-admin';
export type StaffStatus = 'active' | 'inactive' | 'withdrawn';
export type DefaultDashboard = 'content-admin' | 'instructor' | 'analytics';

/**
 * Department assignment for staff member
 */
export interface StaffDepartmentAssignment {
  departmentId: string;
  departmentName: string;
  roleInDepartment: string;
}

/**
 * Staff User Profile
 * Represents a staff member with department assignments and permissions
 */
export interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'staff';
  departments: StaffDepartmentAssignment[];
  permissions: string[];
  defaultDashboard?: string;
  isActive: boolean;
  status: StaffStatus;
  profileImage?: string | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt?: string;
  metadata?: {
    coursesCreated: number;
    coursesManaged: number;
    contentCreated: number;
    lastActivityAt: string | null;
  };
}

/**
 * Pagination metadata for list responses
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Staff list query parameters
 */
export interface StaffListParams {
  page?: number;
  limit?: number;
  department?: string;
  role?: StaffRole;
  status?: StaffStatus;
  search?: string;
  sort?: string;
}

/**
 * Staff list response
 */
export interface StaffListResponse {
  staff: Staff[];
  pagination: Pagination;
}

/**
 * Department assignment for registration/update
 */
export interface DepartmentAssignment {
  departmentId: string;
  role: StaffRole;
}

/**
 * Register new staff user payload
 */
export interface RegisterStaffPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentAssignments: DepartmentAssignment[];
  defaultDashboard?: DefaultDashboard;
  isActive?: boolean;
}

/**
 * Update staff user payload
 */
export interface UpdateStaffPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  defaultDashboard?: DefaultDashboard;
  isActive?: boolean;
  profileImage?: string | null;
}

/**
 * Update department assignments payload
 */
export interface UpdateDepartmentsPayload {
  action: 'add' | 'remove' | 'update' | 'replace';
  departmentAssignments: DepartmentAssignment[];
}

/**
 * Delete staff response
 */
export interface DeleteStaffResponse {
  id: string;
  status: 'withdrawn';
  deletedAt: string;
}

/**
 * Update departments response
 */
export interface UpdateDepartmentsResponse {
  id: string;
  departments: StaffDepartmentAssignment[];
  permissions: string[];
  updatedAt: string;
}
