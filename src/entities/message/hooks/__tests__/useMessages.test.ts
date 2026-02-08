/**
 * Tests for Message React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import {
  useMessages,
  useMessage,
  useUnreadCount,
  useSendMessage,
  useMarkAsRead,
  useArchiveMessages,
  useDeleteMessage,
} from '../useMessages';
import type {
  MessagesListResponse,
  Message,
  UnreadCountResponse,
  MessageListItem,
} from '../../model/types';

describe('Message Hooks', () => {
  // The message API uses full paths like '/api/v2/messages' while the axios
  // client already has baseURL set to apiFullUrl (/api/v2). This results in
  // the actual request URL being baseUrl + /api/v2/messages.
  const baseUrl = env.apiFullUrl;
  const msgBase = `${baseUrl}/api/v2/messages`;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mock data
  const mockMessageListItem: MessageListItem = {
    id: 'msg-1',
    type: 'direct',
    subject: 'Test Message',
    preview: 'This is a test message preview...',
    sender: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
    },
    status: 'unread',
    isImportant: false,
    createdAt: '2026-02-08T10:00:00Z',
    readAt: null,
  };

  const mockMessage: Message = {
    id: 'msg-1',
    type: 'direct',
    subject: 'Test Message',
    body: 'This is a test message body.',
    sender: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
    },
    recipientId: 'user-2',
    status: 'unread',
    isImportant: false,
    createdAt: '2026-02-08T10:00:00Z',
    readAt: null,
    updatedAt: '2026-02-08T10:00:00Z',
  };

  const mockListResponse: MessagesListResponse = {
    messages: [mockMessageListItem],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    unreadCount: 1,
  };

  const mockUnreadCount: UnreadCountResponse = {
    total: 3,
    byType: {
      direct: 2,
      announcement: 1,
      reminder: 0,
      system: 0,
    },
  };

  // =====================
  // QUERY HOOKS
  // =====================

  describe('useMessages', () => {
    it('should fetch messages list', async () => {
      server.use(
        http.get(`${msgBase}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListResponse,
          });
        })
      );

      const { result } = renderHook(() => useMessages());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockListResponse);
      expect(result.current.data?.messages).toHaveLength(1);
    });

    it('should fetch messages with filters', async () => {
      server.use(
        http.get(`${msgBase}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useMessages({ type: 'direct', status: 'unread' })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.messages).toHaveLength(1);
    });

    it('should handle loading state', () => {
      const { result } = renderHook(() => useMessages());
      expect(result.current.isPending).toBe(true);
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${msgBase}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useMessages());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useMessage', () => {
    it('should fetch single message by id', async () => {
      server.use(
        http.get(`${msgBase}/msg-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockMessage,
          });
        })
      );

      const { result } = renderHook(() => useMessage('msg-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMessage);
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useMessage(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useUnreadCount', () => {
    it('should fetch unread message count', async () => {
      server.use(
        http.get(`${msgBase}/unread-count`, () => {
          return HttpResponse.json({
            success: true,
            data: mockUnreadCount,
          });
        })
      );

      const { result } = renderHook(() => useUnreadCount());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.total).toBe(3);
      expect(result.current.data?.byType.direct).toBe(2);
    });
  });

  // =====================
  // MUTATION HOOKS
  // =====================

  describe('useSendMessage', () => {
    it('should send a message', async () => {
      server.use(
        http.post(`${msgBase}`, () => {
          return HttpResponse.json({
            success: true,
            data: { message: mockMessage },
          });
        })
      );

      const { result } = renderHook(() => useSendMessage());

      act(() => {
        result.current.mutate({
          recipientId: 'user-2',
          subject: 'Test Message',
          body: 'This is a test message body.',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMessage);
    });

    it('should handle send error', async () => {
      server.use(
        http.post(`${msgBase}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed to send' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useSendMessage());

      act(() => {
        result.current.mutate({
          recipientId: 'user-2',
          subject: 'Test',
          body: 'Test body',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useMarkAsRead', () => {
    it('should mark messages as read', async () => {
      server.use(
        http.patch(`${msgBase}/mark-read`, () => {
          return HttpResponse.json({
            success: true,
            data: { updatedCount: 2, messageIds: ['msg-1', 'msg-2'] },
          });
        })
      );

      const { result } = renderHook(() => useMarkAsRead());

      act(() => {
        result.current.mutate({ messageIds: ['msg-1', 'msg-2'] });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.updatedCount).toBe(2);
    });
  });

  describe('useArchiveMessages', () => {
    it('should archive messages', async () => {
      server.use(
        http.patch(`${msgBase}/archive`, () => {
          return HttpResponse.json({
            success: true,
            data: { archivedCount: 1, messageIds: ['msg-1'] },
          });
        })
      );

      const { result } = renderHook(() => useArchiveMessages());

      act(() => {
        result.current.mutate({ messageIds: ['msg-1'] });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.archivedCount).toBe(1);
    });
  });

  describe('useDeleteMessage', () => {
    it('should delete a message', async () => {
      server.use(
        http.delete(`${msgBase}/msg-1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useDeleteMessage());

      act(() => {
        result.current.mutate('msg-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle delete error', async () => {
      server.use(
        http.delete(`${msgBase}/msg-1`, () => {
          return HttpResponse.json(
            { success: false, message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteMessage());

      act(() => {
        result.current.mutate('msg-1');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
