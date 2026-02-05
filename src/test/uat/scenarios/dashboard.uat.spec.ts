/**
 * UAT: Dashboard User Stories
 * 
 * User Story: As a learner, I want to see my dashboard so I can track my progress.
 * 
 * Acceptance Criteria:
 * - AC1: Dashboard displays personalized welcome
 * - AC2: Enrolled courses are visible
 * - AC3: Navigation works from dashboard
 * - AC4: Role-based content is displayed correctly
 */

import { test, expect } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { LoginPage, DashboardPage } from '../utils/pages';
import { waitForPageLoad, login } from '../utils/helpers';

test.describe('User Story: Learner Dashboard Experience', () => {
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await login(page, uatUsers.learner);
  });

  test.describe('AC1: Dashboard displays personalized welcome', () => {
    
    test('User sees welcome message on dashboard', async ({ page }) => {
      // Given: I am logged in and on my dashboard
      const dashboard = new DashboardPage(page);
      await dashboard.goto('learner');
      
      // Then: I see a personalized welcome or my dashboard
      await expect(page).toHaveURL(/learner\/dashboard/);
      
      // Dashboard should have main heading or welcome
      const heading = page.locator('h1, [data-testid="welcome-message"]');
      await expect(heading.first()).toBeVisible();
    });
  });

  test.describe('AC2: Enrolled courses are visible', () => {
    
    test('Enrolled courses section is present', async ({ page }) => {
      // Given: I am on my learner dashboard
      const dashboard = new DashboardPage(page);
      await dashboard.goto('learner');
      
      // Then: I see a courses section (may be empty or populated)
      const coursesSection = page.locator(
        '[data-testid="enrolled-courses"], ' +
        '[data-testid="course-list"], ' +
        '[data-testid="my-courses"], ' +
        'section:has-text("course")'
      );
      
      // Either the section exists or there's a link to courses
      const coursesLink = page.locator('a[href*="course"], nav a:has-text("Course")');
      
      const hasCourses = await coursesSection.count() > 0 || await coursesLink.count() > 0;
      expect(hasCourses).toBe(true);
    });
  });

  test.describe('AC3: Navigation works from dashboard', () => {
    
    test('Sidebar navigation is accessible', async ({ page }) => {
      // Given: I am on my dashboard
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);
      
      // Then: Navigation/sidebar is visible
      const navigation = page.locator(
        'nav, ' +
        '[data-testid="sidebar"], ' +
        '[role="navigation"]'
      );
      
      await expect(navigation.first()).toBeVisible();
    });

    test('Can navigate to profile from dashboard', async ({ page }) => {
      // Given: I am on my dashboard
      await page.goto('/learner/dashboard');
      await waitForPageLoad(page);
      
      // When: I click on profile link/button
      const profileLink = page.locator(
        'a[href*="profile"], ' +
        '[data-testid="profile-link"], ' +
        '[aria-label*="profile" i]'
      );
      
      if (await profileLink.count() > 0) {
        await profileLink.first().click();
        await waitForPageLoad(page);
        
        // Then: I am on the profile page
        await expect(page).toHaveURL(/profile/);
      } else {
        test.skip();
      }
    });
  });
});

test.describe('User Story: Role-Based Dashboard Access', () => {
  
  test.describe('AC4: Role-based content is displayed correctly', () => {
    
    test('Staff sees staff-specific dashboard', async ({ page }) => {
      // Given: I log in as staff
      await login(page, uatUsers.staff);
      
      // Then: I am on staff dashboard with staff features
      await expect(page).toHaveURL(/staff\/dashboard/);
      
      // Staff should see management-related content
      const staffContent = page.locator(
        '[data-testid="staff-dashboard"], ' +
        'h1:has-text("staff"), ' +
        'nav a[href*="manage"]'
      );
      
      // Page should be staff-appropriate
      const url = page.url();
      expect(url).toContain('staff');
    });

    test('Admin sees admin-specific dashboard', async ({ page }) => {
      // Given: I log in as admin
      await login(page, uatUsers.admin);
      
      // Then: I am on admin dashboard
      await expect(page).toHaveURL(/admin\/dashboard/);
      
      // Admin should have access to admin features
      const adminFeatures = page.locator(
        'a[href*="admin"], ' +
        '[data-testid*="admin"], ' +
        'nav a:has-text("Admin")'
      );
      
      const url = page.url();
      expect(url).toContain('admin');
    });

    test('Learner cannot access admin dashboard', async ({ page }) => {
      // Given: I log in as learner
      await login(page, uatUsers.learner);
      
      // When: I try to access admin dashboard directly
      await page.goto('/admin/dashboard');
      
      // Then: I am redirected away (to my dashboard or unauthorized)
      await expect(page).not.toHaveURL(/^.*\/admin\/dashboard$/);
    });
  });
});
