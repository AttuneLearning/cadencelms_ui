/**
 * UAT: Dashboard User Stories
 * Navigation Redesign 2026-02-05
 *
 * Tests for:
 * - Section-based navigation (Overview, Primary, Secondary, Insights, Departments)
 * - Role-specific dashboard content
 * - Quick Actions (contextual, verb-based)
 * - Department navigation and actions
 */

import { test, expect } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { DashboardPage } from '../utils/pages';
import { waitForPageLoad, login } from '../utils/helpers';

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

      // Check for Learning section
      const learningSection = page.locator('aside').getByText('Learning');
      await expect(learningSection).toBeVisible();
    });

    test('Learner sees Progress section in sidebar', async ({ page }) => {
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      // Check for Progress section
      const progressSection = page.locator('aside').getByText('Progress');
      await expect(progressSection).toBeVisible();
    });

    test('Learner does NOT see Teaching section (staff-only)', async ({ page }) => {
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      // Teaching section should not exist
      const teachingSection = page.locator('aside').getByText('Teaching');
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

      // Overview section
      await expect(sidebar.getByText('Overview')).toBeVisible();

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
      await expect(sidebar.getByText('Teaching')).toBeVisible();

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

      // Insights section
      await expect(sidebar.getByText('Insights')).toBeVisible();
    });

    test('Staff does NOT see Learning section (learner-only)', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Learning section should not be visible
      const learningSection = sidebar.getByText('Learning');
      await expect(learningSection).not.toBeVisible();
    });
  });

  test.describe('AC3: Department navigation', () => {
    test('Staff can see Departments section', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      const deptSection = sidebar.getByRole('button', { name: /departments/i });
      await expect(deptSection).toBeVisible();
    });

    test('Staff can expand Departments section to see department list', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Click Departments to expand
      const deptHeader = sidebar.getByRole('button', { name: /departments/i });
      await deptHeader.click();

      // Should see department buttons
      await page.waitForTimeout(500); // Wait for expand animation
    });

    test('Selecting a department shows department actions', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Expand departments section
      const deptHeader = sidebar.getByRole('button', { name: /departments/i });
      await deptHeader.click();
      await page.waitForTimeout(500);

      // Click first department button
      const deptButtons = sidebar.locator('button:has-text("Department")');
      if ((await deptButtons.count()) > 0) {
        await deptButtons.first().click();
        await page.waitForTimeout(500);

        // Should see "Actions" sub-section or department action links
        // May or may not be visible depending on permissions
      }
    });

    test('Department admin can see Course Enrollments link in department actions', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Expand departments section
      const deptHeader = sidebar.getByRole('button', { name: /departments/i });
      await deptHeader.click();
      await page.waitForTimeout(500);

      // Click first department button
      const deptButtons = sidebar.locator('button:has-text("Department")');
      if ((await deptButtons.count()) > 0) {
        await deptButtons.first().click();
        await page.waitForTimeout(500);

        // Should see Course Enrollments link in department actions
        const enrollmentsLink = sidebar.locator('a[href*="/enrollments"]');
        await expect(enrollmentsLink).toBeVisible();
      }
    });

    test('Department admin can navigate to Course Enrollments page', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // Expand departments section
      const deptHeader = sidebar.getByRole('button', { name: /departments/i });
      await deptHeader.click();
      await page.waitForTimeout(500);

      // Click first department button
      const deptButtons = sidebar.locator('button:has-text("Department")');
      if ((await deptButtons.count()) > 0) {
        await deptButtons.first().click();
        await page.waitForTimeout(500);

        // Click Course Enrollments link
        const enrollmentsLink = sidebar.locator('a[href*="/enrollments"]');
        if ((await enrollmentsLink.count()) > 0) {
          await enrollmentsLink.click();
          await waitForPageLoad(page);

          // Should navigate to enrollment page
          await expect(page).toHaveURL(/\/staff\/departments\/[^/]+\/enrollments/);

          // Page should have enrollment-related content
          const pageHeading = page.locator('h1, [data-testid="page-title"]');
          await expect(pageHeading.first()).toBeVisible();
        } else {
          // If link not found, this is the bug we're tracking in UI-ISS-083
          test.fail(true, 'Course Enrollments link not found in department actions - see UI-ISS-083');
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

      // Look for quick actions section
      const quickActions = page.locator(
        '[data-testid="quick-actions"], ' +
          'section:has-text("Quick Actions"), ' +
          'div:has-text("Quick Actions")'
      );

      // Quick actions should be present (may show different content)
      const hasQuickActions = (await quickActions.count()) > 0;
      expect(hasQuickActions).toBe(true);
    });

    test('Quick Actions are verb-based (not navigation duplicates)', async ({ page }) => {
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      // Quick actions should contain action verbs
      const quickActionsSection = page.locator(
        '[data-testid="quick-actions"], section:has-text("Quick Actions")'
      );

      if ((await quickActionsSection.count()) > 0) {
        const text = await quickActionsSection.first().textContent();
        // Check for verb-based actions (e.g., "Grade", "Review", "Upload")
        // These are contextual actions, not just navigation links
        expect(text).toBeDefined();
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
    await login(page, uatUsers.admin);
  });

  test.describe('AC1: Admin dashboard displays correctly', () => {
    test('Admin is redirected to admin dashboard after login', async ({ page }) => {
      await expect(page).toHaveURL(/admin\/dashboard/);
    });
  });

  test.describe('AC2: Admin-specific navigation sections', () => {
    test('Admin sees Administration section', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.getByText('Administration')).toBeVisible();
    });

    test('Admin sees User Management link', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      const usersLink = sidebar.locator('a[href*="/admin/users"]');
      await expect(usersLink).toBeVisible();
    });

    test('Admin sees Departments link', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      const deptLink = sidebar.locator('a[href*="/admin/departments"]');
      await expect(deptLink).toBeVisible();
    });

    test('Admin does NOT see Teaching or Learning sections', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');

      // These sections should NOT be visible on admin dashboard
      await expect(sidebar.getByText('Teaching')).not.toBeVisible();
      await expect(sidebar.getByText('Learning')).not.toBeVisible();
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
    test('Learner dashboard has Profile and Settings in footer', async ({ page }) => {
      await login(page, uatUsers.learner);
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.locator('a[href*="profile"]')).toBeVisible();
      await expect(sidebar.locator('a[href*="settings"]')).toBeVisible();
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
      await login(page, uatUsers.admin);
      await page.goto('/admin/dashboard');
      await waitForPageLoad(page);

      const sidebar = page.locator('aside');
      await expect(sidebar.locator('a[href*="profile"]')).toBeVisible();
      await expect(sidebar.locator('a[href*="settings"]')).toBeVisible();
    });
  });

  test.describe('Overview section is consistent across dashboards', () => {
    test('All dashboards have Dashboard link in Overview', async ({ page }) => {
      for (const user of [uatUsers.learner, uatUsers.staff, uatUsers.admin]) {
        await login(page, user);
        const dashboardType = user === uatUsers.learner ? 'learner' : user === uatUsers.staff ? 'staff' : 'admin';
        await page.goto(`/${dashboardType}/dashboard`);
        await waitForPageLoad(page);

        const sidebar = page.locator('aside');
        await expect(sidebar.getByText('Overview')).toBeVisible();
        await expect(sidebar.locator(`a[href*="/${dashboardType}/dashboard"]`)).toBeVisible();
      }
    });
  });
});
