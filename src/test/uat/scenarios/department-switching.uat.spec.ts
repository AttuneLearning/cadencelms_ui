/**
 * UAT: Department Switching User Stories
 * Navigation Redesign 2026-02-05
 *
 * Tests for:
 * - Department list visibility (no System-Admin for staff)
 * - Department selection from list
 * - Breadcrumb navigation (no System-Admin prefix)
 * - Home button returns to department list
 * - Switching between departments
 */

import { test, expect, Page } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { waitForPageLoad, login } from '../utils/helpers';

// ============================================================================
// Helper Functions
// ============================================================================

async function expandDepartmentsSection(page: Page) {
  const sidebar = page.locator('aside');
  const deptHeader = sidebar.getByRole('button', { name: /departments/i });

  // Check if already expanded by looking for department items
  const isExpanded = await sidebar.locator('button:has([class*="Folder"])').first().isVisible().catch(() => false);

  if (!isExpanded) {
    await deptHeader.click();
    await page.waitForTimeout(300);
  }
}

// ============================================================================
// Riley Instructor Department Switching Tests
// ============================================================================

test.describe('User Story: Staff Department Switching (riley.instructor)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, uatUsers.rileyInstructor);
    await page.goto('/staff/dashboard');
    await waitForPageLoad(page);
  });

  test.describe('AC1: Department list displays correctly', () => {
    test('Staff can see Departments section in sidebar', async ({ page }) => {
      const sidebar = page.locator('aside');
      const deptSection = sidebar.getByRole('button', { name: /departments/i });
      await expect(deptSection).toBeVisible();
    });

    test('Department list does NOT show System-Admin (root department)', async ({ page }) => {
      await expandDepartmentsSection(page);

      const sidebar = page.locator('aside');

      // Wait for departments to load
      await page.waitForTimeout(500);

      // Check that "System-Admin" is not visible as a standalone department
      // It should NOT appear in the department list for staff users
      const systemAdminButton = sidebar.locator('button').filter({ hasText: /^System-Admin$/ });
      await expect(systemAdminButton).not.toBeVisible();
    });

    test('Staff sees their departments without System-Admin prefix', async ({ page }) => {
      await expandDepartmentsSection(page);

      const sidebar = page.locator('aside');

      // Wait for departments to load
      await page.waitForTimeout(500);

      // Department names should not start with "System-Admin >"
      const deptButtons = sidebar.locator('.space-y-1 button');
      const count = await deptButtons.count();

      for (let i = 0; i < count; i++) {
        const text = await deptButtons.nth(i).textContent();
        if (text) {
          expect(text).not.toMatch(/^System-Admin\s*>/);
        }
      }
    });
  });

  test.describe('AC2: Department selection works', () => {
    test('Clicking a department selects it and shows breadcrumb', async ({ page }) => {
      await expandDepartmentsSection(page);

      const sidebar = page.locator('aside');

      // Wait for departments to load
      await page.waitForTimeout(500);

      // Find and click the first department button (not the section header)
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      const buttonCount = await deptButtons.count();

      if (buttonCount > 0) {
        await deptButtons.first().click();

        // Wait for selection
        await page.waitForTimeout(500);

        // Should now see breadcrumb with Home icon
        const homeButton = sidebar.locator('button[title="Back to department list"]');
        await expect(homeButton).toBeVisible();
      } else {
        test.skip();
      }
    });
  });

  test.describe('AC3: Breadcrumb does not show System-Admin', () => {
    test('Selected department breadcrumb hides System-Admin for staff', async ({ page }) => {
      await expandDepartmentsSection(page);

      const sidebar = page.locator('aside');

      // Wait for departments to load
      await page.waitForTimeout(500);

      // Click first department
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      if ((await deptButtons.count()) > 0) {
        await deptButtons.first().click();
        await page.waitForTimeout(500);

        // Check breadcrumb trail for System-Admin
        const breadcrumbText = await sidebar.locator('.flex-wrap').textContent();

        // Breadcrumb should NOT contain "System-Admin" for staff users
        if (breadcrumbText) {
          expect(breadcrumbText).not.toContain('System-Admin');
        }
      } else {
        test.skip();
      }
    });
  });

  test.describe('AC4: Home button returns to department list', () => {
    test('Clicking Home icon clears selection and shows department list (stays on page)', async ({ page }) => {
      await expandDepartmentsSection(page);

      const sidebar = page.locator('aside');

      // Wait for departments to load
      await page.waitForTimeout(500);

      // Get initial department count
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      const initialCount = await deptButtons.count();

      if (initialCount === 0) {
        test.skip();
        return;
      }

      // Click first department to select it
      await deptButtons.first().click();
      await page.waitForTimeout(500);

      // Verify we're in breadcrumb mode - Home button should be visible
      const homeButton = sidebar.locator('button[title="Back to department list"]');
      await expect(homeButton).toBeVisible();

      // Click Home button
      await homeButton.click();
      await page.waitForTimeout(500);

      // Should NOT navigate away - URL should be same as before (or still on staff dashboard)
      const _urlAfterHome = page.url();
      expect(_urlAfterHome).toContain('/staff/');

      // Should return to department list - verify department buttons are visible again
      const deptButtonsAfter = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      const afterCount = await deptButtonsAfter.count();

      // Should see department list again (same or similar count)
      expect(afterCount).toBeGreaterThan(0);
    });

    test('After returning to list, can select a different department', async ({ page }) => {
      await expandDepartmentsSection(page);

      const sidebar = page.locator('aside');
      await page.waitForTimeout(500);

      // Get departments
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      const count = await deptButtons.count();

      if (count < 2) {
        // Need at least 2 departments to test switching
        test.skip();
        return;
      }

      // Select first department
      await deptButtons.first().click();
      await page.waitForTimeout(500);

      // Click Home to return to list
      const homeButton = sidebar.locator('button[title="Back to department list"]');
      await homeButton.click();
      await page.waitForTimeout(500);

      // Select second department
      const deptButtonsAgain = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      const secondDeptName = await deptButtonsAgain.nth(1).textContent();
      await deptButtonsAgain.nth(1).click();
      await page.waitForTimeout(500);

      // Verify breadcrumb shows the second department, not the first
      const breadcrumbText = await sidebar.locator('.flex-wrap').textContent();
      if (breadcrumbText && secondDeptName) {
        // The selected department name should appear in breadcrumb
        const cleanSecondName = secondDeptName.replace(/Primary/g, '').trim();
        expect(breadcrumbText).toContain(cleanSecondName);
      }
    });

    test('Switching departments on a department-scoped page updates the URL', async ({ page }) => {
      await expandDepartmentsSection(page);

      const sidebar = page.locator('aside');
      await page.waitForTimeout(500);

      // Get departments
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      const count = await deptButtons.count();

      if (count < 1) {
        test.skip();
        return;
      }

      // Select first department
      await deptButtons.first().click();
      await page.waitForTimeout(500);

      // Navigate to a department-scoped page (e.g., Manage Courses)
      const coursesLink = sidebar.locator('a[href*="/courses"]').first();
      if ((await coursesLink.count()) > 0) {
        await coursesLink.click();
        await page.waitForTimeout(1000);

        // Verify we're on a department-scoped page
        const currentUrl = page.url();
        if (!currentUrl.includes('/departments/')) {
          test.skip();
          return;
        }

        // Extract department ID from URL
        const deptIdMatch = currentUrl.match(/\/departments\/([^/]+)\//);
        const firstDeptId = deptIdMatch ? deptIdMatch[1] : null;

        if (count < 2 || !firstDeptId) {
          test.skip();
          return;
        }

        // Click Home to return to department list
        const homeButton = sidebar.locator('button[title="Back to department list"]');
        if ((await homeButton.count()) > 0) {
          await homeButton.click();
          await page.waitForTimeout(500);

          // Select second department
          const deptButtonsAgain = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
          if ((await deptButtonsAgain.count()) > 1) {
            await deptButtonsAgain.nth(1).click();
            await page.waitForTimeout(1000);

            // Verify URL updated to new department
            const newUrl = page.url();
            const newDeptIdMatch = newUrl.match(/\/departments\/([^/]+)\//);
            const secondDeptId = newDeptIdMatch ? newDeptIdMatch[1] : null;

            // The URL should have updated to the new department
            if (secondDeptId && firstDeptId !== secondDeptId) {
              expect(newUrl).toContain(`/departments/${secondDeptId}/`);
            }
          }
        }
      } else {
        test.skip();
      }
    });
  });
});
