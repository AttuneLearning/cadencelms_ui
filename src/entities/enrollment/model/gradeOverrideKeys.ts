/**
 * React Query keys for Grade Override
 */

import type { GradeHistoryParams } from './gradeOverrideTypes';

export const gradeOverrideKeys = {
  // All grade overrides
  all: ['gradeOverrides'] as const,

  // Grade history
  histories: () => [...gradeOverrideKeys.all, 'history'] as const,
  history: (enrollmentId: string, params?: GradeHistoryParams) =>
    [...gradeOverrideKeys.histories(), enrollmentId, params] as const,
};
