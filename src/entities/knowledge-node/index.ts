/**
 * Knowledge Node Entity
 * Public API for knowledge node management
 */

// Types
export type {
  KnowledgeNode,
  KnowledgeNodeListItem,
  KnowledgeNodeTree,
  KnowledgeNodeListParams,
  KnowledgeNodeListResponse,
  CreateKnowledgeNodePayload,
  UpdateKnowledgeNodePayload,
  AddPrerequisitePayload,
} from './model/types';

// API
export {
  getKnowledgeNodes,
  getKnowledgeNodeTree,
  getKnowledgeNode,
  createKnowledgeNode,
  updateKnowledgeNode,
  deleteKnowledgeNode,
  addPrerequisite,
  removePrerequisite,
} from './api/knowledgeNodeApi';

// Hooks
export {
  useKnowledgeNodes,
  useKnowledgeNodeTree,
  useKnowledgeNode,
  useCreateKnowledgeNode,
  useUpdateKnowledgeNode,
  useDeleteKnowledgeNode,
  useAddPrerequisite,
  useRemovePrerequisite,
} from './model/useKnowledgeNode';

// Query Keys
export { knowledgeNodeKeys } from './model/knowledgeNodeKeys';
