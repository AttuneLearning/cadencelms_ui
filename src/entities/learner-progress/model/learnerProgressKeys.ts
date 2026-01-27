/**
 * React Query keys for learner progress queries
 */

import type { ProgressListParams } from './types';

export const learnerProgressKeys = {
  all: ['learnerProgress'] as const,

  lists: (learnerId?: string) =>
    learnerId
      ? ([...learnerProgressKeys.all, 'list', learnerId] as const)
      : ([...learnerProgressKeys.all, 'list'] as const),

  list: (learnerId: string, params?: ProgressListParams) =>
    [...learnerProgressKeys.lists(learnerId), params] as const,

  summaries: () => [...learnerProgressKeys.all, 'summary'] as const,
  summary: (learnerId: string) =>
    [...learnerProgressKeys.summaries(), learnerId] as const,

  nodes: (learnerId?: string) =>
    learnerId
      ? ([...learnerProgressKeys.all, 'node', learnerId] as const)
      : ([...learnerProgressKeys.all, 'node'] as const),

  forNode: (learnerId: string, nodeId: string) =>
    [...learnerProgressKeys.nodes(learnerId), nodeId] as const,
};
