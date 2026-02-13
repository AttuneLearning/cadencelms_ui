/**
 * useAdaptiveConfig
 * Returns the adaptive configuration for a course.
 * Reads adaptiveSettings from course data when available (API-ISS-035).
 */

import { DEFAULT_ADAPTIVE_SETTINGS } from '@/shared/lib/business-logic/playlist-engine';
import type { CourseAdaptiveSettings } from '@/shared/lib/business-logic/playlist-engine';
import type { CourseAdaptiveSettings as ApiCourseAdaptiveSettings } from '@/entities/course/model/types';

export function useAdaptiveConfig(
  courseAdaptiveSettings?: ApiCourseAdaptiveSettings | null
): {
  config: CourseAdaptiveSettings;
  isLoading: boolean;
} {
  if (!courseAdaptiveSettings) {
    return {
      config: DEFAULT_ADAPTIVE_SETTINGS,
      isLoading: false,
    };
  }

  return {
    config: {
      mode: courseAdaptiveSettings.mode,
      allowLearnerChoice: courseAdaptiveSettings.allowLearnerChoice,
      preAssessmentEnabled: courseAdaptiveSettings.preAssessmentEnabled,
    },
    isLoading: false,
  };
}
