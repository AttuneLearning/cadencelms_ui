/**
 * Adaptive Playlist Engine
 * Runtime engine for adaptive learning unit sequencing (ADR-UI-004).
 */

export { PlaylistEngine } from './playlist-engine';
export { StaticStrategy } from './strategies/static-strategy';
export { GuidedStrategy } from './strategies/guided-strategy';
export { FullStrategy } from './strategies/full-strategy';

export type {
  // Adaptive metadata
  LearningUnitAdaptive,
  GateConfig,
  GateFailStrategy,
  StaticLearningUnit,

  // Playlist entries
  PlaylistEntry,
  StaticPlaylistEntry,
  InjectedPracticeEntry,
  InjectedReviewEntry,
  RetryEntry,

  // Session state
  LearnerModuleSession,
  NodeProgress,
  GateResult,

  // Strategy interface
  PlaylistStrategy,
  PlaylistContext,

  // Decisions
  PlaylistDecision,
  AdvanceDecision,
  SkipDecision,
  InjectDecision,
  RetryDecision,
  HoldDecision,
  CompleteDecision,

  // Configuration
  CourseAdaptiveSettings,
  AdaptiveMode,

  // Display
  PlaylistDisplayEntry,
  GateDisplayStatus,
} from './types';

export { DEFAULT_ADAPTIVE_SETTINGS } from './types';
