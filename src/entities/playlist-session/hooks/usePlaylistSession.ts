/**
 * React Query hooks for Playlist Session persistence (Phase 5)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistSessionKeys } from '../model/playlistSessionKeys';
import {
  loadPlaylistSession,
  savePlaylistSession,
  updatePlaylistSession,
} from '../api/playlistSessionApi';
import type { PlaylistSessionResponse } from '../model/types';
import type { LearnerModuleSession } from '@/shared/lib/business-logic/playlist-engine';

/**
 * Load a saved playlist session for an enrollment + module
 */
export function usePlaylistSessionQuery(
  enrollmentId: string | undefined,
  moduleId: string | undefined
) {
  return useQuery({
    queryKey: playlistSessionKeys.detail(enrollmentId ?? '', moduleId ?? ''),
    queryFn: () => loadPlaylistSession(enrollmentId!, moduleId!),
    enabled: !!enrollmentId && !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Save (upsert) a playlist session
 */
export function useSavePlaylistSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      moduleId,
      session,
    }: {
      enrollmentId: string;
      moduleId: string;
      session: LearnerModuleSession;
    }) => savePlaylistSession(enrollmentId, moduleId, session),
    onSuccess: (data: PlaylistSessionResponse) => {
      queryClient.setQueryData(
        playlistSessionKeys.detail(data.enrollmentId, data.moduleId),
        data
      );
    },
  });
}

/**
 * Update an existing playlist session by ID
 */
export function useUpdatePlaylistSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      sessionId,
      session,
    }: {
      enrollmentId: string;
      sessionId: string;
      session: LearnerModuleSession;
    }) => updatePlaylistSession(enrollmentId, sessionId, session),
    onSuccess: (data: PlaylistSessionResponse) => {
      queryClient.setQueryData(
        playlistSessionKeys.detail(data.enrollmentId, data.moduleId),
        data
      );
    },
  });
}
