/**
 * Message Entity Types
 * Unified messaging system for direct messages, announcements, reminders, and system notifications
 */

// =====================
// ENUMS
// =====================

export type MessageType = 'direct' | 'announcement' | 'reminder' | 'system';
export type MessageStatus = 'unread' | 'read' | 'archived';

// =====================
// CORE MESSAGE TYPES
// =====================

/**
 * Sender Reference
 */
export interface SenderRef {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  profileImage?: string | null;
}

/**
 * Related Entity Reference (optional link to course/enrollment/program)
 */
export interface RelatedEntityRef {
  type: 'course' | 'enrollment' | 'program' | 'class';
  id: string;
  name: string;
}

/**
 * Full Message Details
 */
export interface Message {
  id: string;
  type: MessageType;
  subject: string;
  body: string;
  sender: SenderRef;
  recipientId: string;
  status: MessageStatus;
  isImportant: boolean;
  relatedEntity?: RelatedEntityRef | null;
  createdAt: string;
  readAt: string | null;
  updatedAt: string;
}

/**
 * Message List Item (compact version for inbox lists)
 */
export interface MessageListItem {
  id: string;
  type: MessageType;
  subject: string;
  preview: string; // First ~100 chars of body
  sender: SenderRef;
  status: MessageStatus;
  isImportant: boolean;
  relatedEntity?: RelatedEntityRef | null;
  createdAt: string;
  readAt: string | null;
}

// =====================
// REQUEST/RESPONSE TYPES
// =====================

/**
 * Send Message Payload
 */
export interface SendMessagePayload {
  recipientId: string;
  subject: string;
  body: string;
  type?: MessageType;
  isImportant?: boolean;
  relatedEntity?: RelatedEntityRef;
}

/**
 * Message Filters
 */
export interface MessageFilters {
  page?: number;
  limit?: number;
  type?: MessageType;
  status?: MessageStatus;
  senderId?: string;
  isImportant?: boolean;
  search?: string;
  sort?: 'date-desc' | 'date-asc' | 'unread-first';
}

/**
 * Mark as Read Payload
 */
export interface MarkAsReadPayload {
  messageIds: string[];
}

/**
 * Archive Messages Payload
 */
export interface ArchiveMessagesPayload {
  messageIds: string[];
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// API RESPONSE TYPES
// =====================

/**
 * Messages List Response
 */
export interface MessagesListResponse {
  messages: MessageListItem[];
  pagination: Pagination;
  unreadCount: number;
}

/**
 * Unread Count Response
 */
export interface UnreadCountResponse {
  total: number;
  byType: {
    direct: number;
    announcement: number;
    reminder: number;
    system: number;
  };
}

/**
 * Send Message Response
 */
export interface SendMessageResponse {
  message: Message;
}

/**
 * Mark as Read Response
 */
export interface MarkAsReadResponse {
  updatedCount: number;
  messageIds: string[];
}

/**
 * Archive Messages Response
 */
export interface ArchiveMessagesResponse {
  archivedCount: number;
  messageIds: string[];
}
