/**
 * Tests for Playlist Session Query Key Factory
 */

import { describe, it, expect } from 'vitest';
import { playlistSessionKeys } from '../playlistSessionKeys';

describe('playlistSessionKeys', () => {
  describe('all', () => {
    it('should return the base key array', () => {
      expect(playlistSessionKeys.all).toEqual(['playlist-sessions']);
    });

    it('should return a readonly tuple', () => {
      const key = playlistSessionKeys.all;
      expect(key).toHaveLength(1);
      expect(key[0]).toBe('playlist-sessions');
    });
  });

  describe('lists', () => {
    it('should return key with list scope', () => {
      const key = playlistSessionKeys.lists();
      expect(key).toEqual(['playlist-sessions', 'list']);
    });

    it('should extend the all key', () => {
      const key = playlistSessionKeys.lists();
      expect(key[0]).toBe(playlistSessionKeys.all[0]);
      expect(key[1]).toBe('list');
    });
  });

  describe('listByEnrollment', () => {
    it('should include enrollmentId in the key', () => {
      const key = playlistSessionKeys.listByEnrollment('enroll-1');
      expect(key).toEqual(['playlist-sessions', 'list', 'enroll-1']);
    });

    it('should produce different keys for different enrollments', () => {
      const key1 = playlistSessionKeys.listByEnrollment('enroll-1');
      const key2 = playlistSessionKeys.listByEnrollment('enroll-2');
      expect(key1).not.toEqual(key2);
      expect(key1[2]).toBe('enroll-1');
      expect(key2[2]).toBe('enroll-2');
    });

    it('should extend the lists key', () => {
      const key = playlistSessionKeys.listByEnrollment('enroll-1');
      const listsKey = playlistSessionKeys.lists();
      expect(key[0]).toBe(listsKey[0]);
      expect(key[1]).toBe(listsKey[1]);
    });
  });

  describe('details', () => {
    it('should return key with detail scope', () => {
      const key = playlistSessionKeys.details();
      expect(key).toEqual(['playlist-sessions', 'detail']);
    });

    it('should extend the all key', () => {
      const key = playlistSessionKeys.details();
      expect(key[0]).toBe(playlistSessionKeys.all[0]);
      expect(key[1]).toBe('detail');
    });
  });

  describe('detail', () => {
    it('should include enrollmentId and moduleId in the key', () => {
      const key = playlistSessionKeys.detail('enroll-1', 'mod-1');
      expect(key).toEqual(['playlist-sessions', 'detail', 'enroll-1', 'mod-1']);
    });

    it('should produce different keys for different enrollment/module combos', () => {
      const key1 = playlistSessionKeys.detail('enroll-1', 'mod-1');
      const key2 = playlistSessionKeys.detail('enroll-1', 'mod-2');
      const key3 = playlistSessionKeys.detail('enroll-2', 'mod-1');
      expect(key1).not.toEqual(key2);
      expect(key1).not.toEqual(key3);
    });

    it('should extend the details key', () => {
      const key = playlistSessionKeys.detail('enroll-1', 'mod-1');
      const detailsKey = playlistSessionKeys.details();
      expect(key[0]).toBe(detailsKey[0]);
      expect(key[1]).toBe(detailsKey[1]);
    });

    it('should have the correct length', () => {
      const key = playlistSessionKeys.detail('enroll-1', 'mod-1');
      expect(key).toHaveLength(4);
    });
  });

  describe('key hierarchy', () => {
    it('should have consistent prefix across all key types', () => {
      const all = playlistSessionKeys.all;
      const lists = playlistSessionKeys.lists();
      const listByEnrollment = playlistSessionKeys.listByEnrollment('e1');
      const details = playlistSessionKeys.details();
      const detail = playlistSessionKeys.detail('e1', 'm1');

      // All keys share the same root
      expect(all[0]).toBe('playlist-sessions');
      expect(lists[0]).toBe('playlist-sessions');
      expect(listByEnrollment[0]).toBe('playlist-sessions');
      expect(details[0]).toBe('playlist-sessions');
      expect(detail[0]).toBe('playlist-sessions');
    });

    it('should have list keys prefixed by lists()', () => {
      const lists = playlistSessionKeys.lists();
      const listByEnrollment = playlistSessionKeys.listByEnrollment('e1');
      expect(listByEnrollment.slice(0, 2)).toEqual([...lists]);
    });

    it('should have detail keys prefixed by details()', () => {
      const details = playlistSessionKeys.details();
      const detail = playlistSessionKeys.detail('e1', 'm1');
      expect(detail.slice(0, 2)).toEqual([...details]);
    });
  });
});
