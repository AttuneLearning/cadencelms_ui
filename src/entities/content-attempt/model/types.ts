/**
 * Content Attempt Entity Types
 * Tracks SCORM, video, document viewing attempts - NOT quizzes/exams
 */

/**
 * Content types that can have attempts
 */
export type ContentType = 'scorm' | 'video' | 'document' | 'html' | 'assignment';

/**
 * Attempt status values
 */
export type AttemptStatus =
  | 'not-started'
  | 'started'
  | 'in-progress'
  | 'completed'
  | 'passed'
  | 'failed'
  | 'suspended'
  | 'abandoned';

/**
 * SCORM versions
 */
export type ScormVersion = '1.2' | '2004';

/**
 * Basic content reference included in attempt
 */
export interface ContentReference {
  id: string;
  title: string;
  type: ContentType;
  description?: string | null;
  duration?: number | null;
}

/**
 * Basic learner reference included in attempt
 */
export interface LearnerReference {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Basic enrollment reference included in attempt
 */
export interface EnrollmentReference {
  id: string;
  courseId: string;
  courseTitle: string;
}

/**
 * Main Content Attempt interface
 */
export interface ContentAttempt {
  id: string;
  contentId: string;
  content?: ContentReference;
  learnerId: string;
  learner?: LearnerReference;
  enrollmentId: string | null;
  enrollment?: EnrollmentReference | null;
  attemptNumber: number;
  status: AttemptStatus;
  progressPercent: number | null;
  score: number | null;
  scoreRaw: number | null;
  scoreMin: number | null;
  scoreMax: number | null;
  scoreScaled: number | null;
  completionStatus?: string | null;
  successStatus?: string | null;
  timeSpentSeconds: number;
  totalTime: number | null;
  sessionTime: number | null;
  startedAt: string | null;
  lastAccessedAt: string | null;
  completedAt: string | null;
  scormVersion: ScormVersion | null;
  location: string | null;
  suspendData: string | null;
  cmiData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  hasScormData?: boolean;
  launchUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * SCORM CMI Data structure
 */
export interface ScormCmiData {
  attemptId: string;
  scormVersion: ScormVersion;
  cmiData: Record<string, string>;
  lastUpdated: string;
}

/**
 * Video progress data
 */
export interface VideoProgressData {
  currentTime: number;
  duration: number;
  watchPercentage: number;
  lastPosition: number;
}

/**
 * API request types
 */

export interface ListAttemptsParams {
  page?: number;
  limit?: number;
  learnerId?: string;
  contentId?: string;
  status?: AttemptStatus;
  enrollmentId?: string;
  sort?: string;
}

export interface CreateAttemptRequest {
  contentId: string;
  enrollmentId?: string;
  scormVersion?: ScormVersion;
  launchData?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAttemptRequest {
  status?: AttemptStatus;
  progressPercent?: number;
  score?: number;
  scoreRaw?: number;
  scoreMin?: number;
  scoreMax?: number;
  scoreScaled?: number;
  timeSpentSeconds?: number;
  location?: string;
  suspendData?: string;
  metadata?: Record<string, unknown>;
}

export interface CompleteAttemptRequest {
  score?: number;
  scoreRaw?: number;
  scoreScaled?: number;
  passed?: boolean;
  timeSpentSeconds?: number;
}

export interface UpdateCmiDataRequest {
  cmiData: Record<string, string>;
  autoCommit?: boolean;
}

export interface SuspendAttemptRequest {
  suspendData?: string;
  location?: string;
  sessionTime?: number;
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

export interface ListAttemptsResponse {
  attempts: ContentAttempt[];
  pagination: PaginationMeta;
}

export interface CreateAttemptResponse extends ContentAttempt {
  launchUrl: string | null;
}

export interface UpdateAttemptResponse {
  id: string;
  status: AttemptStatus;
  progressPercent: number | null;
  score: number | null;
  timeSpentSeconds: number;
  lastAccessedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface CompleteAttemptResponse {
  id: string;
  status: 'completed' | 'passed' | 'failed';
  progressPercent: number;
  score: number | null;
  scoreRaw: number | null;
  scoreScaled: number | null;
  passed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  certificate?: {
    id: string;
    url: string;
  } | null;
}

export interface UpdateCmiDataResponse {
  attemptId: string;
  updatedFields: string[];
  lastUpdated: string;
}

export interface SuspendAttemptResponse {
  id: string;
  status: 'suspended';
  suspendData: string | null;
  location: string | null;
  timeSpentSeconds: number;
  lastAccessedAt: string;
}

export interface ResumeAttemptResponse {
  id: string;
  status: 'in-progress';
  suspendData: string | null;
  location: string | null;
  cmiData: Record<string, unknown> | null;
  launchUrl: string | null;
  lastAccessedAt: string;
}

export interface DeleteAttemptResponse {
  id: string;
  deleted: boolean;
  deletedAt: string;
}
