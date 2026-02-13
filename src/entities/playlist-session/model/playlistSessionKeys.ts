/**
 * React Query keys for Playlist Sessions
 */

export const playlistSessionKeys = {
  all: ['playlist-sessions'] as const,

  lists: () => [...playlistSessionKeys.all, 'list'] as const,
  listByEnrollment: (enrollmentId: string) =>
    [...playlistSessionKeys.lists(), enrollmentId] as const,

  details: () => [...playlistSessionKeys.all, 'detail'] as const,
  detail: (enrollmentId: string, moduleId: string) =>
    [...playlistSessionKeys.details(), enrollmentId, moduleId] as const,
};
