/**
 * Playlist Session Entity Types
 * Re-exports core types + defines future API response types for session persistence.
 */

export type {
  LearnerModuleSession,
  PlaylistEntry,
  PlaylistDisplayEntry,
  GateResult,
  NodeProgress,
} from '@/shared/lib/business-logic/playlist-engine';

/** API response for a saved playlist session (Phase 5) */
export interface PlaylistSessionResponse {
  id: string;
  enrollmentId: string;
  moduleId: string;
  session: import('@/shared/lib/business-logic/playlist-engine').LearnerModuleSession;
  savedAt: string;
}
