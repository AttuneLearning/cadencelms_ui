/**
 * Academic Year Entity Types
 * Generated from: /contracts/api/academic-years.contract.ts v1.0.0
 *
 * Types for academic calendar management including years, terms, and cohorts.
 */

// =====================
// SHARED TYPES
// =====================

export type YearStatus = 'active' | 'past' | 'future';
export type TermStatus = 'active' | 'past' | 'future';
export type TermType = 'fall' | 'spring' | 'summer' | 'winter' | 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4' | 'custom';
export type CohortStatus = 'active' | 'graduated' | 'inactive';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// ACADEMIC YEAR TYPES
// =====================

/**
 * Academic Year - Core entity representing a full academic year
 */
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
  isCurrent: boolean;
  status: YearStatus;
  termCount: number;
  terms?: Term[]; // Only populated when includeTerms=true
  createdAt: string;
  updatedAt: string;
}

/**
 * Academic Year List Item - Compact version for list views
 */
export interface AcademicYearListItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: YearStatus;
  termCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Academic Year Payload
 */
export interface CreateYearPayload {
  name: string;
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
  isCurrent?: boolean;
}

/**
 * Update Academic Year Payload
 */
export interface UpdateYearPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

/**
 * Academic Year Query Filters
 */
export interface YearFilters {
  isCurrent?: boolean;
  status?: YearStatus;
  sort?: string;
  page?: number;
  limit?: number;
}

// =====================
// ACADEMIC TERM TYPES
// =====================

/**
 * Academic Term - Represents a term/semester within an academic year
 */
export interface Term {
  id: string;
  name: string;
  academicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  startDate: string;
  endDate: string;
  termType: TermType;
  status: TermStatus;
  classCount: number;
  classes?: TermClass[]; // Only populated when includeClasses=true
  createdAt: string;
  updatedAt: string;
}

/**
 * Term List Item - Compact version for list views
 */
export interface TermListItem {
  id: string;
  name: string;
  academicYear: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  termType: TermType;
  status: TermStatus;
  classCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Term Payload
 */
export interface CreateTermPayload {
  name: string;
  academicYear: string; // Academic year ID
  startDate: string;
  endDate: string;
  termType: TermType;
}

/**
 * Update Term Payload
 */
export interface UpdateTermPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  termType?: TermType;
}

/**
 * Term Query Filters
 */
export interface TermFilters {
  academicYear?: string;
  termType?: TermType;
  status?: TermStatus;
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Class reference in Term details
 */
export interface TermClass {
  id: string;
  name: string;
  course: {
    id: string;
    title: string;
  };
  startDate: string;
  endDate: string;
}

// =====================
// COHORT TYPES
// =====================

/**
 * Cohort - Represents a group of learners (year group/graduating class)
 */
export interface Cohort {
  id: string;
  name: string;
  code: string;
  academicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  program: {
    id: string;
    name: string;
    department?: {
      id: string;
      name: string;
    };
  };
  level?: string;
  startYear: number;
  endYear: number;
  status: CohortStatus;
  learnerCount: number;
  learners?: CohortLearner[]; // Only populated when includeLearners=true
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cohort List Item - Compact version for list views
 */
export interface CohortListItem {
  id: string;
  name: string;
  code: string;
  academicYear: {
    id: string;
    name: string;
  };
  program: {
    id: string;
    name: string;
  };
  level?: string;
  startYear: number;
  endYear: number;
  status: CohortStatus;
  learnerCount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Cohort Payload
 */
export interface CreateCohortPayload {
  name: string;
  code: string;
  academicYear: string; // Academic year ID
  program: string; // Program ID
  level?: string;
  startYear: number;
  endYear: number;
  description?: string;
}

/**
 * Update Cohort Payload
 */
export interface UpdateCohortPayload {
  name?: string;
  code?: string;
  academicYear?: string;
  level?: string;
  endYear?: number;
  status?: CohortStatus;
  description?: string;
}

/**
 * Cohort Query Filters
 */
export interface CohortFilters {
  academicYear?: string;
  program?: string;
  level?: string;
  status?: CohortStatus;
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Learner reference in Cohort details
 */
export interface CohortLearner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  enrolledAt: string;
}

// =====================
// API RESPONSE TYPES
// =====================

export interface YearsListResponse {
  years: AcademicYearListItem[];
  pagination: Pagination;
}

export interface TermsListResponse {
  terms: TermListItem[];
  pagination: Pagination;
}

export interface CohortsListResponse {
  cohorts: CohortListItem[];
  pagination: Pagination;
}

// =====================
// FORM DATA TYPES
// =====================

/**
 * Academic Year Form Data
 * Used for creating/updating academic years in forms
 */
export interface AcademicYearFormData {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  terms?: Term[];
  metadata?: Record<string, unknown>;
}

/**
 * Academic Year Filters
 * Used for filtering academic year lists
 */
export interface AcademicYearFilters extends YearFilters {
  // Extends YearFilters, can add additional UI-specific filters here if needed
}
