/**
 * React Query keys for question bank queries
 * Organized hierarchically for efficient cache invalidation
 */

import type { QuestionBankListParams } from './types';

export const questionBankKeys = {
  all: ['questionBanks'] as const,

  lists: (departmentId?: string) =>
    departmentId
      ? ([...questionBankKeys.all, 'list', departmentId] as const)
      : ([...questionBankKeys.all, 'list'] as const),

  list: (departmentId: string, params?: QuestionBankListParams) =>
    [...questionBankKeys.lists(departmentId), params] as const,

  details: (departmentId?: string) =>
    departmentId
      ? ([...questionBankKeys.all, 'detail', departmentId] as const)
      : ([...questionBankKeys.all, 'detail'] as const),

  detail: (departmentId: string, bankId: string) =>
    [...questionBankKeys.details(departmentId), bankId] as const,
};
