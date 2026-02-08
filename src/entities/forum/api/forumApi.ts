/**
 * Forum API Client
 * Implements forum discussion endpoints
 */

import { client } from '@/shared/api/client';
import type {
  ForumThread,
  ThreadsListResponse,
  ThreadDetailResponse,
  CreateThreadPayload,
  UpdateThreadPayload,
  CreateReplyPayload,
  UpdateReplyPayload,
  ThreadFilters,
  CreateThreadResponse,
  CreateReplyResponse,
  ForumReply,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// THREAD ENDPOINTS
// =====================

/**
 * GET /forum/threads - List threads
 */
export async function listThreads(filters?: ThreadFilters): Promise<ThreadsListResponse> {
  const response = await client.get<ApiResponse<ThreadsListResponse>>('/forum/threads', {
    params: filters,
  });
  return response.data.data;
}

/**
 * GET /forum/threads/:id - Get thread details with replies
 */
export async function getThread(id: string): Promise<ThreadDetailResponse> {
  const response = await client.get<ApiResponse<ThreadDetailResponse>>(`/forum/threads/${id}`);
  return response.data.data;
}

/**
 * POST /forum/threads - Create new thread
 */
export async function createThread(payload: CreateThreadPayload): Promise<ForumThread> {
  const response = await client.post<ApiResponse<CreateThreadResponse>>(
    '/forum/threads',
    payload
  );
  return response.data.data.thread;
}

/**
 * PATCH /forum/threads/:id - Update thread
 */
export async function updateThread(id: string, payload: UpdateThreadPayload): Promise<ForumThread> {
  const response = await client.patch<ApiResponse<{ thread: ForumThread }>>(
    `/forum/threads/${id}`,
    payload
  );
  return response.data.data.thread;
}

/**
 * DELETE /forum/threads/:id - Delete thread
 */
export async function deleteThread(id: string): Promise<void> {
  await client.delete(`/forum/threads/${id}`);
}

// =====================
// REPLY ENDPOINTS
// =====================

/**
 * POST /forum/replies - Create reply
 */
export async function createReply(payload: CreateReplyPayload): Promise<ForumReply> {
  const response = await client.post<ApiResponse<CreateReplyResponse>>('/forum/replies', payload);
  return response.data.data.reply;
}

/**
 * PATCH /forum/replies/:id - Update reply
 */
export async function updateReply(id: string, payload: UpdateReplyPayload): Promise<ForumReply> {
  const response = await client.patch<ApiResponse<{ reply: ForumReply }>>(
    `/forum/replies/${id}`,
    payload
  );
  return response.data.data.reply;
}

/**
 * DELETE /forum/replies/:id - Delete reply
 */
export async function deleteReply(id: string): Promise<void> {
  await client.delete(`/forum/replies/${id}`);
}
