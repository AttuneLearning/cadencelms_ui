/**
 * Matching Player Feature - Public API
 */

// Types
export type {
  MatchingPair,
  ColumnItem,
  MatchingSession,
  MatchSubmission,
  MatchingResult,
  SubmitMatchesPayload,
  MatchingAttempt,
  GetAttemptsParams,
  MatchingAttemptsResponse,
} from './api/matchingApi';

// Hooks
export {
  matchingKeys,
  useMatchingSession,
  useMatchingSessionById,
  useSubmitMatching,
  useMatchingResult,
  useMatchingAttempts,
} from './model/useMatching';

// API (for advanced use cases)
export * as matchingApi from './api/matchingApi';
