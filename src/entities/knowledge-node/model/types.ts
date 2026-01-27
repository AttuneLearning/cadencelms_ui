/**
 * Knowledge Node Types
 * Entity types for Knowledge Node system in Adaptive Learning
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Knowledge Node
 * Represents a concept/skill in the knowledge graph
 */
export interface KnowledgeNode {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  parentNodeId: string | null;
  prerequisiteNodeIds: string[];
  questionCount: number;
  depthRange: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Knowledge Node List Item
 * Simplified view for list displays
 */
export interface KnowledgeNodeListItem {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  parentNodeId: string | null;
  prerequisiteCount: number;
  questionCount: number;
  depthRange: {
    min: number;
    max: number;
  };
}

/**
 * Knowledge Node Tree Item
 * Hierarchical tree structure with children
 */
export interface KnowledgeNodeTree {
  node: KnowledgeNode;
  children: KnowledgeNodeTree[];
}

/**
 * Knowledge Node List Query Parameters
 */
export interface KnowledgeNodeListParams {
  search?: string;
  parentNodeId?: string;
  hasPrerequisites?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Knowledge Node List Response
 */
export interface KnowledgeNodeListResponse {
  nodes: KnowledgeNodeListItem[];
  pagination: Pagination;
}

/**
 * Create Knowledge Node Payload
 */
export interface CreateKnowledgeNodePayload {
  name: string;
  description?: string;
  parentNodeId?: string;
}

/**
 * Update Knowledge Node Payload
 */
export interface UpdateKnowledgeNodePayload {
  name?: string;
  description?: string;
  parentNodeId?: string;
}

/**
 * Add Prerequisite Payload
 */
export interface AddPrerequisitePayload {
  prerequisiteNodeId: string;
}
