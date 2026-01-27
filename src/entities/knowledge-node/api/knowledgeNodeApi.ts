/**
 * Knowledge Node API Client
 * API operations for knowledge node management
 * Department-scoped endpoints: /departments/:id/knowledge-nodes
 */

import { client } from '@/shared/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}
import type {
  KnowledgeNodeListResponse,
  KnowledgeNodeListParams,
  KnowledgeNode,
  KnowledgeNodeTree,
  CreateKnowledgeNodePayload,
  UpdateKnowledgeNodePayload,
  AddPrerequisitePayload,
} from '../model/types';

/**
 * GET /departments/:departmentId/knowledge-nodes - List knowledge nodes
 */
export async function getKnowledgeNodes(
  departmentId: string,
  params?: KnowledgeNodeListParams
): Promise<KnowledgeNodeListResponse> {
  const response = await client.get<ApiResponse<KnowledgeNodeListResponse>>(
    `/departments/${departmentId}/knowledge-nodes`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /departments/:departmentId/knowledge-nodes/tree - Get hierarchical tree
 */
export async function getKnowledgeNodeTree(
  departmentId: string
): Promise<KnowledgeNodeTree[]> {
  const response = await client.get<ApiResponse<KnowledgeNodeTree[]>>(
    `/departments/${departmentId}/knowledge-nodes/tree`
  );
  return response.data.data;
}

/**
 * GET /departments/:departmentId/knowledge-nodes/:id - Get knowledge node details
 */
export async function getKnowledgeNode(
  departmentId: string,
  nodeId: string
): Promise<KnowledgeNode> {
  const response = await client.get<ApiResponse<KnowledgeNode>>(
    `/departments/${departmentId}/knowledge-nodes/${nodeId}`
  );
  return response.data.data;
}

/**
 * POST /departments/:departmentId/knowledge-nodes - Create knowledge node
 */
export async function createKnowledgeNode(
  departmentId: string,
  payload: CreateKnowledgeNodePayload
): Promise<KnowledgeNode> {
  const response = await client.post<ApiResponse<KnowledgeNode>>(
    `/departments/${departmentId}/knowledge-nodes`,
    payload
  );
  return response.data.data;
}

/**
 * PUT /departments/:departmentId/knowledge-nodes/:id - Update knowledge node
 */
export async function updateKnowledgeNode(
  departmentId: string,
  nodeId: string,
  payload: UpdateKnowledgeNodePayload
): Promise<KnowledgeNode> {
  const response = await client.put<ApiResponse<KnowledgeNode>>(
    `/departments/${departmentId}/knowledge-nodes/${nodeId}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /departments/:departmentId/knowledge-nodes/:id - Delete knowledge node
 */
export async function deleteKnowledgeNode(
  departmentId: string,
  nodeId: string
): Promise<void> {
  await client.delete(
    `/departments/${departmentId}/knowledge-nodes/${nodeId}`
  );
}

/**
 * POST /departments/:departmentId/knowledge-nodes/:id/prerequisites - Add prerequisite
 */
export async function addPrerequisite(
  departmentId: string,
  nodeId: string,
  payload: AddPrerequisitePayload
): Promise<void> {
  await client.post(
    `/departments/${departmentId}/knowledge-nodes/${nodeId}/prerequisites`,
    payload
  );
}

/**
 * DELETE /departments/:departmentId/knowledge-nodes/:id/prerequisites/:prerequisiteId - Remove prerequisite
 */
export async function removePrerequisite(
  departmentId: string,
  nodeId: string,
  prerequisiteId: string
): Promise<void> {
  await client.delete(
    `/departments/${departmentId}/knowledge-nodes/${nodeId}/prerequisites/${prerequisiteId}`
  );
}
