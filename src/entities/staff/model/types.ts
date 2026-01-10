/**
 * Staff Entity Types
 * Represents a staff member in the LMS
 */

export interface DepartmentMembership {
  departmentId: string;
  roles: StaffRole[];
  isPrimary: boolean;
}

export type StaffRole = 'instructor' | 'content-admin' | 'department-admin' | 'billing-admin';

export type StaffStatus = 'active' | 'inactive';

export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  title?: string;
  departmentMemberships: DepartmentMembership[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Related User fields (from join)
  email?: string;
  roles?: string[];
}

export interface StaffListItem {
  _id: string;
  id?: string; // Alias for _id for backward compatibility
  firstName: string;
  lastName: string;
  title?: string;
  departmentMemberships: DepartmentMembership[];
  isActive: boolean;
  email?: string;
  createdAt: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    code?: string;
  };
  role?: string;
  status?: 'active' | 'inactive';
  phone?: string;
  updatedAt?: string;
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
