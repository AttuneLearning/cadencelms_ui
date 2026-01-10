/**
 * Learner Entity Types
 * Represents a learner in the LMS
 */

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

export interface Learner {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Related User fields (from join)
  email?: string;
  roles?: string[];
}

export interface LearnerListItem {
  _id: string;
  id?: string; // Alias for _id for backward compatibility
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  email?: string;
  createdAt: string;
  studentId?: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  status?: 'active' | 'inactive' | 'graduated';
  enrollmentCount?: number;
  updatedAt?: string;
}

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
