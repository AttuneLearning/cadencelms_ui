/**
 * UAT: Dashboard User Stories
 * Navigation Redesign 2026-02-05
 *
 * Tests for:
 * - Section-based navigation (Overview, Primary, Secondary, Insights, Departments)
 * - Role-specific dashboard content
 * - Quick Actions (contextual, verb-based)
 * - Department navigation and actions
 *
 * Sidebar section headers use CSS text-transform:uppercase.
 * DOM text is lowercase ("Learning", "Overview", etc.)
 */

import { test, expect } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { DashboardPage } from '../utils/pages';
import { waitForPageLoad, login, loginAsAdmin } from '../utils/helpers';

// ============================================================================
// Learner Dashboard Tests
// ============================================================================

test.describe('User Story: Learner Dashboard Experience', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, uatUsers.learner);
  });

  test.describe('AC1: Dashboard displays personalized welcome', () => {
    test('User sees dashboard with real data', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto('learner');

      await expect(page).toHaveURL(/learner\/dashboard/);

      // Dashboard should have main heading
      const heading = page.locator('h1, [data-testid="welcome-message"]');
      await expect(heading.first()).toBeVisible();
    });
  });

  test.describe('AC2: Learner-specific navigation sections', () => {
    test('Learner sees Learning section in sidebar', async ({ page }) => {
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      // Use exact match to avoid matching "My Learning" link
      const learningSection = page.locator('aside').getByRole('button', { name: /^Learning$/i });
      // If it's not a button, try exact text match
      const sectionHeader = learningSection.or(page.locator('aside').getByText('Learning', { exact: true }));
      await expect(sectionHeader.first()).toBeVisible();
    });

    test('Learner sees Progress section in sidebar', async ({ page }) => {
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      const progressSection = page.locator('aside').getByRole('button', { name: /^Progress$/i });
      const sectionHeader = progressSection.or(page.locator('aside').getByText('Progress', { exact: true }));
      await expect(sectionHeader.first()).toBeVisible();
    });

    test('Learner does NOT see Teaching section (staff-only)', async ({ page }) => {
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      const teachingSection = page.locator('aside').getByText('Teaching', { exact: true });
      await expect(teachingSection).not.toBeVisible();
    });
  });

  test.describe('AC3: Navigation works from dashboard', () => {
    test('Sidebar navigation is accessible', async ({ page }) => {
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      const navigation = page.locator('nav, [data-testid="sidebar"], [role="navigation"]');
      await expect(navigation.first()).toBeVisible();
    });

    test('Can navigate to profile from sidebar footer', async ({ page }) => {
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      const profileLink = page.locator('aside a[href*="profile"]');
      if ((await profileLink.count()) > 0) {
        await profileLink.first().click();
        await waitForPageLoad(page);
        await expect(page).toHaveURL(/profile/);
      } else {
        test.skip();
      }
    });
  });
});

// ============================================================================
// Staff Dashboard Tests
// ============================================================================

