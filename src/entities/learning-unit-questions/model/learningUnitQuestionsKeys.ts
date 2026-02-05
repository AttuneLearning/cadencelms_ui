/**
 * Learning Unit Questions Query Keys
 * React Query key factory for learning unit question operations
 */

export const learningUnitQuestionsKeys = {
  all: ['learning-unit-questions'] as const,

  lists: () => [...learningUnitQuestionsKeys.all, 'list'] as const,

  list: (learningUnitId: string) =>
    [...learningUnitQuestionsKeys.lists(), learningUnitId] as const,
};
