/**
 * Discussion Entity - Public API
 */

// Types
export type {
  AuthorRef,
  AuthorType,
  DiscussionThread,
  DiscussionReply,
  ThreadPagination,
  ListThreadsResponse,
  ListRepliesResponse,
  ListThreadsParams,
  SearchThreadsParams,
  CreateThreadPayload,
  UpdateThreadPayload,
  CreateReplyPayload,
  UpdateReplyPayload,
  PinThreadPayload,
  LockThreadPayload,
  MarkAnswerPayload,
} from './model/types';

// Hooks
export {
  useThreads,
  useThread,
  useSearchThreads,
  useReplies,
  useCreateThread,
  useUpdateThread,
  useDeleteThread,
  usePinThread,
  useLockThread,
  useCreateReply,
  useUpdateReply,
  useDeleteReply,
  useMarkAsAnswer,
} from './hooks/useDiscussions';

// API (exported for advanced use cases)
export * from './api/discussionApi';

// Query Keys
export { discussionKeys } from './model/discussionKeys';