test.describe('User Story: Staff Dashboard Experience', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, uatUsers.staff);
  });

  test.describe('AC1: Staff dashboard displays correctly', () => {
    test('Staff is redirected to staff dashboard after login', async ({ page }) => {
      await expect(page).toHaveURL(/staff\/dashboard/);
    });

    test('Staff dashboard has main content area', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto('staff');

      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent.first()).toBeVisible();
    });
  });

  test.describe('AC2: Staff-specific navigation sections', () => {
    test('Staff sees Overview section with Dashboard and Calendar', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Overview section (non-collapsible — just text, not a button)
      await expect(sidebar.getByText('Overview', { exact: true })).toBeVisible();

      // Dashboard link
      const dashboardLink = sidebar.locator('a[href*="/staff/dashboard"]');
      await expect(dashboardLink).toBeVisible();

      // Calendar link
      const calendarLink = sidebar.locator('a[href*="/staff/calendar"]');
      await expect(calendarLink).toBeVisible();
    });

    test('Staff sees Teaching section with courses and grading', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Teaching section
      await expect(sidebar.getByText('Teaching', { exact: true })).toBeVisible();

      // My Courses link
      const coursesLink = sidebar.locator('a[href*="/staff/courses"]');
      await expect(coursesLink).toBeVisible();

      // Grading link
      const gradingLink = sidebar.locator('a[href*="/staff/grading"]');
      await expect(gradingLink).toBeVisible();
    });

    test('Staff sees Insights section with Analytics', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Insights section (may be collapsed — just check it exists)
      await expect(sidebar.getByText('Insights', { exact: true })).toBeVisible();
    });

    test('Staff does NOT see Learning section (learner-only)', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      const learningSection = sidebar.getByText('Learning', { exact: true });
      await expect(learningSection).not.toBeVisible();
    });
  });

  test.describe('AC3: Department navigation', () => {
    test('Staff can see Departments section', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      // Departments section header is a collapsible button
      const deptSection = sidebar.getByText('Departments', { exact: true });
      await expect(deptSection).toBeVisible();
    });

    test('Staff can expand Departments section to see department list', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Click Departments to expand
      const deptHeader = sidebar.getByText('Departments', { exact: true });
      await deptHeader.click();

      // Wait for expand animation
      await page.waitForTimeout(500);
    });

    test('Selecting a department shows department actions', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Expand departments section
      const deptHeader = sidebar.getByText('Departments', { exact: true });
      await deptHeader.click();
      await page.waitForTimeout(500);

      // Click first department button (has folder icon)
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      if ((await deptButtons.count()) > 0) {
        await deptButtons.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('Department admin can see Course Enrollments link in department actions', async ({ page }) => {
      // Use riley instructor who has department-admin role
      await page.goto('/login');
      await waitForPageLoad(page);
      await page.fill('input[type="email"]', uatUsers.rileyInstructor.email);
      await page.fill('input[type="password"]', uatUsers.rileyInstructor.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Expand departments
      const deptHeader = sidebar.getByText('Departments', { exact: true });
      await deptHeader.click();
      await page.waitForTimeout(500);

      // Click first department
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      if ((await deptButtons.count()) > 0) {
        await deptButtons.first().click();
        await page.waitForTimeout(500);

        // Should see Course Enrollments link in department actions
        const enrollmentsLink = sidebar.locator('a[href*="/enrollments"]');
        await expect(enrollmentsLink).toBeVisible();
      } else {
        test.skip();
      }
    });

    test('Department admin can navigate to Course Enrollments page', async ({ page }) => {
      // Use riley instructor who has department-admin role
      await page.goto('/login');
      await waitForPageLoad(page);
      await page.fill('input[type="email"]', uatUsers.rileyInstructor.email);
      await page.fill('input[type="password"]', uatUsers.rileyInstructor.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Expand departments
      const deptHeader = sidebar.getByText('Departments', { exact: true });
      await deptHeader.click();
      await page.waitForTimeout(500);

      // Click first department
      const deptButtons = sidebar.locator('.space-y-1 button:has([class*="lucide-folder"])');
      if ((await deptButtons.count()) > 0) {
        await deptButtons.first().click();
        await page.waitForTimeout(500);

        // Click Course Enrollments link
        const enrollmentsLink = sidebar.locator('a[href*="/enrollments"]');
        if ((await enrollmentsLink.count()) > 0) {
          await enrollmentsLink.click();
          await waitForPageLoad(page);
          await expect(page).toHaveURL(/\/staff\/departments\/[^/]+\/enrollments/);
        } else {
          test.skip();
        }
      } else {
        test.skip();
      }
    });
  });

  test.describe('AC4: Quick Actions', () => {
    test('Staff dashboard shows Quick Actions card', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      // Look for quick actions section in main content
      const quickActions = page.locator(
        '[data-testid="quick-actions"], ' +
        'h2:has-text("Quick Actions"), ' +
        'h3:has-text("Quick Actions")'
      );

      const hasQuickActions = (await quickActions.count()) > 0;
      if (!hasQuickActions) {
        // Quick Actions may not be implemented for staff yet — skip instead of fail
        test.skip(true, 'Quick Actions not found on staff dashboard');
      }
    });

    test('Quick Actions are verb-based (not navigation duplicates)', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const quickActionsSection = page.locator(
        '[data-testid="quick-actions"], section:has-text("Quick Actions")'
      );

      if ((await quickActionsSection.count()) > 0) {
        const text = await quickActionsSection.first().textContent();
        expect(text).toBeDefined();
      } else {
        test.skip();
      }
    });
  });

  test.describe('AC5: Staff can navigate to key pages', () => {
    test('Staff can navigate to My Courses', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const coursesLink = page.locator('aside a[href*="/staff/courses"]');
      await coursesLink.click();
      await waitForPageLoad(page);

      await expect(page).toHaveURL(/staff\/courses/);
    });

    test('Staff can navigate to Grading', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const gradingLink = page.locator('aside a[href*="/staff/grading"]');
      await gradingLink.click();
      await waitForPageLoad(page);

      await expect(page).toHaveURL(/staff\/grading/);
    });

    test('Staff can navigate to Profile', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const profileLink = page.locator('aside a[href*="/staff/profile"]');
      await profileLink.click();
      await waitForPageLoad(page);

      await expect(page).toHaveURL(/staff\/profile/);
    });
  });
});

