/**
 * Tests for Course Version Query Keys
 */

import { describe, it, expect } from 'vitest';
import { courseVersionKeys, moduleEditLockKeys } from '../courseVersionKeys';

describe('courseVersionKeys', () => {
  describe('all', () => {
    it('should return base key array', () => {
      expect(courseVersionKeys.all).toEqual(['course-versions']);
    });
  });

  describe('lists', () => {
    it('should return list key with base', () => {
      const result = courseVersionKeys.lists();
      expect(result).toEqual(['course-versions', 'list']);
    });
  });

  describe('list', () => {
    it('should return list key with canonical course id', () => {
      const result = courseVersionKeys.list('canonical-123');
      expect(result).toEqual(['course-versions', 'list', 'canonical-123']);
    });

    it('should return different keys for different canonical course ids', () => {
      const key1 = courseVersionKeys.list('canonical-1');
      const key2 = courseVersionKeys.list('canonical-2');
      expect(key1).not.toEqual(key2);
    });
  });

  describe('listFiltered', () => {
    it('should return filtered list key without filters', () => {
      const result = courseVersionKeys.listFiltered();
      expect(result).toEqual(['course-versions', 'list', 'filtered', undefined]);
    });

    it('should return filtered list key with filters', () => {
      const filters = { status: 'draft' as const, isLocked: false };
      const result = courseVersionKeys.listFiltered(filters);
      expect(result).toEqual(['course-versions', 'list', 'filtered', filters]);
    });

    it('should produce different keys for different filters', () => {
      const key1 = courseVersionKeys.listFiltered({ status: 'draft' });
      const key2 = courseVersionKeys.listFiltered({ status: 'published' });
      expect(key1).not.toEqual(key2);
    });
  });

  describe('details', () => {
    it('should return details base key', () => {
      const result = courseVersionKeys.details();
      expect(result).toEqual(['course-versions', 'detail']);
    });
  });

  describe('detail', () => {
    it('should return detail key with version id', () => {
      const result = courseVersionKeys.detail('version-123');
      expect(result).toEqual(['course-versions', 'detail', 'version-123']);
    });

    it('should return different keys for different version ids', () => {
      const key1 = courseVersionKeys.detail('version-1');
      const key2 = courseVersionKeys.detail('version-2');
      expect(key1).not.toEqual(key2);
    });
  });

  describe('modules', () => {
    it('should return modules key with version id', () => {
      const result = courseVersionKeys.modules('version-123');
      expect(result).toEqual(['course-versions', 'modules', 'version-123']);
    });
  });

  describe('canonical', () => {
    it('should return canonical base key', () => {
      const result = courseVersionKeys.canonical();
      expect(result).toEqual(['course-versions', 'canonical']);
    });
  });

  describe('canonicalDetail', () => {
    it('should return canonical detail key with id', () => {
      const result = courseVersionKeys.canonicalDetail('canonical-123');
      expect(result).toEqual(['course-versions', 'canonical', 'canonical-123']);
    });
  });

  describe('key hierarchy', () => {
    it('should have lists key extend all key', () => {
      const listsKey = courseVersionKeys.lists();
      expect(listsKey[0]).toBe(courseVersionKeys.all[0]);
    });

    it('should have list key extend lists key', () => {
      const listKey = courseVersionKeys.list('test');
      const listsKey = courseVersionKeys.lists();
      expect(listKey.slice(0, 2)).toEqual(listsKey);
    });

    it('should have detail key extend details key', () => {
      const detailKey = courseVersionKeys.detail('test');
      const detailsKey = courseVersionKeys.details();
      expect(detailKey.slice(0, 2)).toEqual(detailsKey);
    });
  });
});

describe('moduleEditLockKeys', () => {
  describe('all', () => {
    it('should return base key array', () => {
      expect(moduleEditLockKeys.all).toEqual(['module-edit-locks']);
    });
  });

  describe('status', () => {
    it('should return status key with module id', () => {
      const result = moduleEditLockKeys.status('module-123');
      expect(result).toEqual(['module-edit-locks', 'status', 'module-123']);
    });

    it('should return different keys for different module ids', () => {
      const key1 = moduleEditLockKeys.status('module-1');
      const key2 = moduleEditLockKeys.status('module-2');
      expect(key1).not.toEqual(key2);
    });
  });

  describe('key hierarchy', () => {
    it('should have status key extend all key', () => {
      const statusKey = moduleEditLockKeys.status('test');
      expect(statusKey[0]).toBe(moduleEditLockKeys.all[0]);
    });
  });
});
