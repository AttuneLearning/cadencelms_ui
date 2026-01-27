/**
 * Cognitive Depth Types
 * Entity types for cognitive depth levels with course overrides
 */

export type DepthSource = 'system' | 'department' | 'course';

/**
 * Cognitive Depth Level
 * Represents a level in the learning progression
 */
export interface CognitiveDepthLevel {
  slug: string;
  name: string;
  description: string;
  order: number;
  advanceThreshold: number; // 0.0 - 1.0 decimal (e.g., 0.8 = 80%)
  minAttempts: number;
  source: DepthSource;
  isActive: boolean;
}

/**
 * Course Depth Levels Response
 * Includes override information
 */
export interface CourseDepthLevelsResponse {
  levels: CognitiveDepthLevel[];
  canOverride: boolean;
  hasOverrides: boolean;
}

/**
 * Depth Override Payload
 * Fields that can be overridden at course level
 */
export interface DepthOverridePayload {
  advanceThreshold?: number;
  minAttempts?: number;
  description?: string;
}

/**
 * Reset Overrides Payload
 */
export interface ResetOverridesPayload {
  depthSlugs: string[];
}