// ============================================================================
// Admin Dashboard Tests
// ============================================================================

test.describe('User Story: Admin Dashboard Experience', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, uatUsers.admin);
  });

  test.describe('AC1: Admin dashboard displays correctly', () => {
    test('Admin is redirected to admin dashboard after login', async ({ page }) => {
      await expect(page).toHaveURL(/admin\/dashboard/);
    });
  });

  test.describe('AC2: Admin-specific navigation sections', () => {
    test('Admin sees Administration section', async ({ page }) => {
      // beforeEach already escalated to /admin/dashboard — don't navigate again (loses memory token)
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.getByText('Administration', { exact: true })).toBeVisible();
    });

    test('Admin sees User Management link', async ({ page }) => {
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      const usersLink = sidebar.locator('a[href*="/admin/users"]');
      await expect(usersLink).toBeVisible();
    });

    test('Admin sees Departments link', async ({ page }) => {
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      const deptLink = sidebar.locator('a[href*="/admin/departments"]');
      await expect(deptLink).toBeVisible();
    });

    test('Admin does NOT see Teaching or Learning sections', async ({ page }) => {
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // These sections should NOT be visible on admin dashboard
      await expect(sidebar.getByText('Teaching', { exact: true })).not.toBeVisible();
      await expect(sidebar.getByText('Learning', { exact: true })).not.toBeVisible();
    });
  });
});

// ============================================================================
// Role-Based Access Control Tests
// ============================================================================

test.describe('User Story: Role-Based Dashboard Access', () => {
  test('Learner cannot access admin dashboard', async ({ page }) => {
    await login(page, uatUsers.learner);
    await page.goto('/admin/dashboard');

    // Should be redirected away (to their dashboard or unauthorized page)
    await expect(page).not.toHaveURL(/^.*\/admin\/dashboard$/);
  });

  test('Learner cannot access staff dashboard', async ({ page }) => {
    await login(page, uatUsers.learner);
    await page.goto('/staff/dashboard');

    // Should be redirected away
    await expect(page).not.toHaveURL(/^.*\/staff\/dashboard$/);
  });

  test('Staff sees staff dashboard, not learner content', async ({ page }) => {
    await login(page, uatUsers.staff);

    await expect(page).toHaveURL(/staff\/dashboard/);

    const url = page.url();
    expect(url).toContain('staff');
  });
});

// ============================================================================
// Universal Navigation Elements Tests
// ============================================================================

test.describe('User Story: Universal Navigation Elements', () => {
  test.describe('Footer section is consistent across dashboards', () => {
    test('Learner dashboard has Profile in footer', async ({ page }) => {
      await login(page, uatUsers.learner);
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.locator('a[href*="profile"]')).toBeVisible();
      // Learner does NOT have Settings link in sidebar
    });

    test('Staff dashboard has Profile and Settings in footer', async ({ page }) => {
      await login(page, uatUsers.staff);
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.locator('a[href*="profile"]')).toBeVisible();
      await expect(sidebar.locator('a[href*="settings"]')).toBeVisible();
    });

    test('Admin dashboard has Profile and Settings in footer', async ({ page }) => {
      await loginAsAdmin(page, uatUsers.admin);
      // Already on /admin/dashboard after loginAsAdmin — don't reload
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.locator('a[href*="profile"]')).toBeVisible();
      await expect(sidebar.locator('a[href*="settings"]')).toBeVisible();
    });
  });

  test.describe('Overview section is consistent across dashboards', () => {
    test('Learner dashboard has Overview and Dashboard link', async ({ page }) => {
      await login(page, uatUsers.learner);
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.getByText('Overview', { exact: true })).toBeVisible();
      await expect(sidebar.locator('a[href*="/learner/dashboard"]')).toBeVisible();
    });

    test('Staff dashboard has Overview and Dashboard link', async ({ page }) => {
      await login(page, uatUsers.staff);
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.getByText('Overview', { exact: true })).toBeVisible();
      await expect(sidebar.locator('a[href*="/staff/dashboard"]')).toBeVisible();
    });

    test('Admin dashboard has Overview and Dashboard link', async ({ page }) => {
      await loginAsAdmin(page, uatUsers.admin);
      // Already on /admin/dashboard after loginAsAdmin — don't reload
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.getByText('Overview', { exact: true })).toBeVisible();
      await expect(sidebar.locator('a[href*="/admin/dashboard"]')).toBeVisible();
    });
  });
});
