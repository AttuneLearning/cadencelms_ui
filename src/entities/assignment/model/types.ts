/**
 * Assignment Entity Types
 * Types for assignment submissions and grading
 */

/**
 * Assignment submission types
 */
export type AssignmentType = 'text' | 'file' | 'text_and_file';

/**
 * Submission status values
 */
export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned';

/**
 * Assignment definition
 */
export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  maxFileSize?: number; // bytes
  allowedFileTypes?: string[]; // ['pdf', 'docx', 'jpg']
  maxFiles?: number;
  rubricId?: string | null;
  dueDate?: string | null;
  allowResubmission: boolean;
  maxSubmissions?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * File attachment in submission
 */
export interface SubmissionFile {
  id: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
}

/**
 * Grade information
 */
export interface AssignmentGrade {
  score: number;
  maxScore: number;
  feedback?: string;
  gradedBy: string;
  gradedAt: string;
}

/**
 * Assignment submission
 */
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  learnerId: string;
  attemptNumber: number;
  status: SubmissionStatus;
  textContent?: string | null;
  files?: SubmissionFile[];
  submittedAt: string | null;
  grade?: AssignmentGrade | null;
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

export interface CreateSubmissionRequest {
  assignmentId: string;
  textContent?: string;
  status?: 'draft' | 'submitted';
}

export interface UpdateSubmissionRequest {
  textContent?: string;
  status?: SubmissionStatus;
}

export interface SubmitAssignmentRequest {
  submissionId: string;
  textContent?: string;
}

export interface UploadFileRequest {
  submissionId: string;
  file: File;
}

export interface DeleteFileRequest {
  submissionId: string;
  fileId: string;
}

export interface GradeSubmissionRequest {
  score: number;
  maxScore: number;
  feedback?: string;
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

export interface CreateSubmissionResponse extends AssignmentSubmission {}

export interface UpdateSubmissionResponse extends AssignmentSubmission {}

export interface SubmitAssignmentResponse extends AssignmentSubmission {}

export interface UploadFileResponse {
  submissionId: string;
  file: SubmissionFile;
}

export interface DeleteFileResponse {
  submissionId: string;
  fileId: string;
  deleted: boolean;
}

export interface GradeSubmissionResponse extends AssignmentSubmission {}
