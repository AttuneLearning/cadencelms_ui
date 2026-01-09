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
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  email?: string;
  createdAt: string;
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
}
