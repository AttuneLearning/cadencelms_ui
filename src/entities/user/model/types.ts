/**
 * User Entity Types
 * Represents a user in the LMS
 */

export type Role = 'learner' | 'staff' | 'global-admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
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
  roles: Role[];
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles: Role[];
  status: UserStatus;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
}

export interface UserFilters {
  search?: string;
  role?: Role;
  status?: UserStatus;
}
