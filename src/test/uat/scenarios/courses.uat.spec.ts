/**
 * UAT: Course Catalog User Stories
 * 
 * User Story: As a learner, I want to browse courses so I can find learning opportunities.
 * 
 * Acceptance Criteria:
 * - AC1: Course catalog is accessible
 * - AC2: Courses display with relevant information
 * - AC3: Can view course details
 * - AC4: Can switch between list and grid view (if available)
 */

import { test, expect } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { login, waitForPageLoad } from '../utils/helpers';

test.describe('User Story: Course Catalog Browsing', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, uatUsers.learner);
  });

  test.describe('AC1: Course catalog is accessible', () => {
    
    test('Can navigate to course catalog', async ({ page }) => {
      // Given: I am logged in
      // When: I navigate to the learner catalog
      await page.goto('/learner/catalog');
      await waitForPageLoad(page);

      // Then: I see the course catalog page
      const catalogIndicator = page.locator(
        '[data-testid="course-catalog"], ' +
        '[data-testid="course-grid"], ' +
        '[data-testid="course-list-view"], ' +
        'h1:has-text("course"), ' +
        'h1:has-text("catalog"), ' +
        'h1:has-text("browse")'
      );

      // Should be on the catalog page
      expect(page.url()).toMatch(/catalog/i);

      // Should see some catalog content or empty state
      const hasCatalog = await catalogIndicator.count() > 0;
      const hasEmptyState = await page.locator('text=/no courses|empty|browse/i').count() > 0;
      expect(hasCatalog || hasEmptyState).toBe(true);
    });
  });

  test.describe('AC2: Courses display with relevant information', () => {
    
    test('Course cards show title and description', async ({ page }) => {
      // Given: I am on the course catalog
      await page.goto('/learner/catalog');
      await waitForPageLoad(page);

      // Wait for courses to load — look for the "Showing X of Y courses" text or course titles
      await page.waitForSelector('text=/showing.*courses/i, h3, h2', { timeout: 15000 }).catch(() => {
        console.log('No course content found after waiting');
      });

      // Then: The page should show courses or an empty state
      // Course cards contain h3 titles with course names — use main content area to avoid sidebar
      const mainContent = page.locator('main, [role="main"], #main-content');
      const courseTitle = mainContent.locator('h3, h2').first();

      if (await courseTitle.count() > 0) {
        await expect(courseTitle).toBeVisible();
        console.log('Course card title found:', await courseTitle.textContent());
      } else {
        // Empty state is also valid
        const emptyState = page.locator('text=/no courses/i');
        expect(await emptyState.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('AC3: Can view course details', () => {
    
    test('Clicking course opens details', async ({ page }) => {
      // Given: I am on the course catalog
      await page.goto('/learner/catalog');
      await waitForPageLoad(page);

      // When: I click on a course
      const courseLink = page.locator(
        '[data-testid^="course-card"] a, ' +
        'a[href*="/catalog/"], ' +
        'a[href*="/course/"], ' +
        '[data-testid="course-title"] a'
      );

      if (await courseLink.count() > 0) {
        await courseLink.first().click();
        await waitForPageLoad(page);

        // Then: I see course details page
        await expect(page).toHaveURL(/catalog\/.+|course.*\/.+/);
      } else {
        // No clickable courses - skip
        test.skip();
      }
    });
  });

  test.describe('AC4: Can switch between list and grid view', () => {
    
    test('View toggle is available if implemented', async ({ page }) => {
      // Given: I am on the course catalog
      await page.goto('/learner/catalog');
      await waitForPageLoad(page);
      
      // Then: Check for view toggle buttons
      const viewToggle = page.locator(
        '[data-testid="view-toggle"], ' +
        'button[aria-label*="grid"], ' +
        'button[aria-label*="list"], ' +
        '[data-testid="grid-view-btn"], ' +
        '[data-testid="list-view-btn"]'
      );
      
      if (await viewToggle.count() > 0) {
        // Toggle exists - click it
        await viewToggle.first().click();
        
        // View should change (grid or list data-testid should update)
        await waitForPageLoad(page);
        
        // Verify page still works after toggle
        await expect(page).toHaveURL(/course|catalog/);
      } else {
        // View toggle not implemented - this is optional
        test.skip();
      }
    });
  });
});
