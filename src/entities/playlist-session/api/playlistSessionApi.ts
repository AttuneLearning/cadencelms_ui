/**
 * Playlist Session API Client
 * Endpoints for saving/loading adaptive playlist engine session state (API-ISS-036)
 */

import { client, ApiClientError } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import type { PlaylistSessionResponse } from '../model/types';
import type { LearnerModuleSession } from '@/shared/lib/business-logic/playlist-engine';

/**
 * Save or create a playlist session (upsert)
 * POST /enrollments/:enrollmentId/playlist-session
 */
export async function savePlaylistSession(
  enrollmentId: string,
  moduleId: string,
  session: LearnerModuleSession
): Promise<PlaylistSessionResponse> {
  const response = await client.post<ApiResponse<PlaylistSessionResponse>>(
    `/enrollments/${enrollmentId}/playlist-session`,
    { moduleId, session }
  );
  return response.data.data;
}

/**
 * Load a playlist session
 * GET /enrollments/:enrollmentId/playlist-session?moduleId=xxx
 * Returns null if no session found (404)
 */
export async function loadPlaylistSession(
  enrollmentId: string,
  moduleId: string
): Promise<PlaylistSessionResponse | null> {
  try {
    const response = await client.get<ApiResponse<PlaylistSessionResponse>>(
      `/enrollments/${enrollmentId}/playlist-session`,
      { params: { moduleId } }
    );
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Update an existing playlist session
 * PUT /enrollments/:enrollmentId/playlist-session/:sessionId
 */
export async function updatePlaylistSession(
  enrollmentId: string,
  sessionId: string,
  session: LearnerModuleSession
): Promise<PlaylistSessionResponse> {
  const response = await client.put<ApiResponse<PlaylistSessionResponse>>(
    `/enrollments/${enrollmentId}/playlist-session/${sessionId}`,
    { session }
  );
  return response.data.data;
}
