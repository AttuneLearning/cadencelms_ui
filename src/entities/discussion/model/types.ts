/**
 * Discussion Entity Types
 * Types for course discussion threads and replies (API-ISS-028)
 */

// =====================
// SHARED TYPES
// =====================

/**
 * Author reference embedded in threads/replies
 */
export interface AuthorRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Author type discriminator
 */
export type AuthorType = 'learner' | 'staff';

/**
 * Pagination shape for thread/reply lists
 */
export interface ThreadPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =====================
// CORE TYPES
// =====================

/**
 * Full discussion thread object
 */
export interface DiscussionThread {
  _id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  authorId: AuthorRef;
  authorType: AuthorType;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastReplyAt: string | null;
  lastReplyBy: AuthorRef | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Discussion reply object
 */
export interface DiscussionReply {
  _id: string;
  threadId: string;
  authorId: AuthorRef;
  authorType: AuthorType;
  body: string;
  parentReplyId?: string;
  isInstructorAnswer: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================
// API RESPONSE TYPES
// =====================

/**
 * Response for listing threads
 */
export interface ListThreadsResponse {
  threads: DiscussionThread[];
  pagination: ThreadPagination;
}

/**
 * Response for listing replies
 */
export interface ListRepliesResponse {
  replies: DiscussionReply[];
  pagination: ThreadPagination;
}

// =====================
// REQUEST PARAM TYPES
// =====================

/**
 * Query params for listing threads
 */
export interface ListThreadsParams {
  page?: number;
  limit?: number;
  moduleId?: string;
  lessonId?: string;
}

/**
 * Query params for searching threads
 */
export interface SearchThreadsParams {
  q: string;
  page?: number;
  limit?: number;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

/**
 * Payload to create a new thread
 */
export interface CreateThreadPayload {
  title: string;
  body: string;
  moduleId?: string;
  lessonId?: string;
}

/**
 * Payload to update a thread
 */
export interface UpdateThreadPayload {
  title?: string;
  body?: string;
}

/**
 * Payload to create a reply
 */
export interface CreateReplyPayload {
  body: string;
  parentReplyId?: string;
}

/**
 * Payload to update a reply
 */
export interface UpdateReplyPayload {
  body: string;
}

/**
 * Payload for pinning/unpinning a thread
 */
export interface PinThreadPayload {
  isPinned: boolean;
}

/**
 * Payload for locking/unlocking a thread
 */
export interface LockThreadPayload {
  isLocked: boolean;
}

/**
 * Payload for marking/unmarking a reply as instructor answer
 */
export interface MarkAnswerPayload {
  isInstructorAnswer: boolean;
}
