/**
 * React Query keys for cognitive depth queries
 */

export const cognitiveDepthKeys = {
  all: ['cognitiveDepth'] as const,

  system: () => [...cognitiveDepthKeys.all, 'system'] as const,

  department: (departmentId: string) =>
    [...cognitiveDepthKeys.all, 'department', departmentId] as const,

  course: (courseId: string) =>
    [...cognitiveDepthKeys.all, 'course', courseId] as const,
};
