/**
 * Knowledge Node React Query Hooks
 * Provides hooks for all knowledge node operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@/shared/ui/use-toast';
import {
  getKnowledgeNodes,
  getKnowledgeNodeTree,
  getKnowledgeNode,
  createKnowledgeNode,
  updateKnowledgeNode,
  deleteKnowledgeNode,
  addPrerequisite,
  removePrerequisite,
} from '../api/knowledgeNodeApi';
import { knowledgeNodeKeys } from './knowledgeNodeKeys';
import type {
  KnowledgeNodeListResponse,
  KnowledgeNodeListParams,
  KnowledgeNode,
  KnowledgeNodeTree,
  CreateKnowledgeNodePayload,
  UpdateKnowledgeNodePayload,
  AddPrerequisitePayload,
} from './types';

/**
 * Hook to fetch paginated list of knowledge nodes
 */
export function useKnowledgeNodes(
  departmentId: string,
  params?: KnowledgeNodeListParams,
  options?: Omit<
    UseQueryOptions<
      KnowledgeNodeListResponse,
      Error,
      KnowledgeNodeListResponse,
      ReturnType<typeof knowledgeNodeKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: knowledgeNodeKeys.list(departmentId, params),
    queryFn: () => getKnowledgeNodes(departmentId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!departmentId,
    ...options,
  });
}

/**
 * Hook to fetch knowledge node tree
 */
export function useKnowledgeNodeTree(
  departmentId: string,
  options?: Omit<
    UseQueryOptions<
      KnowledgeNodeTree[],
      Error,
      KnowledgeNodeTree[],
      ReturnType<typeof knowledgeNodeKeys.tree>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: knowledgeNodeKeys.tree(departmentId),
    queryFn: () => getKnowledgeNodeTree(departmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!departmentId,
    ...options,
  });
}

/**
 * Hook to fetch single knowledge node details
 */
export function useKnowledgeNode(
  departmentId: string,
  nodeId: string,
  options?: Omit<
    UseQueryOptions<
      KnowledgeNode,
      Error,
      KnowledgeNode,
      ReturnType<typeof knowledgeNodeKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: knowledgeNodeKeys.detail(departmentId, nodeId),
    queryFn: () => getKnowledgeNode(departmentId, nodeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!departmentId && !!nodeId,
    ...options,
  });
}

/**
 * Hook to create a new knowledge node
 */
export function useCreateKnowledgeNode(
  departmentId: string,
  options?: UseMutationOptions<KnowledgeNode, Error, CreateKnowledgeNodePayload>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createKnowledgeNode(departmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.lists(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.trees(departmentId),
      });
      toast({
        title: 'Knowledge node created',
        description: 'The knowledge node has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to create knowledge node',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to update an existing knowledge node
 */
export function useUpdateKnowledgeNode(
  departmentId: string,
  options?: UseMutationOptions<
    KnowledgeNode,
    Error,
    { nodeId: string; payload: UpdateKnowledgeNodePayload }
  >
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ nodeId, payload }) =>
      updateKnowledgeNode(departmentId, nodeId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        knowledgeNodeKeys.detail(departmentId, variables.nodeId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.lists(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.trees(departmentId),
      });
      toast({
        title: 'Knowledge node updated',
        description: 'The knowledge node has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to update knowledge node',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to delete a knowledge node
 */
export function useDeleteKnowledgeNode(
  departmentId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (nodeId) => deleteKnowledgeNode(departmentId, nodeId),
    onSuccess: (_, nodeId) => {
      queryClient.removeQueries({
        queryKey: knowledgeNodeKeys.detail(departmentId, nodeId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.lists(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.trees(departmentId),
      });
      toast({
        title: 'Knowledge node deleted',
        description: 'The knowledge node has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to delete knowledge node',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to add a prerequisite to a knowledge node
 */
export function useAddPrerequisite(
  departmentId: string,
  options?: UseMutationOptions<
    void,
    Error,
    { nodeId: string; payload: AddPrerequisitePayload }
  >
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ nodeId, payload }) =>
      addPrerequisite(departmentId, nodeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.detail(departmentId, variables.nodeId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.lists(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.trees(departmentId),
      });
      toast({
        title: 'Prerequisite added',
        description: 'The prerequisite has been added successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to add prerequisite',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to remove a prerequisite from a knowledge node
 */
export function useRemovePrerequisite(
  departmentId: string,
  options?: UseMutationOptions<
    void,
    Error,
    { nodeId: string; prerequisiteId: string }
  >
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ nodeId, prerequisiteId }) =>
      removePrerequisite(departmentId, nodeId, prerequisiteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.detail(departmentId, variables.nodeId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.lists(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeNodeKeys.trees(departmentId),
      });
      toast({
        title: 'Prerequisite removed',
        description: 'The prerequisite has been removed successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to remove prerequisite',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}
