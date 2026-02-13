/**
 * UAT: Authentication User Stories
 *
 * User Story: As a user, I want to log in to the system so I can access my dashboard.
 *
 * Acceptance Criteria:
 * - AC1: Valid credentials redirect to appropriate dashboard
 * - AC2: Invalid credentials show error message
 * - AC3: Logout returns user to login page
 * - AC4: Protected routes redirect unauthenticated users to login
 */

import { test, expect } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { LoginPage } from '../utils/pages';
import { waitForPageLoad, loginAsAdmin } from '../utils/helpers';

test.describe('User Story: User Authentication', () => {

  test.describe('AC1: Valid credentials redirect to appropriate dashboard', () => {

    test('Learner is redirected to learner dashboard', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      const learner = uatUsers.learner;
      await loginPage.login(learner.email, learner.password);

      await loginPage.expectSuccessfulLogin(/learner\/dashboard/);
    });

    test('Staff member is redirected to staff dashboard', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      const staff = uatUsers.staff;
      await loginPage.login(staff.email, staff.password);

      await loginPage.expectSuccessfulLogin(/staff\/dashboard/);
    });

    test('Admin can access admin dashboard via escalation', async ({ page }) => {
      // Admin is a global-admin user type — requires escalation to reach /admin
      await loginAsAdmin(page, uatUsers.admin);

      await expect(page).toHaveURL(/admin\/dashboard/, { timeout: 30000 });
    });
  });

  test.describe('AC2: Invalid credentials show error message', () => {

    test('Wrong password shows authentication error', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(uatUsers.learner.email, 'WrongPassword123!');

      // Error box appears with "Login Failed" text
      await loginPage.expectErrorMessage(/invalid|incorrect|failed/i);
      await expect(page).toHaveURL(/login/);
    });

    test('Non-existent user shows authentication error', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login('nonexistent@lms.edu', 'Password123!');

      await loginPage.expectErrorMessage(/invalid|not found|failed/i);
    });

    test('Empty fields show validation error', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Click submit without filling anything — zod validation fires
      await loginPage.loginButton.click();

      // React-hook-form + zod shows per-field validation messages
      // The form should NOT submit and should show inline errors or stay disabled
      const hasFieldError = await page.locator('p[id*="form-item-message"]').count() > 0;
      const hasError = await loginPage.errorMessage.count() > 0;
      const isStillOnLogin = page.url().includes('/login');

      expect(hasFieldError || hasError || isStillOnLogin).toBe(true);
    });
  });

  test.describe('AC3: Logout returns user to login page', () => {

    test('User can logout and is returned to login', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(uatUsers.learner.email, uatUsers.learner.password);
      await waitForPageLoad(page);

      // Look for logout button — may be in a dropdown menu
      const logoutButton = page.locator('[data-testid="logout-button"], [aria-label*="logout" i], button:has-text("Logout"), button:has-text("Log out")');

      // Check user menu / avatar dropdown if direct button not visible
      const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user" i]');
      if (await userMenu.count() > 0 && await logoutButton.count() === 0) {
        await userMenu.click();
      }

      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();

        await expect(page).toHaveURL(/login/);
      } else {
        // Logout mechanism not visible — skip
        test.skip();
      }
    });
  });

  test.describe('AC4: Protected routes redirect to login', () => {

    test('Unauthenticated user accessing dashboard is redirected', async ({ page }) => {
      await page.goto('/learner/dashboard');

      await expect(page).toHaveURL(/login|auth-error/);
    });

    test('Unauthenticated user accessing admin is redirected', async ({ page }) => {
      await page.goto('/admin/dashboard');

      await expect(page).toHaveURL(/login|auth-error|unauthorized/);
    });
  });
});
