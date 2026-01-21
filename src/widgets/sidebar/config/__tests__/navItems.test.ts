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
      const deptManagementItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(deptManagementItem).toBeDefined();
    });

    it('should have correct path template for Department Management', () => {
      const deptManagementItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(deptManagementItem?.pathTemplate).toBe('/staff/departments/:deptId/manage');
    });

    it('should require department-admin permission for Department Management', () => {
      const deptManagementItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(deptManagementItem?.requiredPermission).toBe('department:admin');
    });

    it('should only be available to staff userType', () => {
      const deptManagementItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(deptManagementItem?.userTypes).toEqual(['staff']);
    });

    it('should be in the analytics group', () => {
      const deptManagementItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(deptManagementItem?.group).toBe('analytics');
    });

    it('should be department scoped', () => {
      const deptManagementItem = DEPARTMENT_NAV_ITEMS.find(
        (item) => item.label === 'Department Management'
      );

      expect(deptManagementItem?.departmentScoped).toBe(true);
    });
  });

  describe('DEPARTMENT_ACTION_GROUPS', () => {
    it('should have analytics group defined', () => {
      expect(DEPARTMENT_ACTION_GROUPS.analytics).toBeDefined();
      expect(DEPARTMENT_ACTION_GROUPS.analytics.label).toBe('Analytics & Settings');
    });
  });
});
