/**
 * React Query hooks for Messages
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listMessages,
  getMessage,
  sendMessage,
  markMessagesAsRead,
  archiveMessages,
  getUnreadCount,
  deleteMessage,
} from '../api/messageApi';
import { messageKeys } from '../model/messageKeys';
import type {
  Message,
  MessagesListResponse,
  MessageFilters,
  SendMessagePayload,
  MarkAsReadPayload,
  ArchiveMessagesPayload,
  UnreadCountResponse,
} from '../model/types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of messages
 */
export function useMessages(
  filters?: MessageFilters,
  options?: Omit<
    UseQueryOptions<
      MessagesListResponse,
      Error,
      MessagesListResponse,
      ReturnType<typeof messageKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: messageKeys.list(filters),
    queryFn: () => listMessages(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch single message
 */
export function useMessage(
  id: string,
  options?: Omit<
    UseQueryOptions<Message, Error, Message, ReturnType<typeof messageKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: messageKeys.detail(id),
    queryFn: () => getMessage(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch unread message count
 */
export function useUnreadCount(
  options?: Omit<
    UseQueryOptions<
      UnreadCountResponse,
      Error,
      UnreadCountResponse,
      ReturnType<typeof messageKeys.unreadCount>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 1 * 60 * 1000, // 1 minute - fresh for badge display
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to send a new message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
    },
  });
}

/**
 * Hook to mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkAsReadPayload) => markMessagesAsRead(payload),
    onSuccess: (_, variables) => {
      // Invalidate affected message details
      variables.messageIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: messageKeys.detail(id) });
      });
      // Invalidate lists and unread count
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
    },
  });
}

/**
 * Hook to archive messages
 */
export function useArchiveMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ArchiveMessagesPayload) => archiveMessages(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    },
  });
}

/**
 * Hook to delete a message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
    },
  });
}
