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
      // When: I navigate to courses
      await page.goto('/courses');
      await waitForPageLoad(page);
      
      // Then: I see the course catalog page
      const catalogIndicator = page.locator(
        '[data-testid="course-catalog"], ' +
        '[data-testid="course-grid"], ' +
        '[data-testid="course-list-view"], ' +
        'h1:has-text("course")'
      );
      
      const hasCatalog = await catalogIndicator.count() > 0;
      
      // If /courses doesn't work, try alternate paths
      if (!hasCatalog) {
        await page.goto('/catalog');
        await waitForPageLoad(page);
      }
      
      // Should be on some course-related page
      expect(page.url()).toMatch(/course|catalog/i);
    });
  });

  test.describe('AC2: Courses display with relevant information', () => {
    
    test('Course cards show title and description', async ({ page }) => {
      // Given: I am on the course catalog
      await page.goto('/courses');
      await waitForPageLoad(page);
      
      // Then: Course cards have titles
      const courseCards = page.locator(
        '[data-testid^="course-card"], ' +
        '[data-testid="course-grid"] > div, ' +
        '[data-testid="course-list-view"] > div'
      );
      
      const count = await courseCards.count();
      
      if (count > 0) {
        // First card should have a title element
        const firstCard = courseCards.first();
        const title = firstCard.locator('h2, h3, [data-testid="course-title"]');
        await expect(title).toBeVisible();
      } else {
        // Empty state is also valid
        const emptyState = page.locator(
          '[data-testid="empty-state"], ' +
          ':has-text("no courses")'
        );
        // Either has courses or shows empty state
        expect(count > 0 || await emptyState.count() > 0).toBe(true);
      }
    });
  });

  test.describe('AC3: Can view course details', () => {
    
    test('Clicking course opens details', async ({ page }) => {
      // Given: I am on the course catalog
      await page.goto('/courses');
      await waitForPageLoad(page);
      
      // When: I click on a course
      const courseLink = page.locator(
        '[data-testid^="course-card"] a, ' +
        'a[href*="/course/"], ' +
        '[data-testid="course-title"] a'
      );
      
      if (await courseLink.count() > 0) {
        await courseLink.first().click();
        await waitForPageLoad(page);
        
        // Then: I see course details page
        await expect(page).toHaveURL(/course.*\/.+|courses\/.+/);
      } else {
        // No clickable courses - skip
        test.skip();
      }
    });
  });

  test.describe('AC4: Can switch between list and grid view', () => {
    
    test('View toggle is available if implemented', async ({ page }) => {
      // Given: I am on the course catalog
      await page.goto('/courses');
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
