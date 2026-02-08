/**
 * Forum Entity Types
 * Types for discussion forums and threads
 */

// =====================
// SHARED TYPES
// =====================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AuthorRef {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
}

// =====================
// FORUM THREAD TYPES
// =====================

export interface ForumThread {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  body: string;
  author: AuthorRef;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ForumThreadListItem {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  author: AuthorRef;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastReplyAt: string | null;
  createdAt: string;
}

// =====================
// FORUM REPLY TYPES
// =====================

export interface ForumReply {
  id: string;
  threadId: string;
  body: string;
  author: AuthorRef;
  isInstructorAnswer: boolean;
  parentReplyId: string | null;
  createdAt: string;
  updatedAt: string;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

export interface CreateThreadPayload {
  courseId: string;
  moduleId?: string;
  title: string;
  body: string;
}

export interface UpdateThreadPayload {
  title?: string;
  body?: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface CreateReplyPayload {
  threadId: string;
  body: string;
  parentReplyId?: string;
}

export interface UpdateReplyPayload {
  body?: string;
  isInstructorAnswer?: boolean;
}

export interface ThreadFilters {
  page?: number;
  limit?: number;
  courseId?: string;
  moduleId?: string;
  authorId?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'most_replies' | 'recently_active';
  isPinned?: boolean;
  isLocked?: boolean;
}

// =====================
// API RESPONSE TYPES
// =====================

export interface ThreadsListResponse {
  threads: ForumThreadListItem[];
  pagination: Pagination;
}

export interface ThreadDetailResponse {
  thread: ForumThread;
  replies: ForumReply[];
}

export interface CreateThreadResponse {
  thread: ForumThread;
}

export interface CreateReplyResponse {
  reply: ForumReply;
}
