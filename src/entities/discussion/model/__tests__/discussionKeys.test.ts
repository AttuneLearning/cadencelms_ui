/**
 * Discussion Query Keys Tests
 */

import { describe, it, expect } from 'vitest';
import { discussionKeys } from '../discussionKeys';

describe('discussionKeys', () => {
  it('should return base key array', () => {
    expect(discussionKeys.all).toEqual(['discussions']);
  });

  // =====================
  // THREAD KEYS
  // =====================

  describe('threads', () => {
    it('should return threads key', () => {
      expect(discussionKeys.threads()).toEqual(['discussions', 'threads']);
    });

    it('should return threadList key with courseId', () => {
      expect(discussionKeys.threadList('course-1')).toEqual([
        'discussions',
        'threads',
        'course-1',
        undefined,
      ]);
    });

    it('should return threadList key with courseId and params', () => {
      const params = { page: 1, limit: 20, moduleId: 'mod-1' };
      expect(discussionKeys.threadList('course-1', params)).toEqual([
        'discussions',
        'threads',
        'course-1',
        params,
      ]);
    });

    it('should return threadList key with lessonId param', () => {
      const params = { lessonId: 'lesson-1' };
      expect(discussionKeys.threadList('course-1', params)).toEqual([
        'discussions',
        'threads',
        'course-1',
        params,
      ]);
    });
  });

  describe('thread detail', () => {
    it('should return threadDetails base key', () => {
      expect(discussionKeys.threadDetails()).toEqual(['discussions', 'thread-detail']);
    });

    it('should return threadDetail key for specific thread', () => {
      expect(discussionKeys.threadDetail('thread-123')).toEqual([
        'discussions',
        'thread-detail',
        'thread-123',
      ]);
    });
  });

  // =====================
  // SEARCH KEYS
  // =====================

  describe('search', () => {
    it('should return threadSearch key with courseId and params', () => {
      const params = { q: 'test query', page: 1, limit: 10 };
      expect(discussionKeys.threadSearch('course-1', params)).toEqual([
        'discussions',
        'search',
        'course-1',
        params,
      ]);
    });

    it('should return threadSearch key with minimal params', () => {
      const params = { q: 'hello' };
      expect(discussionKeys.threadSearch('course-2', params)).toEqual([
        'discussions',
        'search',
        'course-2',
        params,
      ]);
    });
  });

  // =====================
  // REPLY KEYS
  // =====================

  describe('replies', () => {
    it('should return replies key with threadId', () => {
      expect(discussionKeys.replies('thread-1')).toEqual([
        'discussions',
        'replies',
        'thread-1',
        undefined,
      ]);
    });

    it('should return replies key with threadId and params', () => {
      const params = { page: 2, limit: 25 };
      expect(discussionKeys.replies('thread-1', params)).toEqual([
        'discussions',
        'replies',
        'thread-1',
        params,
      ]);
    });
  });

  describe('reply detail', () => {
    it('should return replyDetail key for specific reply', () => {
      expect(discussionKeys.replyDetail('reply-456')).toEqual([
        'discussions',
        'reply-detail',
        'reply-456',
      ]);
    });
  });

  // =====================
  // KEY HIERARCHY
  // =====================

  describe('key hierarchy', () => {
    it('should maintain proper key hierarchy for threads', () => {
      const threadKey = discussionKeys.threads();
      expect(threadKey[0]).toBe(discussionKeys.all[0]);
    });

    it('should maintain proper key hierarchy for threadList', () => {
      const threadListKey = discussionKeys.threadList('course-1');
      expect(threadListKey[0]).toBe(discussionKeys.all[0]);
      expect(threadListKey[1]).toBe('threads');
    });

    it('should maintain proper key hierarchy for threadDetail', () => {
      const detailKey = discussionKeys.threadDetail('thread-1');
      expect(detailKey[0]).toBe(discussionKeys.all[0]);
      expect(detailKey[1]).toBe('thread-detail');
    });

    it('should maintain proper key hierarchy for search', () => {
      const searchKey = discussionKeys.threadSearch('course-1', { q: 'test' });
      expect(searchKey[0]).toBe(discussionKeys.all[0]);
      expect(searchKey[1]).toBe('search');
    });

    it('should maintain proper key hierarchy for replies', () => {
      const repliesKey = discussionKeys.replies('thread-1');
      expect(repliesKey[0]).toBe(discussionKeys.all[0]);
      expect(repliesKey[1]).toBe('replies');
    });

    it('should maintain proper key hierarchy for replyDetail', () => {
      const replyDetailKey = discussionKeys.replyDetail('reply-1');
      expect(replyDetailKey[0]).toBe(discussionKeys.all[0]);
      expect(replyDetailKey[1]).toBe('reply-detail');
    });
  });
});
