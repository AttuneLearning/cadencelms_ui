/**
 * Department Entity Types
 * Generated from: /contracts/api/departments.contract.ts v1.0.0
 *
 * Types for department management, including hierarchical structure,
 * programs, staff assignments, and statistics.
 */

export type DepartmentStatus = 'active' | 'inactive';

/**
 * Base Department
 * Core department information used in list and hierarchy views
 */
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  status: DepartmentStatus;
  level: number;
  hasChildren: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Department List Item
 * Extended department info used in list views with metadata
 */
export interface DepartmentListItem extends Department {
  metadata: {
    totalStaff: number;
    totalPrograms: number;
    totalCourses: number;
  };
}

/**
 * Department Details
 * Full department information including relationships and metadata
 */
export interface DepartmentDetails extends Department {
  parent: {
    id: string;
    name: string;
    code: string;
  } | null;
  childCount: number;
  metadata: {
    totalStaff: number;
    totalPrograms: number;
    totalCourses: number;
    activeEnrollments: number;
  };
  createdBy: {
    id: string;
    name: string;
  } | null;
  updatedBy: {
    id: string;
    name: string;
  } | null;
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
 * Department List Query Parameters
 */
export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  status?: DepartmentStatus;
  sort?: string;
}

/**
 * Department List Response
 */
export interface DepartmentListResponse {
  departments: DepartmentListItem[];
  pagination: Pagination;
}

/**
 * Create Department Payload
 */
export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  status?: DepartmentStatus;
}

/**
 * Update Department Payload
 */
export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  description?: string;
  parentId?: string | null;
  status?: DepartmentStatus;
}

/**
 * Department Hierarchy Node
 * Used in hierarchy tree structure
 */
export interface DepartmentHierarchyNode {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: DepartmentStatus;
  level: number;
  hasChildren: boolean;
  childCount: number;
  children: DepartmentHierarchyNode[];
}

/**
 * Department Hierarchy Response
 * Includes ancestors, current department, and descendants
 */
export interface DepartmentHierarchy {
  ancestors: {
    id: string;
    name: string;
    code: string;
    level: number;
  }[];
  current: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    parentId: string | null;
    status: DepartmentStatus;
    level: number;
    hasChildren: boolean;
  };
  children: DepartmentHierarchyNode[];
}

/**
 * Department Hierarchy Query Parameters
 */
export interface DepartmentHierarchyParams {
  depth?: number;
  includeInactive?: boolean;
}

/**
 * Department Program
 * Program information from department programs endpoint
 */
export interface DepartmentProgram {
  id: string;
  name: string;
  code: string;
  description: string | null;
  departmentId: string;
  departmentName: string;
  status: 'active' | 'inactive' | 'archived';
  levelCount: number;
  courseCount: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Department Programs Query Parameters
 */
export interface DepartmentProgramsParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'archived';
  includeChildDepartments?: boolean;
}

/**
 * Department Programs Response
 */
export interface DepartmentProgramsResponse {
  departmentId: string;
  departmentName: string;
  programs: DepartmentProgram[];
  pagination: Pagination;
}

/**
 * Department Staff Member
 * Staff information from department staff endpoint
 */
export interface DepartmentStaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  departmentRole: 'content-admin' | 'instructor' | 'observer';
  status: 'active' | 'inactive';
  assignedCourses: number;
  lastLogin: string | null;
  joinedDepartmentAt: string;
  permissions: string[];
}

/**
 * Department Staff Query Parameters
 */
export interface DepartmentStaffParams {
  page?: number;
  limit?: number;
  role?: 'content-admin' | 'instructor' | 'observer';
  status?: 'active' | 'inactive';
  search?: string;
}

/**
 * Department Staff Response
 */
export interface DepartmentStaffResponse {
  departmentId: string;
  departmentName: string;
  staff: DepartmentStaffMember[];
  pagination: Pagination;
}

/**
 * Department Statistics Query Parameters
 */
export interface DepartmentStatsParams {
  includeChildDepartments?: boolean;
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

/**
 * Department Statistics Response
 */
export interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  period: string;
  includesChildren: boolean;
  staff: {
    total: number;
    byRole: {
      contentAdmin: number;
      instructor: number;
      observer: number;
    };
    active: number;
    inactive: number;
  };
  programs: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    withdrawn: number;
    newThisPeriod: number;
    completedThisPeriod: number;
  };
  performance: {
    averageCompletionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    averageTimePerCourse: number;
  };
  topCourses: {
    courseId: string;
    courseName: string;
    enrollmentCount: number;
    completionRate: number;
    averageScore: number;
  }[];
}

/**
 * Department Form Data
 * Used for creating/updating departments in forms
 */
export interface DepartmentFormData extends CreateDepartmentPayload {
  // Extends CreateDepartmentPayload, can add additional UI-specific fields here if needed
}

/**
 * Department Filters
 * Used for filtering department lists
 */
export interface DepartmentFilters extends DepartmentListParams {
  // Extends DepartmentListParams, can add additional UI-specific filters here if needed
}
