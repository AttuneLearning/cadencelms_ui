/**
 * Message Entity - Public API
 */

// Types
export type {
  Message,
  MessageListItem,
  MessageType,
  MessageStatus,
  SenderRef,
  RelatedEntityRef,
  MessagesListResponse,
  MessageFilters,
  SendMessagePayload,
  UnreadCountResponse,
} from './model/types';

// Hooks
export {
  useMessages,
  useMessage,
  useUnreadCount,
  useSendMessage,
  useMarkAsRead,
  useArchiveMessages,
  useDeleteMessage,
} from './hooks/useMessages';

// API (exported for advanced use cases)
export * from './api/messageApi';

// Query Keys
export { messageKeys } from './model/messageKeys';
