/**
 * Cognitive Depth Entity
 * Public API for cognitive depth level management
 */

// Types
export type {
  CognitiveDepthLevel,
  CourseDepthLevelsResponse,
  DepthOverridePayload,
  ResetOverridesPayload,
  DepthSource,
} from './model/types';

// API
export {
  getSystemDepthLevels,
  getDepartmentDepthLevels,
  getCourseDepthLevels,
  overrideCourseDepthLevel,
  resetCourseDepthOverrides,
} from './api/cognitiveDepthApi';

// Hooks
export {
  useSystemDepthLevels,
  useDepartmentDepthLevels,
  useCourseDepthLevels,
  useOverrideCourseDepthLevel,
  useResetCourseDepthOverrides,
} from './model/useCognitiveDepth';

// Query Keys
export { cognitiveDepthKeys } from './model/cognitiveDepthKeys';
