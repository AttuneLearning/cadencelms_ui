# Discussion Boards & Messaging System Architecture
**Version:** 1.0.0
**Date:** 2026-01-11
**Status:** Architecture Design Document

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Discussion Boards Architecture](#discussion-boards-architecture)
3. [Messaging System Architecture](#messaging-system-architecture)
4. [Real-Time Communication](#real-time-communication)
5. [Security & Permissions](#security--permissions)
6. [Implementation Plan](#implementation-plan)

---

## System Overview

### Purpose
Implement two interconnected communication systems:
1. **Discussion Boards** - Public/semi-public threaded discussions for courses and classes
2. **Messaging System** - Private 1-on-1 or group messaging between users

### Key Requirements

#### Discussion Boards
- Course-level and class-level discussion boards
- Threaded conversations with replies
- Rich text editor with formatting
- File attachments
- Moderation capabilities
- Pinned/locked threads
- Search and filtering
- Notifications for new posts/replies
- Anonymous posting (optional per board)

#### Messaging System
- Direct messages (1-on-1)
- Group conversations
- Student → Instructor communication
- Student → Department Admin communication
- File sharing
- Real-time delivery
- Read receipts
- Typing indicators
- Search message history
- Message archiving

### Technology Stack

#### Backend
- **Framework:** Node.js + Express (or your current backend)
- **Database:** PostgreSQL (primary data)
- **Real-time:** Socket.io or WebSocket
- **File Storage:** S3-compatible storage or local
- **Search:** PostgreSQL full-text search or Elasticsearch
- **Queue:** Redis + Bull (for notifications)

#### Frontend
- **Framework:** React + TypeScript
- **State Management:** Zustand + React Query
- **Real-time:** Socket.io client
- **Rich Text Editor:** Tiptap or Draft.js
- **File Upload:** React Dropzone
- **UI Components:** shadcn/ui + Tailwind CSS
- **Notifications:** React Toastify

---

## Discussion Boards Architecture

### 1. Database Schema

#### Tables

```sql
-- Discussion Boards (one per course or class)
CREATE TABLE discussion_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('course', 'class')),
  entity_id UUID NOT NULL, -- course_id or class_id
  department_id UUID NOT NULL REFERENCES departments(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb, -- {allowAnonymous, requireApproval, etc}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Indexes
  CONSTRAINT unique_board_per_entity UNIQUE (type, entity_id)
);
CREATE INDEX idx_discussion_boards_entity ON discussion_boards(type, entity_id);
CREATE INDEX idx_discussion_boards_department ON discussion_boards(department_id);

-- Discussion Threads (top-level posts)
CREATE TABLE discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES discussion_boards(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP,
  last_reply_by UUID REFERENCES users(id),
  tags TEXT[], -- ['homework', 'question', 'announcement']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP,
  edited_by UUID REFERENCES users(id),

  -- Moderation
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'hidden', 'deleted')),
  moderated_at TIMESTAMP,
  moderated_by UUID REFERENCES users(id),
  moderation_reason TEXT
);
CREATE INDEX idx_threads_board ON discussion_threads(board_id);
CREATE INDEX idx_threads_author ON discussion_threads(author_id);
CREATE INDEX idx_threads_status ON discussion_threads(status);
CREATE INDEX idx_threads_created ON discussion_threads(created_at DESC);
CREATE INDEX idx_threads_last_reply ON discussion_threads(last_reply_at DESC);
CREATE INDEX idx_threads_tags ON discussion_threads USING gin(tags);

-- Discussion Replies (nested comments)
CREATE TABLE discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE, -- for nested replies
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  is_anonymous BOOLEAN DEFAULT false,
  is_answer BOOLEAN DEFAULT false, -- mark as accepted answer
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP,
  edited_by UUID REFERENCES users(id),

  -- Moderation
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'deleted')),
  moderated_at TIMESTAMP,
  moderated_by UUID REFERENCES users(id),
  moderation_reason TEXT
);
CREATE INDEX idx_replies_thread ON discussion_replies(thread_id);
CREATE INDEX idx_replies_parent ON discussion_replies(parent_id);
CREATE INDEX idx_replies_author ON discussion_replies(author_id);
CREATE INDEX idx_replies_created ON discussion_replies(created_at ASC);

-- Discussion Attachments
CREATE TABLE discussion_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('thread', 'reply')),
  entity_id UUID NOT NULL, -- thread_id or reply_id
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  mime_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_attachments_entity ON discussion_attachments(entity_type, entity_id);

-- Discussion Reactions (likes, helpful, etc.)
CREATE TABLE discussion_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('thread', 'reply')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'thanks', 'insightful')),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_user_reaction UNIQUE (entity_type, entity_id, user_id, reaction_type)
);
CREATE INDEX idx_reactions_entity ON discussion_reactions(entity_type, entity_id);
CREATE INDEX idx_reactions_user ON discussion_reactions(user_id);

-- Discussion Subscriptions (for notifications)
CREATE TABLE discussion_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('board', 'thread')),
  entity_id UUID NOT NULL,
  notify_new_threads BOOLEAN DEFAULT true, -- for board subscriptions
  notify_replies BOOLEAN DEFAULT true,
  notify_mentions BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_user_subscription UNIQUE (user_id, entity_type, entity_id)
);
CREATE INDEX idx_subscriptions_user ON discussion_subscriptions(user_id);
CREATE INDEX idx_subscriptions_entity ON discussion_subscriptions(entity_type, entity_id);

-- Discussion Read Status
CREATE TABLE discussion_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP DEFAULT NOW(),
  last_read_reply_id UUID REFERENCES discussion_replies(id),

  CONSTRAINT unique_user_thread_read UNIQUE (user_id, thread_id)
);
CREATE INDEX idx_read_status_user ON discussion_read_status(user_id);
CREATE INDEX idx_read_status_thread ON discussion_read_status(thread_id);
```

### 2. Backend API Endpoints

#### Discussion Boards

```typescript
// Board Management
GET    /api/discussions/boards                     // List all accessible boards
GET    /api/discussions/boards/:id                 // Get board details
GET    /api/discussions/courses/:courseId/board    // Get course board
GET    /api/discussions/classes/:classId/board     // Get class board
POST   /api/discussions/boards                     // Create board (admin/staff)
PUT    /api/discussions/boards/:id                 // Update board settings
DELETE /api/discussions/boards/:id                 // Delete board

// Threads
GET    /api/discussions/boards/:boardId/threads    // List threads (paginated)
POST   /api/discussions/boards/:boardId/threads    // Create new thread
GET    /api/discussions/threads/:id                // Get thread with replies
PUT    /api/discussions/threads/:id                // Update thread
DELETE /api/discussions/threads/:id                // Delete thread
POST   /api/discussions/threads/:id/pin            // Pin thread (moderator)
POST   /api/discussions/threads/:id/lock           // Lock thread (moderator)
POST   /api/discussions/threads/:id/resolve        // Mark as resolved

// Replies
GET    /api/discussions/threads/:threadId/replies  // Get all replies (nested)
POST   /api/discussions/threads/:threadId/replies  // Add reply
PUT    /api/discussions/replies/:id                // Edit reply
DELETE /api/discussions/replies/:id                // Delete reply
POST   /api/discussions/replies/:id/mark-answer    // Mark as accepted answer

// Attachments
POST   /api/discussions/threads/:threadId/attachments    // Upload attachment
POST   /api/discussions/replies/:replyId/attachments     // Upload attachment
GET    /api/discussions/attachments/:id                  // Download attachment
DELETE /api/discussions/attachments/:id                  // Delete attachment

// Reactions
POST   /api/discussions/threads/:threadId/reactions      // Add reaction
POST   /api/discussions/replies/:replyId/reactions       // Add reaction
DELETE /api/discussions/reactions/:id                    // Remove reaction

// Subscriptions
POST   /api/discussions/boards/:boardId/subscribe        // Subscribe to board
POST   /api/discussions/threads/:threadId/subscribe      // Subscribe to thread
DELETE /api/discussions/subscriptions/:id                // Unsubscribe

// Moderation
GET    /api/discussions/boards/:boardId/pending          // Get pending posts
POST   /api/discussions/threads/:threadId/approve        // Approve thread
POST   /api/discussions/threads/:threadId/hide           // Hide thread
POST   /api/discussions/replies/:replyId/hide            // Hide reply

// Search
GET    /api/discussions/search?q=query&boardId=...       // Search discussions
```

#### API Response Types

```typescript
// Board
interface DiscussionBoard {
  id: string;
  type: 'course' | 'class';
  entityId: string;
  departmentId: string;
  title: string;
  description: string;
  settings: {
    allowAnonymous: boolean;
    requireApproval: boolean;
    allowAttachments: boolean;
    maxAttachmentSize: number;
    allowedFileTypes: string[];
  };
  isActive: boolean;
  threadCount: number;
  lastActivityAt: string;
  userPermissions: {
    canPost: boolean;
    canModerate: boolean;
    canPin: boolean;
    canLock: boolean;
  };
}

// Thread
interface DiscussionThread {
  id: string;
  boardId: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  isAnonymous: boolean;
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: string;
  lastReplyBy?: {
    id: string;
    name: string;
  };
  tags: string[];
  attachments: Attachment[];
  reactions: ReactionSummary[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  userReactions: string[]; // current user's reactions
  isSubscribed: boolean;
}

// Reply
interface DiscussionReply {
  id: string;
  threadId: string;
  parentId?: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  isAnonymous: boolean;
  isAnswer: boolean;
  likeCount: number;
  attachments: Attachment[];
  reactions: ReactionSummary[];
  replies: DiscussionReply[]; // nested replies
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  userReactions: string[];
}

// Attachment
interface Attachment {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  createdAt: string;
}

// Reaction Summary
interface ReactionSummary {
  type: 'like' | 'helpful' | 'thanks' | 'insightful';
  count: number;
  users: Array<{ id: string; name: string }>; // first 3 users
}
```

### 3. Frontend Architecture

#### Component Structure

```
src/
├── features/
│   └── discussions/
│       ├── model/
│       │   ├── discussionStore.ts          // Zustand store
│       │   ├── types.ts                    // TypeScript interfaces
│       │   └── hooks.ts                    // Custom hooks
│       ├── api/
│       │   ├── discussionApi.ts            // API client
│       │   └── endpoints.ts                // API endpoints
│       └── ui/
│           ├── DiscussionBoardView.tsx     // Board container
│           ├── ThreadList.tsx              // Thread list with filters
│           ├── ThreadCard.tsx              // Thread preview card
│           ├── ThreadDetail.tsx            // Full thread view
│           ├── CreateThreadForm.tsx        // New thread form
│           ├── ReplyForm.tsx               // Reply form
│           ├── ReplyItem.tsx               // Single reply component
│           ├── RichTextEditor.tsx          // Tiptap editor
│           ├── AttachmentUploader.tsx      // File upload
│           ├── ReactionButtons.tsx         // Like/reaction UI
│           └── ModerationPanel.tsx         // Moderator tools
├── pages/
│   └── discussions/
│       ├── DiscussionBoardPage.tsx         // /discussions/:boardId
│       ├── ThreadDetailPage.tsx            // /discussions/threads/:threadId
│       └── CreateThreadPage.tsx            // /discussions/:boardId/new
└── widgets/
    └── discussions/
        └── DiscussionWidget.tsx            // Sidebar widget
```

#### Key Frontend Components

**1. DiscussionBoardView**
```typescript
interface DiscussionBoardViewProps {
  boardId: string;
  courseId?: string;
  classId?: string;
}

export const DiscussionBoardView: React.FC<DiscussionBoardViewProps> = ({
  boardId,
  courseId,
  classId,
}) => {
  const { board, threads, isLoading } = useDiscussionBoard(boardId);
  const { canPost, canModerate } = usePermission();

  return (
    <div className="discussion-board">
      <BoardHeader board={board} canModerate={canModerate} />
      <ThreadFilters />
      {canPost && <CreateThreadButton />}
      <ThreadList threads={threads} isLoading={isLoading} />
      <Pagination />
    </div>
  );
};
```

**2. ThreadDetail**
```typescript
interface ThreadDetailProps {
  threadId: string;
}

export const ThreadDetail: React.FC<ThreadDetailProps> = ({ threadId }) => {
  const { thread, replies, isLoading } = useThread(threadId);
  const { canReply, canModerate } = usePermission();

  return (
    <div className="thread-detail">
      <ThreadHeader thread={thread} />
      <ThreadContent thread={thread} />
      <ThreadReactions thread={thread} />
      <ThreadAttachments attachments={thread.attachments} />

      <ReplyList replies={replies} threadId={threadId} />

      {canReply && !thread.isLocked && (
        <ReplyForm threadId={threadId} />
      )}

      {canModerate && (
        <ModerationPanel thread={thread} />
      )}
    </div>
  );
};
```

**3. RichTextEditor**
```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowAttachments?: boolean;
  maxLength?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  allowAttachments,
  maxLength,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
      Link,
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="editor-container">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      {allowAttachments && <AttachmentUploader />}
      <CharacterCounter editor={editor} />
    </div>
  );
};
```

#### State Management (Zustand)

```typescript
interface DiscussionStore {
  // State
  boards: Map<string, DiscussionBoard>;
  threads: Map<string, DiscussionThread>;
  replies: Map<string, DiscussionReply[]>;
  subscriptions: Set<string>;

  // Actions
  fetchBoard: (boardId: string) => Promise<void>;
  fetchThreads: (boardId: string, filters?: ThreadFilters) => Promise<void>;
  fetchThread: (threadId: string) => Promise<void>;
  createThread: (boardId: string, data: CreateThreadData) => Promise<string>;
  updateThread: (threadId: string, data: UpdateThreadData) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  createReply: (threadId: string, data: CreateReplyData) => Promise<void>;
  updateReply: (replyId: string, data: UpdateReplyData) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;
  addReaction: (entityType: string, entityId: string, type: string) => Promise<void>;
  removeReaction: (entityType: string, entityId: string, type: string) => Promise<void>;
  subscribe: (entityType: string, entityId: string) => Promise<void>;
  unsubscribe: (subscriptionId: string) => Promise<void>;

  // Real-time updates
  handleNewThread: (thread: DiscussionThread) => void;
  handleNewReply: (reply: DiscussionReply) => void;
  handleThreadUpdate: (thread: Partial<DiscussionThread>) => void;
}
```

---

## Messaging System Architecture

### 1. Database Schema

```sql
-- Conversations (1-on-1 or group)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
  title VARCHAR(255), -- for group conversations
  is_group BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT false
);
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Conversation Participants
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP,
  last_read_message_id UUID,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  is_muted BOOLEAN DEFAULT false,
  left_at TIMESTAMP, -- null if active

  CONSTRAINT unique_conversation_participant UNIQUE (conversation_id, user_id)
);
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_active ON conversation_participants(user_id, left_at) WHERE left_at IS NULL;

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  replied_to_id UUID REFERENCES messages(id), -- for message threading
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Full-text search
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_content_search ON messages USING gin(content_tsv);

-- Message Attachments
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500), -- for images
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_msg_attachments_message ON message_attachments(message_id);

-- Message Read Receipts
CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  read_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_message_read UNIQUE (message_id, user_id)
);
CREATE INDEX idx_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX idx_read_receipts_user ON message_read_receipts(user_id);

-- Typing Indicators (Redis cache, optional DB backup)
CREATE TABLE typing_indicators (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 seconds',

  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX idx_typing_conversation ON typing_indicators(conversation_id);

-- Message Reactions
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  reaction VARCHAR(50) NOT NULL, -- emoji or reaction type
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_message_user_reaction UNIQUE (message_id, user_id, reaction)
);
CREATE INDEX idx_msg_reactions_message ON message_reactions(message_id);

-- Allowed Conversations (for restrictions)
-- e.g., students can only message instructors of their courses
CREATE TABLE messaging_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  can_message_user_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(100), -- 'course_instructor', 'department_admin', etc.
  context_type VARCHAR(20), -- 'course', 'class', 'department'
  context_id UUID,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,

  CONSTRAINT unique_messaging_permission UNIQUE (user_id, can_message_user_id, context_type, context_id)
);
CREATE INDEX idx_msg_permissions_user ON messaging_permissions(user_id);
CREATE INDEX idx_msg_permissions_target ON messaging_permissions(can_message_user_id);
```

### 2. Backend API Endpoints

#### Messaging

```typescript
// Conversations
GET    /api/messages/conversations                      // List user's conversations
POST   /api/messages/conversations                      // Create new conversation
GET    /api/messages/conversations/:id                  // Get conversation details
PUT    /api/messages/conversations/:id                  // Update conversation (rename, etc.)
DELETE /api/messages/conversations/:id                  // Delete/leave conversation
POST   /api/messages/conversations/:id/archive          // Archive conversation
POST   /api/messages/conversations/:id/participants     // Add participants (group)
DELETE /api/messages/conversations/:id/participants/:userId // Remove participant

// Messages
GET    /api/messages/conversations/:conversationId/messages  // Get messages (paginated)
POST   /api/messages/conversations/:conversationId/messages  // Send message
PUT    /api/messages/:id                                     // Edit message
DELETE /api/messages/:id                                     // Delete message
POST   /api/messages/:id/read                                // Mark as read
POST   /api/messages/:id/reactions                           // Add reaction
DELETE /api/messages/:id/reactions/:reaction                 // Remove reaction

// Attachments
POST   /api/messages/:messageId/attachments              // Upload attachment
GET    /api/messages/attachments/:id                     // Download attachment
DELETE /api/messages/attachments/:id                     // Delete attachment

// Real-time
POST   /api/messages/conversations/:conversationId/typing/start  // Start typing
POST   /api/messages/conversations/:conversationId/typing/stop   // Stop typing

// Search & Discovery
GET    /api/messages/users/search?q=query               // Search users to message
GET    /api/messages/users/:userId/can-message          // Check if can message user
GET    /api/messages/search?q=query                     // Search messages
GET    /api/messages/unread-count                       // Get unread count
```

#### API Response Types

```typescript
// Conversation
interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  isGroup: boolean;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Participant
interface ConversationParticipant {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    isOnline: boolean;
  };
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
  lastReadMessageId?: string;
  isTyping: boolean;
}

// Message
interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  messageType: 'text' | 'file' | 'system';
  repliedTo?: {
    id: string;
    content: string;
    sender: { id: string; name: string };
  };
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  readBy: Array<{ userId: string; readAt: string }>;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  createdAt: string;
}

// Attachment
interface MessageAttachment {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  thumbnailUrl?: string;
}

// Reaction
interface MessageReaction {
  reaction: string; // emoji
  count: number;
  users: Array<{ id: string; name: string }>;
}

// User Search Result
interface MessageableUser {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department?: string;
  canMessage: boolean;
  reason?: string; // why they can message
  existingConversationId?: string;
}
```

### 3. Frontend Architecture

#### Component Structure

```
src/
├── features/
│   └── messaging/
│       ├── model/
│       │   ├── messagingStore.ts           // Zustand store
│       │   ├── types.ts                    // TypeScript interfaces
│       │   ├── hooks.ts                    // Custom hooks
│       │   └── socket.ts                   // WebSocket client
│       ├── api/
│       │   ├── messagingApi.ts             // API client
│       │   └── endpoints.ts                // API endpoints
│       └── ui/
│           ├── MessagingContainer.tsx      // Main messaging UI
│           ├── ConversationList.tsx        // Sidebar conversation list
│           ├── ConversationItem.tsx        // Conversation preview
│           ├── ChatWindow.tsx              // Message display area
│           ├── MessageBubble.tsx           // Single message
│           ├── MessageInput.tsx            // Compose message
│           ├── AttachmentPreview.tsx       // File preview
│           ├── UserSearch.tsx              // Search users to message
│           ├── CreateConversationModal.tsx // New conversation
│           ├── ConversationHeader.tsx      // Conversation info
│           └── TypingIndicator.tsx         // "User is typing..."
├── pages/
│   └── messages/
│       ├── MessagesPage.tsx                // /messages
│       └── ConversationPage.tsx            // /messages/:conversationId
└── widgets/
    └── messaging/
        ├── MessageNotificationBadge.tsx    // Unread count badge
        └── QuickMessageWidget.tsx          // Quick message popup
```

#### Key Frontend Components

**1. MessagingContainer**
```typescript
export const MessagingContainer: React.FC = () => {
  const { conversations, selectedConversationId, selectConversation } = useMessaging();
  const { isConnected } = useMessageSocket();

  return (
    <div className="messaging-container flex h-screen">
      <div className="w-80 border-r">
        <MessagingHeader />
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={selectConversation}
        />
      </div>

      <div className="flex-1">
        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
        ) : (
          <EmptyState />
        )}
      </div>

      {!isConnected && <ConnectionStatusBar />}
    </div>
  );
};
```

**2. ChatWindow**
```typescript
interface ChatWindowProps {
  conversationId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const { conversation, messages, isLoading } = useConversation(conversationId);
  const { sendMessage, markAsRead } = useMessaging();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markAsRead(conversationId);
    messagesEndRef.current?.scrollIntoView();
  }, [messages, conversationId]);

  return (
    <div className="chat-window flex flex-col h-full">
      <ConversationHeader conversation={conversation} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
        <TypingIndicator conversationId={conversationId} />
      </div>

      <MessageInput
        conversationId={conversationId}
        onSend={sendMessage}
      />
    </div>
  );
};
```

**3. MessageInput**
```typescript
interface MessageInputProps {
  conversationId: string;
  onSend: (content: string, attachments?: File[]) => Promise<void>;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onSend,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);

  const handleChange = (value: string) => {
    setContent(value);
    if (value) startTyping();
    else stopTyping();
  };

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return;

    await onSend(content, attachments);
    setContent('');
    setAttachments([]);
    stopTyping();
  };

  return (
    <div className="message-input border-t p-4">
      <AttachmentPreview attachments={attachments} onRemove={...} />

      <div className="flex gap-2">
        <AttachmentButton onSelect={setAttachments} />
        <TextArea
          value={content}
          onChange={handleChange}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <SendButton onClick={handleSend} disabled={!content.trim()} />
      </div>
    </div>
  );
};
```

#### State Management (Zustand)

```typescript
interface MessagingStore {
  // State
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;
  selectedConversationId: string | null;
  unreadCount: number;
  isConnected: boolean;
  typingUsers: Map<string, Set<string>>; // conversationId -> Set of userIds

  // Actions
  fetchConversations: () => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<void>;
  fetchMessages: (conversationId: string, before?: string) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  createConversation: (userIds: string[], title?: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string, attachments?: File[]) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;

  // Real-time handlers
  handleNewMessage: (message: Message) => void;
  handleMessageUpdate: (message: Partial<Message>) => void;
  handleMessageDelete: (messageId: string) => void;
  handleTypingStart: (conversationId: string, userId: string) => void;
  handleTypingStop: (conversationId: string, userId: string) => void;
  handleReadReceipt: (conversationId: string, userId: string, messageId: string) => void;

  // WebSocket connection
  connect: () => void;
  disconnect: () => void;
  setConnected: (connected: boolean) => void;
}
```

---

## Real-Time Communication

### WebSocket Events

#### Discussion Boards

```typescript
// Client → Server
socket.emit('discussion:join-board', { boardId });
socket.emit('discussion:leave-board', { boardId });
socket.emit('discussion:join-thread', { threadId });
socket.emit('discussion:leave-thread', { threadId });

// Server → Client
socket.on('discussion:new-thread', (thread: DiscussionThread) => {...});
socket.on('discussion:thread-updated', (update: Partial<DiscussionThread>) => {...});
socket.on('discussion:new-reply', (reply: DiscussionReply) => {...});
socket.on('discussion:reply-updated', (update: Partial<DiscussionReply>) => {...});
socket.on('discussion:reaction-added', (data: ReactionEvent) => {...});
socket.on('discussion:user-viewing', (data: { threadId, userId, username }) => {...});
```

#### Messaging

```typescript
// Client → Server
socket.emit('message:join-conversation', { conversationId });
socket.emit('message:leave-conversation', { conversationId });
socket.emit('message:typing-start', { conversationId });
socket.emit('message:typing-stop', { conversationId });
socket.emit('message:read', { conversationId, messageId });

// Server → Client
socket.on('message:new', (message: Message) => {...});
socket.on('message:updated', (update: Partial<Message>) => {...});
socket.on('message:deleted', (messageId: string) => {...});
socket.on('message:typing-start', (data: { conversationId, userId, username }) => {...});
socket.on('message:typing-stop', (data: { conversationId, userId }) => {...});
socket.on('message:read', (data: { conversationId, userId, messageId }) => {...});
socket.on('message:reaction', (data: ReactionEvent) => {...});
socket.on('user:online-status', (data: { userId, isOnline }) => {...});
```

### WebSocket Implementation

**Backend (Socket.io)**
```typescript
// server/sockets/discussionSocket.ts
export const setupDiscussionSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;

    // Join board room
    socket.on('discussion:join-board', async ({ boardId }) => {
      // Check permissions
      const hasAccess = await checkBoardAccess(userId, boardId);
      if (!hasAccess) return;

      socket.join(`board:${boardId}`);
      console.log(`User ${userId} joined board ${boardId}`);
    });

    // New thread notification
    socket.on('discussion:new-thread', async (thread) => {
      // Broadcast to board room
      io.to(`board:${thread.boardId}`).emit('discussion:new-thread', thread);

      // Send notifications to subscribed users
      await notifyBoardSubscribers(thread.boardId, thread);
    });

    // New reply notification
    socket.on('discussion:new-reply', async (reply) => {
      // Broadcast to thread room
      io.to(`thread:${reply.threadId}`).emit('discussion:new-reply', reply);

      // Send notifications to subscribed users
      await notifyThreadSubscribers(reply.threadId, reply);
    });
  });
};

// server/sockets/messagingSocket.ts
export const setupMessagingSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;

    // Mark user as online
    updateUserOnlineStatus(userId, true);
    io.emit('user:online-status', { userId, isOnline: true });

    // Join conversation rooms for user's conversations
    const userConversations = await getUserConversations(userId);
    userConversations.forEach(conv => {
      socket.join(`conversation:${conv.id}`);
    });

    // Typing indicators
    socket.on('message:typing-start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:typing-start', {
        conversationId,
        userId,
        username: socket.data.username,
      });
    });

    socket.on('message:typing-stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:typing-stop', {
        conversationId,
        userId,
      });
    });

    // New message
    socket.on('message:send', async (data) => {
      const message = await createMessage(data);

      // Broadcast to conversation room
      io.to(`conversation:${message.conversationId}`).emit('message:new', message);

      // Send push notifications to offline users
      await notifyConversationParticipants(message);
    });

    // Read receipts
    socket.on('message:read', async ({ conversationId, messageId }) => {
      await markMessageAsRead(messageId, userId);

      socket.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        userId,
        messageId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      updateUserOnlineStatus(userId, false);
      io.emit('user:online-status', { userId, isOnline: false });
    });
  });
};
```

**Frontend (Socket.io Client)**
```typescript
// features/messaging/model/socket.ts
import { io, Socket } from 'socket.io-client';
import { useMessagingStore } from './messagingStore';

class MessageSocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.VITE_WS_URL || 'ws://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      useMessagingStore.getState().setConnected(true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      useMessagingStore.getState().setConnected(false);
    });

    this.setupMessageListeners();
  }

  private setupMessageListeners() {
    if (!this.socket) return;

    // New message
    this.socket.on('message:new', (message: Message) => {
      useMessagingStore.getState().handleNewMessage(message);
    });

    // Typing indicators
    this.socket.on('message:typing-start', ({ conversationId, userId, username }) => {
      useMessagingStore.getState().handleTypingStart(conversationId, userId);
    });

    this.socket.on('message:typing-stop', ({ conversationId, userId }) => {
      useMessagingStore.getState().handleTypingStop(conversationId, userId);
    });

    // Read receipts
    this.socket.on('message:read', ({ conversationId, userId, messageId }) => {
      useMessagingStore.getState().handleReadReceipt(conversationId, userId, messageId);
    });
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('message:join-conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('message:leave-conversation', { conversationId });
  }

  sendTypingStart(conversationId: string) {
    this.socket?.emit('message:typing-start', { conversationId });
  }

  sendTypingStop(conversationId: string) {
    this.socket?.emit('message:typing-stop', { conversationId });
  }

  markAsRead(conversationId: string, messageId: string) {
    this.socket?.emit('message:read', { conversationId, messageId });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const messageSocket = new MessageSocketClient();
```

---

## Security & Permissions

### Discussion Boards Permissions

```typescript
// Check board access
async function canAccessBoard(userId: string, boardId: string): Promise<boolean> {
  const board = await getBoard(boardId);
  const user = await getUser(userId);

  // Check if user has access to the entity (course/class)
  if (board.type === 'course') {
    return await isEnrolledInCourse(userId, board.entityId) ||
           await canAccessCourse(userId, board.entityId);
  } else if (board.type === 'class') {
    return await isEnrolledInClass(userId, board.entityId) ||
           await canAccessClass(userId, board.entityId);
  }

  return false;
}

// Check posting permissions
async function canPostToBoard(userId: string, boardId: string): Promise<boolean> {
  const board = await getBoard(boardId);
  const user = await getUser(userId);

  // Check base access
  if (!await canAccessBoard(userId, boardId)) return false;

  // Check if board is active
  if (!board.isActive) {
    // Only moderators can post to inactive boards
    return await isModerator(userId, boardId);
  }

  // Check user permissions
  return await hasPermission(userId, 'discussions:threads:create', board.departmentId);
}

// Check moderation permissions
async function canModerate(userId: string, boardId: string): Promise<boolean> {
  const board = await getBoard(boardId);
  const user = await getUser(userId);

  return await hasAnyPermission(userId, [
    'discussions:moderate',
    'content:courses:manage',
  ], board.departmentId);
}

// Required permissions
const discussionPermissions = {
  'discussions:boards:read': 'View discussion boards',
  'discussions:threads:create': 'Create new threads',
  'discussions:threads:update': 'Edit own threads',
  'discussions:threads:delete': 'Delete own threads',
  'discussions:replies:create': 'Post replies',
  'discussions:replies:update': 'Edit own replies',
  'discussions:replies:delete': 'Delete own replies',
  'discussions:moderate': 'Moderate discussions (pin, lock, hide)',
  'discussions:moderate-all': 'Moderate all discussions (including others)',
};
```

### Messaging Permissions

```typescript
// Check if user can message another user
async function canMessageUser(fromUserId: string, toUserId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // Self-messaging not allowed
  if (fromUserId === toUserId) {
    return { allowed: false };
  }

  // Global admins can message anyone
  if (await isGlobalAdmin(fromUserId)) {
    return { allowed: true, reason: 'global_admin' };
  }

  // Check if they share any courses (instructor-student)
  const sharedCourses = await getSharedCourses(fromUserId, toUserId);
  if (sharedCourses.length > 0) {
    const isInstructor = await isInstructorInCourses(toUserId, sharedCourses);
    if (isInstructor) {
      return { allowed: true, reason: 'course_instructor' };
    }
  }

  // Check if target is department admin for user's department
  const userDepartments = await getUserDepartments(fromUserId);
  const isDeptAdmin = await isDepartmentAdminForDepartments(toUserId, userDepartments);
  if (isDeptAdmin) {
    return { allowed: true, reason: 'department_admin' };
  }

  // Check if they're both staff in same department
  const sharedDepartments = await getSharedDepartments(fromUserId, toUserId, 'staff');
  if (sharedDepartments.length > 0) {
    return { allowed: true, reason: 'same_department' };
  }

  // Check messaging permissions table
  const hasExplicitPermission = await hasMessagingPermission(fromUserId, toUserId);
  if (hasExplicitPermission) {
    return { allowed: true, reason: 'explicit_permission' };
  }

  // Default: not allowed
  return { allowed: false };
}

// Grant messaging permission (e.g., when enrolling in course)
async function grantMessagingPermission(
  userId: string,
  targetUserId: string,
  reason: string,
  contextType: string,
  contextId: string,
  expiresAt?: Date
) {
  await db.messagingPermissions.create({
    userId,
    canMessageUserId: targetUserId,
    reason,
    contextType,
    contextId,
    expiresAt,
  });
}

// Example: Grant permission when student enrolls in course
async function onCourseEnrollment(studentId: string, courseId: string) {
  const instructors = await getCourseInstructors(courseId);

  for (const instructor of instructors) {
    await grantMessagingPermission(
      studentId,
      instructor.id,
      'course_instructor',
      'course',
      courseId
    );
  }
}

// Required permissions
const messagingPermissions = {
  'messaging:conversations:create': 'Create conversations',
  'messaging:messages:send': 'Send messages',
  'messaging:messages:read': 'Read messages',
  'messaging:messages:delete': 'Delete own messages',
  'messaging:conversations:leave': 'Leave conversations',
  'messaging:broadcast': 'Send broadcast messages (admin only)',
};
```

### Content Security

```typescript
// Sanitize HTML content from rich text editor
import DOMPurify from 'dompurify';

function sanitizeContent(htmlContent: string): string {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'a', 'img',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

// Validate file uploads
async function validateFileUpload(file: File): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Check file size
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB' };
  }

  // Check mime type
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file signature (magic numbers) to prevent mime type spoofing
  const isValidSignature = await validateFileSignature(file);
  if (!isValidSignature) {
    return { valid: false, error: 'Invalid file format' };
  }

  return { valid: true };
}

// Rate limiting
const rateLimits = {
  'discussion:create-thread': { points: 10, duration: 3600 }, // 10 threads per hour
  'discussion:create-reply': { points: 30, duration: 3600 },  // 30 replies per hour
  'message:send': { points: 60, duration: 60 },               // 60 messages per minute
  'message:typing': { points: 100, duration: 60 },            // 100 typing events per minute
};
```

---

## Implementation Plan

### Phase 1: Discussion Boards Foundation (Week 1-2)

**Backend:**
- [ ] Database schema for discussion boards, threads, replies
- [ ] API endpoints for boards, threads, replies
- [ ] Permission checks integration with V2 Role System
- [ ] Basic moderation endpoints

**Frontend:**
- [ ] Discussion board view page
- [ ] Thread list component
- [ ] Thread detail component
- [ ] Create thread form
- [ ] Reply form and list
- [ ] Basic styling with shadcn/ui

**Testing:**
- [ ] API endpoint tests
- [ ] Permission tests
- [ ] Component tests

### Phase 2: Discussion Boards Features (Week 3)

**Backend:**
- [ ] File attachments for threads/replies
- [ ] Reactions system
- [ ] Subscriptions and notifications
- [ ] Search functionality
- [ ] Moderation actions (pin, lock, hide)

**Frontend:**
- [ ] Rich text editor (Tiptap)
- [ ] File upload component
- [ ] Reaction buttons
- [ ] Search interface
- [ ] Moderation panel
- [ ] Notification integration

**Testing:**
- [ ] File upload tests
- [ ] Search tests
- [ ] Moderation tests

### Phase 3: Real-Time Discussion Boards (Week 4)

**Backend:**
- [ ] WebSocket server setup
- [ ] Real-time event handlers for discussions
- [ ] Online user tracking
- [ ] Typing indicators (optional)

**Frontend:**
- [ ] WebSocket client integration
- [ ] Real-time thread updates
- [ ] Real-time reply updates
- [ ] Live reaction updates
- [ ] Connection status handling

**Testing:**
- [ ] WebSocket integration tests
- [ ] Real-time update tests

### Phase 4: Messaging System Foundation (Week 5-6)

**Backend:**
- [ ] Database schema for conversations and messages
- [ ] Messaging permissions system
- [ ] API endpoints for conversations
- [ ] API endpoints for messages
- [ ] Read receipts implementation

**Frontend:**
- [ ] Messaging container layout
- [ ] Conversation list
- [ ] Chat window
- [ ] Message input component
- [ ] User search to start conversations

**Testing:**
- [ ] Messaging API tests
- [ ] Permission tests
- [ ] Component tests

### Phase 5: Messaging Features (Week 7)

**Backend:**
- [ ] File attachments for messages
- [ ] Group conversations
- [ ] Message reactions
- [ ] Message search
- [ ] Conversation archiving

**Frontend:**
- [ ] File upload in messages
- [ ] Group conversation UI
- [ ] Reaction picker
- [ ] Message search interface
- [ ] Archive functionality

**Testing:**
- [ ] File sharing tests
- [ ] Group conversation tests
- [ ] Search tests

### Phase 6: Real-Time Messaging (Week 8)

**Backend:**
- [ ] WebSocket real-time messaging
- [ ] Typing indicators
- [ ] Online status tracking
- [ ] Delivery and read receipts
- [ ] Push notifications

**Frontend:**
- [ ] Real-time message delivery
- [ ] Typing indicators
- [ ] Online status indicators
- [ ] Read receipts display
- [ ] Sound/desktop notifications

**Testing:**
- [ ] Real-time messaging tests
- [ ] Notification tests

### Phase 7: Polish & Optimization (Week 9-10)

**Both:**
- [ ] Performance optimization
- [ ] Database query optimization
- [ ] Load testing
- [ ] Security audit
- [ ] Accessibility audit
- [ ] Mobile responsive polish
- [ ] Error handling improvements
- [ ] Documentation

**Frontend:**
- [ ] Infinite scroll optimization
- [ ] Image lazy loading
- [ ] Virtual scrolling for large message lists
- [ ] Offline support (optional)

### Phase 8: Integration & Deployment (Week 11-12)

**Both:**
- [ ] Integration with V2 Role System
- [ ] Integration with notification system
- [ ] Integration with email system
- [ ] Deployment to staging
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Production deployment
- [ ] Monitoring setup

---

## Technical Considerations

### Performance Optimization

**Backend:**
- Use database indexes on frequently queried columns
- Implement pagination for all list endpoints
- Cache board/conversation metadata in Redis
- Use database connection pooling
- Optimize N+1 queries with eager loading
- Background jobs for notifications

**Frontend:**
- Virtual scrolling for long message/thread lists
- Debounce typing indicators
- Throttle scroll events
- Lazy load images and attachments
- Optimize re-renders with React.memo
- Use React Query cache effectively

### Scalability

- Horizontal scaling of WebSocket servers with Redis adapter
- CDN for file attachments
- Database read replicas for reporting
- Message queue for async operations
- Separate microservice for real-time (optional)

### Monitoring

- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- WebSocket connection monitoring
- Database query performance
- API response times
- User engagement metrics

---

## Open Questions

1. **File Storage:** Should we use S3-compatible storage or local filesystem?
2. **Search:** PostgreSQL full-text search or Elasticsearch?
3. **Push Notifications:** Web Push API, Firebase, or other?
4. **Moderation:** Do we need AI-powered content moderation?
5. **Anonymous Posting:** Should this be configurable per board?
6. **Message Editing:** Time limit for editing? Edit history?
7. **Message Deletion:** Hard delete or soft delete? Time limit?
8. **Attachments:** What file types should be allowed?
9. **Rich Text:** How much HTML should we allow in posts?
10. **Mobile App:** Will there be a mobile app that needs these APIs?

---

## Success Metrics

### Discussion Boards
- Average threads per course/class
- Average replies per thread
- User engagement rate
- Time to first reply
- Moderation actions per week

### Messaging
- Messages sent per day
- Active conversations
- Average response time
- User satisfaction with messaging
- Percentage of questions answered

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Status:** Ready for Review
**Estimated Timeline:** 12 weeks for full implementation
