/**
 * Message API Client
 * Handles all message-related API calls
 */

import { client } from '@/shared/api/client';
import type {
  Message,
  MessagesListResponse,
  MessageFilters,
  SendMessagePayload,
  SendMessageResponse,
  MarkAsReadPayload,
  MarkAsReadResponse,
  ArchiveMessagesPayload,
  ArchiveMessagesResponse,
  UnreadCountResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// MESSAGES
// =====================

/**
 * GET /api/v2/messages - List messages
 */
export async function listMessages(filters?: MessageFilters): Promise<MessagesListResponse> {
  const response = await client.get<ApiResponse<MessagesListResponse>>('/api/v2/messages', {
    params: filters,
  });
  return response.data.data;
}

/**
 * GET /api/v2/messages/:id - Get message details
 */
export async function getMessage(id: string): Promise<Message> {
  const response = await client.get<ApiResponse<Message>>(`/api/v2/messages/${id}`);
  return response.data.data;
}

/**
 * POST /api/v2/messages - Send new message
 */
export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  const response = await client.post<ApiResponse<SendMessageResponse>>(
    '/api/v2/messages',
    payload
  );
  return response.data.data.message;
}

/**
 * PATCH /api/v2/messages/mark-read - Mark messages as read
 */
export async function markMessagesAsRead(payload: MarkAsReadPayload): Promise<MarkAsReadResponse> {
  const response = await client.patch<ApiResponse<MarkAsReadResponse>>(
    '/api/v2/messages/mark-read',
    payload
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/messages/archive - Archive messages
 */
export async function archiveMessages(
  payload: ArchiveMessagesPayload
): Promise<ArchiveMessagesResponse> {
  const response = await client.patch<ApiResponse<ArchiveMessagesResponse>>(
    '/api/v2/messages/archive',
    payload
  );
  return response.data.data;
}

/**
 * GET /api/v2/messages/unread-count - Get unread message count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await client.get<ApiResponse<UnreadCountResponse>>(
    '/api/v2/messages/unread-count'
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/messages/:id - Delete message
 */
export async function deleteMessage(id: string): Promise<void> {
  await client.delete(`/api/v2/messages/${id}`);
}
