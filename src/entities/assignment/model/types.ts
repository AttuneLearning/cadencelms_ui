/**
 * Assignment Entity Types
 * Aligned with API-ISS-029 assignment submission contracts
 */

/**
 * Assignment submission types
 */
export type AssignmentSubmissionType = 'text' | 'file' | 'text_and_file';

/**
 * Submission status values
 */
export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned';

/**
 * Assignment definition (matches API Assignment schema)
 */
export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  instructions: string;
  submissionType: AssignmentSubmissionType;
  allowedFileTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  maxScore: number;
  maxResubmissions: number | null;
  isPublished: boolean;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * File attachment in submission (matches API file shape)
 */
export interface SubmissionFile {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Assignment submission (matches API AssignmentSubmission schema)
 */
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  learnerId: string;
  enrollmentId: string;
  submissionNumber: number;
  status: SubmissionStatus;
  textContent: string | null;
  files: SubmissionFile[];
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
  returnedAt: string | null;
  returnReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * API request types
 */

export interface ListAssignmentsParams {
  page?: number;
  limit?: number;
  courseId?: string;
  moduleId?: string;
}

export interface CreateAssignmentPayload {
  courseId: string;
  title: string;
  instructions: string;
  submissionType: AssignmentSubmissionType;
  maxScore: number;
  moduleId?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  maxResubmissions?: number;
}

export interface UpdateAssignmentPayload {
  title?: string;
  instructions?: string;
  submissionType?: AssignmentSubmissionType;
  maxScore?: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  maxResubmissions?: number | null;
  isPublished?: boolean;
}

export interface CreateSubmissionPayload {
  enrollmentId: string;
  textContent?: string;
  files?: SubmissionFile[];
}

export interface UpdateSubmissionPayload {
  textContent?: string;
  files?: SubmissionFile[];
}

export interface GradeSubmissionPayload {
  grade: number;
  feedback?: string;
}

export interface ReturnSubmissionPayload {
  returnReason: string;
}

export interface ListSubmissionsParams {
  learnerId?: string;
  status?: SubmissionStatus;
  page?: number;
  limit?: number;
}

/**
 * API response types
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListAssignmentsResponse {
  assignments: Assignment[];
  pagination: PaginationMeta;
}

export interface ListSubmissionsResponse {
  submissions: AssignmentSubmission[];
  pagination: PaginationMeta;
}
