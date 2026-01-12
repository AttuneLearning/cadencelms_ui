/**
 * Unit tests for displayUtils
 * Testing display label utilities for user types and roles
 */

import { describe, it, expect } from 'vitest';
import {
  getUserTypeDisplayLabel,
  getRoleDisplayLabel,
  buildUserTypeDisplayMap,
  buildRoleDisplayMap,
  extractUserTypeKeys,
  toUserTypeObjects,
} from './displayUtils';
import type { UserTypeObject, RoleObject, UserType } from '../types/auth';

describe('displayUtils', () => {
  describe('getUserTypeDisplayLabel', () => {
    it('should return server-provided display label when available', () => {
      const displayMap = {
        staff: 'Staff Member',
        learner: 'Student',
        'global-admin': 'Administrator',
      } as Record<UserType, string>;

      expect(getUserTypeDisplayLabel('staff', displayMap)).toBe('Staff Member');
      expect(getUserTypeDisplayLabel('learner', displayMap)).toBe('Student');
      expect(getUserTypeDisplayLabel('global-admin', displayMap)).toBe('Administrator');
    });

    it('should return client-side fallback when server map not provided', () => {
      expect(getUserTypeDisplayLabel('staff')).toBe('Staff');
      expect(getUserTypeDisplayLabel('learner')).toBe('Learner');
      expect(getUserTypeDisplayLabel('global-admin')).toBe('System Admin');
    });

    it('should return client-side fallback when userType not in server map', () => {
      const displayMap = {
        staff: 'Staff Member',
      } as Record<UserType, string>;

      expect(getUserTypeDisplayLabel('learner', displayMap)).toBe('Learner');
      expect(getUserTypeDisplayLabel('global-admin', displayMap)).toBe('System Admin');
    });

    it('should return "User" for null userType', () => {
      expect(getUserTypeDisplayLabel(null)).toBe('User');
    });

    it('should return "User" for undefined userType', () => {
      expect(getUserTypeDisplayLabel(undefined)).toBe('User');
    });

    it('should capitalize unknown userType as last resort', () => {
      const displayMap = {} as Record<UserType, string>;
      expect(getUserTypeDisplayLabel('staff' as UserType, displayMap)).toBe('Staff');
    });
  });

  describe('getRoleDisplayLabel', () => {
    it('should return server-provided display label when available', () => {
      const displayMap = {
        instructor: 'Course Instructor',
        'department-admin': 'Dept Administrator',
        'course-taker': 'Course Student',
      };

      expect(getRoleDisplayLabel('instructor', displayMap)).toBe('Course Instructor');
      expect(getRoleDisplayLabel('department-admin', displayMap)).toBe('Dept Administrator');
      expect(getRoleDisplayLabel('course-taker', displayMap)).toBe('Course Student');
    });

    it('should return client-side fallback for common roles', () => {
      expect(getRoleDisplayLabel('instructor')).toBe('Instructor');
      expect(getRoleDisplayLabel('department-admin')).toBe('Department Admin');
      expect(getRoleDisplayLabel('course-taker')).toBe('Course Taker');
      expect(getRoleDisplayLabel('system-admin')).toBe('System Admin');
    });

    it('should return client-side fallback when role not in server map', () => {
      const displayMap = {
        instructor: 'Course Instructor',
      };

      expect(getRoleDisplayLabel('department-admin', displayMap)).toBe('Department Admin');
    });

    it('should format unknown role keys (replace hyphens, capitalize)', () => {
      expect(getRoleDisplayLabel('custom-role-name')).toBe('Custom Role Name');
      expect(getRoleDisplayLabel('another-test')).toBe('Another Test');
    });

    it('should return "Role" for null role', () => {
      expect(getRoleDisplayLabel(null)).toBe('Role');
    });

    it('should return "Role" for undefined role', () => {
      expect(getRoleDisplayLabel(undefined)).toBe('Role');
    });

    it('should handle single-word roles', () => {
      expect(getRoleDisplayLabel('admin')).toBe('Admin');
      expect(getRoleDisplayLabel('user')).toBe('User');
    });
  });

  describe('buildUserTypeDisplayMap', () => {
    it('should build display map from UserTypeObject array', () => {
      const userTypes: UserTypeObject[] = [
        { _id: 'staff', displayAs: 'Staff Member' },
        { _id: 'learner', displayAs: 'Student' },
        { _id: 'global-admin', displayAs: 'Administrator' },
      ];

      const result = buildUserTypeDisplayMap(userTypes);

      expect(result).toEqual({
        staff: 'Staff Member',
        learner: 'Student',
        'global-admin': 'Administrator',
      });
    });

    it('should handle empty array', () => {
      const result = buildUserTypeDisplayMap([]);
      expect(result).toEqual({});
    });

    it('should handle single item', () => {
      const userTypes: UserTypeObject[] = [
        { _id: 'staff', displayAs: 'Staff Member' },
      ];

      const result = buildUserTypeDisplayMap(userTypes);

      expect(result).toEqual({
        staff: 'Staff Member',
      });
    });

    it('should overwrite duplicate keys with last value', () => {
      const userTypes: UserTypeObject[] = [
        { _id: 'staff', displayAs: 'Staff Member' },
        { _id: 'staff', displayAs: 'Staff Employee' },
      ];

      const result = buildUserTypeDisplayMap(userTypes);

      expect(result.staff).toBe('Staff Employee');
    });
  });

  describe('buildRoleDisplayMap', () => {
    it('should build display map from RoleObject array', () => {
      const roles: RoleObject[] = [
        { role: 'instructor', displayAs: 'Course Instructor' },
        { role: 'department-admin', displayAs: 'Dept Admin' },
        { role: 'course-taker', displayAs: 'Student' },
      ];

      const result = buildRoleDisplayMap(roles);

      expect(result).toEqual({
        instructor: 'Course Instructor',
        'department-admin': 'Dept Admin',
        'course-taker': 'Student',
      });
    });

    it('should handle empty array', () => {
      const result = buildRoleDisplayMap([]);
      expect(result).toEqual({});
    });

    it('should handle single item', () => {
      const roles: RoleObject[] = [
        { role: 'instructor', displayAs: 'Course Instructor' },
      ];

      const result = buildRoleDisplayMap(roles);

      expect(result).toEqual({
        instructor: 'Course Instructor',
      });
    });

    it('should overwrite duplicate keys with last value', () => {
      const roles: RoleObject[] = [
        { role: 'instructor', displayAs: 'Course Instructor' },
        { role: 'instructor', displayAs: 'Class Teacher' },
      ];

      const result = buildRoleDisplayMap(roles);

      expect(result.instructor).toBe('Class Teacher');
    });
  });

  describe('extractUserTypeKeys', () => {
    it('should extract _id values from UserTypeObject array', () => {
      const userTypes: UserTypeObject[] = [
        { _id: 'staff', displayAs: 'Staff Member' },
        { _id: 'learner', displayAs: 'Student' },
        { _id: 'global-admin', displayAs: 'Administrator' },
      ];

      const result = extractUserTypeKeys(userTypes);

      expect(result).toEqual(['staff', 'learner', 'global-admin']);
    });

    it('should handle empty array', () => {
      const result = extractUserTypeKeys([]);
      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const userTypes: UserTypeObject[] = [
        { _id: 'staff', displayAs: 'Staff Member' },
      ];

      const result = extractUserTypeKeys(userTypes);

      expect(result).toEqual(['staff']);
    });

    it('should preserve order', () => {
      const userTypes: UserTypeObject[] = [
        { _id: 'global-admin', displayAs: 'Administrator' },
        { _id: 'staff', displayAs: 'Staff Member' },
        { _id: 'learner', displayAs: 'Student' },
      ];

      const result = extractUserTypeKeys(userTypes);

      expect(result).toEqual(['global-admin', 'staff', 'learner']);
    });
  });

  describe('toUserTypeObjects', () => {
    it('should convert user type keys to UserTypeObject array with fallback labels', () => {
      const userTypes: UserType[] = ['staff', 'learner', 'global-admin'];

      const result = toUserTypeObjects(userTypes);

      expect(result).toEqual([
        { _id: 'staff', displayAs: 'Staff' },
        { _id: 'learner', displayAs: 'Learner' },
        { _id: 'global-admin', displayAs: 'System Admin' },
      ]);
    });

    it('should handle empty array', () => {
      const result = toUserTypeObjects([]);
      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const userTypes: UserType[] = ['staff'];

      const result = toUserTypeObjects(userTypes);

      expect(result).toEqual([
        { _id: 'staff', displayAs: 'Staff' },
      ]);
    });

    it('should preserve order', () => {
      const userTypes: UserType[] = ['global-admin', 'staff', 'learner'];

      const result = toUserTypeObjects(userTypes);

      expect(result[0]._id).toBe('global-admin');
      expect(result[1]._id).toBe('staff');
      expect(result[2]._id).toBe('learner');
    });

    it('should capitalize unknown user types', () => {
      const userTypes = ['custom-type' as unknown as UserType];

      const result = toUserTypeObjects(userTypes);

      expect(result).toEqual([
        { _id: 'custom-type' as unknown as UserType, displayAs: 'Custom-type' },
      ]);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with full server response flow', () => {
      // Simulate server response with UserTypeObject[]
      const serverUserTypes: UserTypeObject[] = [
        { _id: 'staff', displayAs: 'Staff Member' },
        { _id: 'learner', displayAs: 'Student' },
      ];

      // Build display map
      const displayMap = buildUserTypeDisplayMap(serverUserTypes);

      // Use map to get labels
      expect(getUserTypeDisplayLabel('staff', displayMap)).toBe('Staff Member');
      expect(getUserTypeDisplayLabel('learner', displayMap)).toBe('Student');

      // Extract keys for backward compatibility
      const keys = extractUserTypeKeys(serverUserTypes);
      expect(keys).toEqual(['staff', 'learner']);
    });

    it('should handle missing server data gracefully', () => {
      // No server display map available
      expect(getUserTypeDisplayLabel('staff')).toBe('Staff');
      expect(getRoleDisplayLabel('instructor')).toBe('Instructor');
    });

    it('should handle partial server data', () => {
      const partialMap = {
        staff: 'Staff Member',
      } as Record<UserType, string>;

      // Has server label
      expect(getUserTypeDisplayLabel('staff', partialMap)).toBe('Staff Member');

      // Falls back to client label
      expect(getUserTypeDisplayLabel('learner', partialMap)).toBe('Learner');
    });

    it('should convert between formats for backward compatibility', () => {
      // Old format: string[]
      const oldFormat: UserType[] = ['staff', 'learner'];

      // Convert to new format
      const newFormat = toUserTypeObjects(oldFormat);

      expect(newFormat).toEqual([
        { _id: 'staff', displayAs: 'Staff' },
        { _id: 'learner', displayAs: 'Learner' },
      ]);

      // Convert back to keys
      const backToKeys = extractUserTypeKeys(newFormat);
      expect(backToKeys).toEqual(oldFormat);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      // Empty strings are treated as falsy, so return default labels
      expect(getRoleDisplayLabel('')).toBe('Role');
      expect(getUserTypeDisplayLabel('' as UserType)).toBe('User');
    });

    it('should handle special characters in role names', () => {
      expect(getRoleDisplayLabel('role_with_underscores')).toBe('Role_with_underscores');
      expect(getRoleDisplayLabel('role-with-hyphens')).toBe('Role With Hyphens');
    });

    it('should handle display map with undefined values', () => {
      const mapWithUndefined = {
        staff: undefined,
      } as any;

      // Should fall back to client label when map value is undefined
      expect(getUserTypeDisplayLabel('staff', mapWithUndefined)).toBe('Staff');
    });

    it('should handle null in display map', () => {
      const mapWithNull = {
        staff: null,
      } as any;

      // Should fall back to client label when map value is null
      expect(getUserTypeDisplayLabel('staff', mapWithNull)).toBe('Staff');
    });
  });
});
