/**
 * Tests for Playlist Session React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import {
  usePlaylistSessionQuery,
  useSavePlaylistSession,
  useUpdatePlaylistSession,
} from '../usePlaylistSession';
import type { PlaylistSessionResponse } from '../../model/types';
import type { LearnerModuleSession, StaticPlaylistEntry } from '@/shared/lib/business-logic/playlist-engine';

describe('Playlist Session Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================
  // MOCK DATA
  // =====================

  const mockStaticEntry: StaticPlaylistEntry = {
    entryId: 'entry-1',
    title: 'Introduction to EMDR',
    kind: 'static',
    lu: {
      id: 'lu-1',
      title: 'Introduction to EMDR',
      type: 'media',
      contentId: 'content-1',
      category: 'topic',
      isRequired: true,
      sequence: 1,
      estimatedDuration: 600,
    },
  };

  const mockSession: LearnerModuleSession = {
    enrollmentId: 'enroll-1',
    moduleId: 'mod-1',
    playlist: [mockStaticEntry],
    currentIndex: 0,
    nodeProgress: {},
    gateAttempts: {},
    isComplete: false,
    skippedEntries: [],
  };

  const mockSessionResponse: PlaylistSessionResponse = {
    id: 'session-1',
    enrollmentId: 'enroll-1',
    moduleId: 'mod-1',
    session: mockSession,
    savedAt: '2026-02-09T10:00:00Z',
  };

  // =====================
  // QUERY HOOKS
  // =====================

  describe('usePlaylistSessionQuery', () => {
    it('should fetch a playlist session for enrollment and module', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSessionResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        usePlaylistSessionQuery('enroll-1', 'mod-1')
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSessionResponse);
      expect(result.current.data?.id).toBe('session-1');
      expect(result.current.data?.enrollmentId).toBe('enroll-1');
      expect(result.current.data?.moduleId).toBe('mod-1');
      expect(result.current.data?.session.playlist).toHaveLength(1);
    });

    it('should not fetch when enrollmentId is undefined', () => {
      const { result } = renderHook(() =>
        usePlaylistSessionQuery(undefined, 'mod-1')
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when moduleId is undefined', () => {
      const { result } = renderHook(() =>
        usePlaylistSessionQuery('enroll-1', undefined)
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when both enrollmentId and moduleId are undefined', () => {
      const { result } = renderHook(() =>
        usePlaylistSessionQuery(undefined, undefined)
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when enrollmentId is empty string', () => {
      const { result } = renderHook(() =>
        usePlaylistSessionQuery('', 'mod-1')
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle 404 as null (no session found)', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json(
            { success: false, message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() =>
        usePlaylistSessionQuery('enroll-1', 'mod-1')
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should propagate non-404 errors', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() =>
        usePlaylistSessionQuery('enroll-1', 'mod-1')
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should include session data with correct structure', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSessionResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        usePlaylistSessionQuery('enroll-1', 'mod-1')
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const session = result.current.data?.session;
      expect(session).toBeDefined();
      expect(session?.enrollmentId).toBe('enroll-1');
      expect(session?.moduleId).toBe('mod-1');
      expect(session?.currentIndex).toBe(0);
      expect(session?.isComplete).toBe(false);
      expect(session?.nodeProgress).toEqual({});
      expect(session?.gateAttempts).toEqual({});
      expect(session?.skippedEntries).toEqual([]);
    });
  });

  // =====================
  // MUTATION HOOKS
  // =====================

  describe('useSavePlaylistSession', () => {
    it('should save a new playlist session', async () => {
      server.use(
        http.post(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSessionResponse,
          });
        })
      );

      const { result } = renderHook(() => useSavePlaylistSession());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          moduleId: 'mod-1',
          session: mockSession,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSessionResponse);
      expect(result.current.data?.id).toBe('session-1');
    });

    it('should update the query cache on success', async () => {
      server.use(
        http.post(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSessionResponse,
          });
        })
      );

      const { result, queryClient } = renderHook(() => useSavePlaylistSession());

      await act(async () => {
        await result.current.mutateAsync({
          enrollmentId: 'enroll-1',
          moduleId: 'mod-1',
          session: mockSession,
        });
      });

      // The onSuccess handler should have set the cache via queryClient.setQueryData
      const cachedData = queryClient.getQueryData([
        'playlist-sessions',
        'detail',
        'enroll-1',
        'mod-1',
      ]);
      expect(cachedData).toEqual(mockSessionResponse);
    });

    it('should handle save error', async () => {
      server.use(
        http.post(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed to save' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useSavePlaylistSession());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          moduleId: 'mod-1',
          session: mockSession,
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should save session with node progress and gate attempts', async () => {
      const sessionWithProgress: LearnerModuleSession = {
        ...mockSession,
        currentIndex: 2,
        nodeProgress: {
          'node-1': { mastery: 0.8, attempts: 3 },
          'node-2': { mastery: 0.5, attempts: 1 },
        },
        gateAttempts: {
          'lu-gate-1': [
            {
              luId: 'lu-gate-1',
              passed: false,
              score: 0.6,
              attemptNumber: 1,
              failedNodes: ['node-2'],
            },
          ],
        },
        skippedEntries: ['entry-3'],
      };

      const responseWithProgress: PlaylistSessionResponse = {
        ...mockSessionResponse,
        session: sessionWithProgress,
      };

      server.use(
        http.post(`${baseUrl}/enrollments/enroll-1/playlist-session`, () => {
          return HttpResponse.json({
            success: true,
            data: responseWithProgress,
          });
        })
      );

      const { result } = renderHook(() => useSavePlaylistSession());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          moduleId: 'mod-1',
          session: sessionWithProgress,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.session.nodeProgress['node-1'].mastery).toBe(0.8);
      expect(result.current.data?.session.gateAttempts['lu-gate-1']).toHaveLength(1);
      expect(result.current.data?.session.skippedEntries).toEqual(['entry-3']);
    });
  });

  describe('useUpdatePlaylistSession', () => {
    it('should update an existing playlist session', async () => {
      const updatedSession: LearnerModuleSession = {
        ...mockSession,
        currentIndex: 1,
        isComplete: false,
      };

      const updatedResponse: PlaylistSessionResponse = {
        ...mockSessionResponse,
        session: updatedSession,
        savedAt: '2026-02-09T12:00:00Z',
      };

      server.use(
        http.put(
          `${baseUrl}/enrollments/enroll-1/playlist-session/session-1`,
          () => {
            return HttpResponse.json({
              success: true,
              data: updatedResponse,
            });
          }
        )
      );

      const { result } = renderHook(() => useUpdatePlaylistSession());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          sessionId: 'session-1',
          session: updatedSession,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedResponse);
      expect(result.current.data?.session.currentIndex).toBe(1);
    });

    it('should update the query cache on success', async () => {
      const updatedSession: LearnerModuleSession = {
        ...mockSession,
        currentIndex: 3,
        isComplete: true,
      };

      const updatedResponse: PlaylistSessionResponse = {
        ...mockSessionResponse,
        session: updatedSession,
        savedAt: '2026-02-09T14:00:00Z',
      };

      server.use(
        http.put(
          `${baseUrl}/enrollments/enroll-1/playlist-session/session-1`,
          () => {
            return HttpResponse.json({
              success: true,
              data: updatedResponse,
            });
          }
        )
      );

      const { result, queryClient } = renderHook(() => useUpdatePlaylistSession());

      await act(async () => {
        await result.current.mutateAsync({
          enrollmentId: 'enroll-1',
          sessionId: 'session-1',
          session: updatedSession,
        });
      });

      // The onSuccess handler should have set the cache via queryClient.setQueryData
      const cachedData = queryClient.getQueryData([
        'playlist-sessions',
        'detail',
        'enroll-1',
        'mod-1',
      ]);
      expect(cachedData).toEqual(updatedResponse);
    });

    it('should handle update error', async () => {
      server.use(
        http.put(
          `${baseUrl}/enrollments/enroll-1/playlist-session/session-1`,
          () => {
            return HttpResponse.json(
              { success: false, message: 'Session not found' },
              { status: 404 }
            );
          }
        )
      );

      const { result } = renderHook(() => useUpdatePlaylistSession());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          sessionId: 'session-1',
          session: mockSession,
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should update session with completed state', async () => {
      const completedSession: LearnerModuleSession = {
        ...mockSession,
        currentIndex: 1,
        isComplete: true,
        nodeProgress: {
          'node-1': { mastery: 1.0, attempts: 2 },
        },
      };

      const completedResponse: PlaylistSessionResponse = {
        ...mockSessionResponse,
        session: completedSession,
        savedAt: '2026-02-09T16:00:00Z',
      };

      server.use(
        http.put(
          `${baseUrl}/enrollments/enroll-1/playlist-session/session-1`,
          () => {
            return HttpResponse.json({
              success: true,
              data: completedResponse,
            });
          }
        )
      );

      const { result } = renderHook(() => useUpdatePlaylistSession());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          sessionId: 'session-1',
          session: completedSession,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.session.isComplete).toBe(true);
      expect(result.current.data?.session.nodeProgress['node-1'].mastery).toBe(1.0);
    });
  });
});
