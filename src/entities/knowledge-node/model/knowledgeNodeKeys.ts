/**
 * React Query keys for knowledge node queries
 * Organized hierarchically for efficient cache invalidation
 */

import type { KnowledgeNodeListParams } from './types';

export const knowledgeNodeKeys = {
  all: ['knowledgeNodes'] as const,

  lists: (departmentId?: string) =>
    departmentId
      ? ([...knowledgeNodeKeys.all, 'list', departmentId] as const)
      : ([...knowledgeNodeKeys.all, 'list'] as const),

  list: (departmentId: string, params?: KnowledgeNodeListParams) =>
    [...knowledgeNodeKeys.lists(departmentId), params] as const,

  trees: (departmentId?: string) =>
    departmentId
      ? ([...knowledgeNodeKeys.all, 'tree', departmentId] as const)
      : ([...knowledgeNodeKeys.all, 'tree'] as const),

  tree: (departmentId: string) =>
    [...knowledgeNodeKeys.trees(departmentId)] as const,

  details: (departmentId?: string) =>
    departmentId
      ? ([...knowledgeNodeKeys.all, 'detail', departmentId] as const)
      : ([...knowledgeNodeKeys.all, 'detail'] as const),

  detail: (departmentId: string, nodeId: string) =>
    [...knowledgeNodeKeys.details(departmentId), nodeId] as const,
};
