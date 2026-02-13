/**
 * Business Logic Layer
 * Platform-agnostic business logic that can be shared across web and mobile
 */

export { CourseLogic } from './course.logic';
export { ProgressLogic } from './progress.logic';
export type { CourseProgress } from './course.logic';
export type { LessonProgressData } from './progress.logic';

// Adaptive Playlist Engine (ADR-UI-004)
export { PlaylistEngine, DEFAULT_ADAPTIVE_SETTINGS } from './playlist-engine';
export type {
  StaticLearningUnit,
  PlaylistEntry,
  LearnerModuleSession,
  PlaylistDecision,
  CourseAdaptiveSettings,
  PlaylistDisplayEntry,
} from './playlist-engine';
