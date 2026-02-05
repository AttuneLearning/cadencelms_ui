/**
 * UAT Helper Utilities
 * 
 * Common helper functions for UAT scenarios
 */

import { Page, expect } from '@playwright/test';
import { UATUser } from '../fixtures/users';

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Login helper - performs login with given credentials
 */
export async function login(page: Page, user: UATUser): Promise<void> {
  await page.goto('/login');
  await waitForPageLoad(page);
  
  // Fill credentials
  await page.fill('[data-testid="email-input"], input[type="email"]', user.email);
  await page.fill('[data-testid="password-input"], input[type="password"]', user.password);
  
  // Submit
  await page.click('[data-testid="login-button"], button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  // Try common logout patterns
  const logoutButton = page.locator('[data-testid="logout-button"], [aria-label="Logout"], button:has-text("Logout")');
  
  if (await logoutButton.count() > 0) {
    await logoutButton.first().click();
  } else {
    // Navigate to logout route
    await page.goto('/logout');
  }
  
  await page.waitForURL('**/login**');
}

/**
 * Check if user is on expected dashboard
 */
export async function expectDashboard(page: Page, expectedPath: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(expectedPath));
}

/**
 * Navigate via sidebar
 */
export async function navigateTo(page: Page, linkText: string): Promise<void> {
  const navLink = page.locator(`nav a:has-text("${linkText}"), [data-testid="nav-link-${linkText.toLowerCase()}"]`);
  await navLink.click();
  await waitForPageLoad(page);
}

/**
 * Assert toast/notification message
 */
export async function expectToast(page: Page, message: string | RegExp): Promise<void> {
  const toast = page.locator('[role="alert"], [data-testid="toast"], .toast');
  await expect(toast).toContainText(message);
}

/**
 * Screenshot helper for UAT documentation
 */
export async function captureState(page: Page, name: string): Promise<void> {
  await page.screenshot({ 
    path: `playwright-report/screenshots/${name}.png`,
    fullPage: true 
  });
}
