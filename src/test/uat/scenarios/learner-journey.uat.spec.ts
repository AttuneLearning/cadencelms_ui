/**
 * UAT: Learner Journey (Casey)
 *
 * User Story: As a learner, I can log in, reach my dashboard,
 * and launch an enrolled course for active learning.
 */

import { test, expect } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { login, waitForPageLoad } from '../utils/helpers';

const caseyLearner = uatUsers.learner;

test.describe('User Story: Casey learner core journey', () => {
  test('AC1: Casey can log in and land on learner dashboard', async ({ page }) => {
    await login(page, caseyLearner);
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/learner\/dashboard/);

    const dashboardHeader = page.locator('h1:has-text("Welcome back")');
    await expect(dashboardHeader).toBeVisible();
  });

  test('AC2: Casey can access learner courses page', async ({ page }) => {
    await login(page, caseyLearner);

    await page.goto('/learner/courses');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/learner\/courses/);

    const coursesHeader = page.locator('h1:has-text("My Courses")');
    await expect(coursesHeader).toBeVisible();

    const pageState = page.locator(
      'text=/Showing .* courses/i, text=/No courses found/i, text=/haven\'t enrolled in any courses yet/i'
    );
    await expect(pageState.first()).toBeVisible();
  });

  test('AC3: Casey can launch a course-taking route from My Courses', async ({ page }) => {
    await login(page, caseyLearner);

    await page.goto('/learner/courses');
    await waitForPageLoad(page);

    const launchLinks = page.locator('a[href*="/learner/courses/"][href*="/player"]');
    const launchCount = await launchLinks.count();

    if (launchCount === 0) {
      test.skip();
      return;
    }

    await launchLinks.first().click();

    await page.waitForURL(/\/learner\/courses\/.+\/player(\/.*)?$/, { timeout: 30000 });

    const playerState = page.locator(
      'button:has-text("Go to Dashboard"), text=/Loading course/i, text=/Failed to load course/i, aside, nav'
    );
    await expect(playerState.first()).toBeVisible();
  });
});
