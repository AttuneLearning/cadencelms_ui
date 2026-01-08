/**
 * User Entity Types
 * Represents system users (students, instructors, admins)
 */

export type UserRole = 'student' | 'instructor' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  lastLoginAt?: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  status?: UserStatus;
  department?: string;
  bio?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  department?: string;
}
