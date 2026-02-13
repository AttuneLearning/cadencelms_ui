/**
 * Discussion API Client
 * Handles all discussion thread and reply API calls (API-ISS-028)
 */

import { client } from '@/shared/api/client';
import type {
  DiscussionThread,
  DiscussionReply,
  ListThreadsResponse,
  ListRepliesResponse,
  ListThreadsParams,
  SearchThreadsParams,
  CreateThreadPayload,
  UpdateThreadPayload,
  CreateReplyPayload,
  UpdateReplyPayload,
  PinThreadPayload,
  LockThreadPayload,
  MarkAnswerPayload,
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
 * GET /courses/:courseId/discussions - List threads for a course
 */
export async function listThreads(
  courseId: string,
  params?: ListThreadsParams
): Promise<ListThreadsResponse> {
  const response = await client.get<ApiResponse<ListThreadsResponse>>(
    `/courses/${courseId}/discussions`,
    { params }
  );
  return response.data.data;
}

/**
 * POST /courses/:courseId/discussions - Create a new thread
 */
export async function createThread(
  courseId: string,
  data: CreateThreadPayload
): Promise<DiscussionThread> {
  const response = await client.post<ApiResponse<DiscussionThread>>(
    `/courses/${courseId}/discussions`,
    data
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/discussions/search - Search threads
 */
export async function searchThreads(
  courseId: string,
  params: SearchThreadsParams
): Promise<ListThreadsResponse> {
  const response = await client.get<ApiResponse<ListThreadsResponse>>(
    `/courses/${courseId}/discussions/search`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /discussions/:threadId - Get a single thread
 */
export async function getThread(threadId: string): Promise<DiscussionThread> {
  const response = await client.get<ApiResponse<DiscussionThread>>(
    `/discussions/${threadId}`
  );
  return response.data.data;
}

/**
 * PUT /discussions/:threadId - Update a thread
 */
export async function updateThread(
  threadId: string,
  data: UpdateThreadPayload
): Promise<DiscussionThread> {
  const response = await client.put<ApiResponse<DiscussionThread>>(
    `/discussions/${threadId}`,
    data
  );
  return response.data.data;
}

/**
 * DELETE /discussions/:threadId - Delete a thread
 */
export async function deleteThread(threadId: string): Promise<void> {
  await client.delete(`/discussions/${threadId}`);
}

/**
 * PUT /discussions/:threadId/pin - Pin or unpin a thread
 */
export async function pinThread(
  threadId: string,
  data: PinThreadPayload
): Promise<DiscussionThread> {
  const response = await client.put<ApiResponse<DiscussionThread>>(
    `/discussions/${threadId}/pin`,
    data
  );
  return response.data.data;
}

/**
 * PUT /discussions/:threadId/lock - Lock or unlock a thread
 */
export async function lockThread(
  threadId: string,
  data: LockThreadPayload
): Promise<DiscussionThread> {
  const response = await client.put<ApiResponse<DiscussionThread>>(
    `/discussions/${threadId}/lock`,
    data
  );
  return response.data.data;
}

// =====================
// REPLY ENDPOINTS
// =====================

/**
 * GET /discussions/:threadId/replies - List replies for a thread
 */
export async function listReplies(
  threadId: string,
  params?: { page?: number; limit?: number }
): Promise<ListRepliesResponse> {
  const response = await client.get<ApiResponse<ListRepliesResponse>>(
    `/discussions/${threadId}/replies`,
    { params }
  );
  return response.data.data;
}

/**
 * POST /discussions/:threadId/replies - Create a reply
 */
export async function createReply(
  threadId: string,
  data: CreateReplyPayload
): Promise<DiscussionReply> {
  const response = await client.post<ApiResponse<DiscussionReply>>(
    `/discussions/${threadId}/replies`,
    data
  );
  return response.data.data;
}

/**
 * PUT /replies/:replyId - Update a reply
 */
export async function updateReply(
  replyId: string,
  data: UpdateReplyPayload
): Promise<DiscussionReply> {
  const response = await client.put<ApiResponse<DiscussionReply>>(
    `/replies/${replyId}`,
    data
  );
  return response.data.data;
}

/**
 * DELETE /replies/:replyId - Delete a reply
 */
export async function deleteReply(replyId: string): Promise<void> {
  await client.delete(`/replies/${replyId}`);
}

/**
 * PUT /replies/:replyId/mark-answer - Mark or unmark a reply as instructor answer
 */
export async function markAsAnswer(
  replyId: string,
  data: MarkAnswerPayload
): Promise<DiscussionReply> {
  const response = await client.put<ApiResponse<DiscussionReply>>(
    `/replies/${replyId}/mark-answer`,
    data
  );
  return response.data.data;
}
