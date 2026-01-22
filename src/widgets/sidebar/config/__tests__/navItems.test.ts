/**
 * Tests for Navigation Items Configuration
 * UI-ISS-048: Department Management sidebar link
 */

import { describe, it, expect } from 'vitest';
import {
  DEPARTMENT_NAV_ITEMS,
  DEPARTMENT_ACTION_GROUPS,
  type DepartmentNavItem,
} from '../navItems';

describe('navItems configuration', () => {
  describe('DEPARTMENT_NAV_ITEMS', () => {
    it('should include Department Management item', () => {
      const programsItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(programsItem).toBeDefined();
    });

    it('should have correct path template for Department Management', () => {
      const programsItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(programsItem?.pathTemplate).toBe('/staff/departments/:deptId/manage');
    });

    it('should require content:programs:manage permission for Department Management', () => {
      const programsItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(programsItem?.requiredPermission).toBe('content:programs:manage');
    });

    it('should only be available to staff userType', () => {
      const programsItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(programsItem?.userTypes).toEqual(['staff']);
    });

    it('should be in the content group', () => {
      const programsItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(programsItem?.group).toBe('content');
    });

    it('should be department scoped', () => {
      const programsItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(programsItem?.departmentScoped).toBe(true);
    });
  });

  describe('DEPARTMENT_ACTION_GROUPS', () => {
    it('should have content group defined', () => {
      expect(DEPARTMENT_ACTION_GROUPS.content).toBeDefined();
      expect(DEPARTMENT_ACTION_GROUPS.content.label).toBe('Content Management');
    });
  });
});
