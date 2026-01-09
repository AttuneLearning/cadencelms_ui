/**
 * User Profile Entity Types
 * Generated from: /contracts/api/users.contract.ts v1.0.0
 *
 * Unified user profile types matching backend contract.
 * Role-specific fields are conditionally present based on user role.
 */

export type UserRole = 'global-admin' | 'staff' | 'learner';
export type UserStatus = 'active' | 'inactive' | 'withdrawn';

/**
 * Department role assignment for staff members
 */
export interface DepartmentRole {
  departmentId: string;
  role: string;
}

/**
 * Base User Profile
 * Unified profile for any authenticated user
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;

  // Staff-only fields (present when role === 'staff')
  departments?: string[];
  permissions?: string[];
  departmentRoles?: DepartmentRole[];

  // Learner-only fields (present when role === 'learner')
  studentId?: string;
  programEnrollments?: string[];
  courseEnrollments?: string[];

  // Common optional fields
  profileImage: string | null;
  phone: string | null;

  // Metadata
  createdAt: string;
  lastLoginAt: string | null;
  updatedAt: string;
}

/**
 * Update Profile Payload
 * Fields that users can modify in their own profile
 */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string | null;
}

/**
 * Department Summary (from /users/me/departments)
 */
export interface UserDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  // Role in this department
  userRole?: string;
}
