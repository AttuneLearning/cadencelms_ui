/**
 * Learner Entity Types
 * Represents a learner in the LMS - Role System V2
 */

import type { DepartmentMembership } from '@/shared/types/auth';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
}

/**
 * Learner Profile (V2)
 * Aligned with backend LearnerProfile model
 */
export interface LearnerProfile {
  _id: string;
  userId: string;
  studentId?: string;

  /** Department memberships with roles and access rights (V2) */
  departmentMemberships: DepartmentMembership[];

  /** Global learner role (optional) */
  globalLearnerRole?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Learner entity (legacy/UI view)
 * Used in learner management UI - may contain joined user data
 */
export interface Learner {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;

  /** Department memberships (V2) */
  departmentMemberships?: DepartmentMembership[];

  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Related User fields (from join)
  email?: string;
  roles?: string[];
  userId?: string;
  studentId?: string;
}

/**
 * Learner list item for UI display
 */
export interface LearnerListItem {
  _id: string;
  id?: string; // Alias for _id for backward compatibility
  firstName: string;
  lastName: string;
  phoneNumber?: string;

  /** Department memberships (V2) */
  departmentMemberships?: DepartmentMembership[];

  isActive: boolean;
  email?: string;
  createdAt: string;
  studentId?: string;

  // Computed/joined fields for UI
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  status?: 'active' | 'inactive' | 'graduated';
  enrollmentCount?: number;
  updatedAt?: string;
}

/**
 * Learner form data for creating/updating learners
 */
export interface LearnerFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  isActive: boolean;
  studentId?: string;

  /** Department memberships (V2) */
  departmentMemberships?: DepartmentMembership[];
}

export interface LearnerFilters {
  search?: string;
  isActive?: boolean;
  department?: string;
  status?: 'active' | 'inactive' | 'graduated';
  page?: number;
  limit?: number;
}

export interface LearnersListResponse {
  learners: LearnerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
