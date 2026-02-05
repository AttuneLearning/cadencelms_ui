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
 * Admin login helper - logs in and escalates to admin session
 * Required for accessing /admin/* routes which require escalation
 * 
 * Flow: Login -> Click "System Admin" in header -> Enter escalation password in modal
 */
export async function loginAsAdmin(page: Page, user: UATUser): Promise<void> {
  // First do normal login
  await login(page, user);
  
  // Wait for the header to load fully
  await waitForPageLoad(page);
  
  // Click on the "System Admin" link in the header to trigger escalation modal
  const systemAdminLink = page.locator('nav a:has-text("System Admin"), header a:has-text("System Admin"), a[href="/admin/dashboard"]');
  await systemAdminLink.first().click({ timeout: 30000 });
  
  // Wait for escalation modal to appear
  await page.waitForTimeout(500);
  
  // Check if escalation modal appears (has "Admin" in title or dialog content)
  const escalationModal = page.locator('[role="dialog"]');
  
  if (await escalationModal.count() > 0) {
    console.log('Admin escalation modal detected, entering password');
    
    // Find password input in modal and fill it - use escalation password if provided
    const escalationPwd = (user as any).escalationPassword || user.password;
    const passwordInput = page.locator('[role="dialog"] input[type="password"]');
    await passwordInput.fill(escalationPwd, { timeout: 30000 });
    
    // Submit escalation - look for "Enter Admin Mode" button or form submit
    const submitButton = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Enter Admin Mode"), [role="dialog"] button:has-text("Confirm")');
    await submitButton.first().click({ timeout: 30000 });
    
    // Wait for escalation to complete and navigation
    await page.waitForURL(url => url.pathname.includes('/admin'), { timeout: 30000 });
    await waitForPageLoad(page);
    
    console.log('Admin escalation successful, now on:', page.url());
  } else {
    console.log('No escalation modal detected - user may already have admin session');
  }
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

/**
 * Check if the current page is a 404 Not Found page
 */
export async function isPageNotFound(page: Page): Promise<boolean> {
  const notFoundText = page.getByText(/404|page not found|does not exist/i);
  return (await notFoundText.count()) > 0;
}

/**
 * Select a department from the sidebar
 * Required for department-scoped pages like Question Bank
 *
 * The sidebar has a "My Departments" section that expands to show available departments.
 * Each department is a button inside this section.
 */
export async function selectDepartment(page: Page, departmentName?: string): Promise<void> {
  // Click on "My Departments" section header to expand the department list
  const departmentsSectionHeader = page.locator('aside button:has-text("My Departments")');

  if (await departmentsSectionHeader.count() > 0) {
    await departmentsSectionHeader.click();
    await page.waitForTimeout(500);
  }

  // Find department buttons inside the sidebar
  // Departments are buttons inside 'aside' that have the Primary badge or are department items
  // They appear after clicking "My Departments" and contain department names with optional "Primary" badge
  const departmentButtons = page.locator('aside button').filter({
    has: page.locator('svg') // Department buttons have folder icons (svg)
  }).filter({
    hasNot: page.locator('text="My Departments"') // Exclude the section header
  }).filter({
    hasNot: page.locator('text="Navigation"') // Exclude Navigation section header
  }).filter({
    hasNot: page.locator('text="Staff"') // Exclude Staff section header
  }).filter({
    hasNot: page.locator('text="Settings"') // Exclude Settings
  });

  // If a specific department is requested, click it; otherwise click the first available
  if (departmentName) {
    const deptButton = page.locator(`aside button:has-text("${departmentName}")`);
    if (await deptButton.count() > 0) {
      await deptButton.first().click();
    }
  } else {
    // Click on a button that has "Primary" badge first (preferred), or the first department
    const primaryDept = page.locator('aside button:has(.badge:has-text("Primary"))');

    if (await primaryDept.count() > 0) {
      await primaryDept.first().click();
      console.log('Selected primary department');
    } else if (await departmentButtons.count() > 0) {
      // Get all button texts to debug
      const count = await departmentButtons.count();
      console.log(`Found ${count} potential department buttons`);

      // Click the first department button that's not a section header
      for (let i = 0; i < count; i++) {
        const btn = departmentButtons.nth(i);
        const text = await btn.textContent();
        console.log(`Button ${i}: ${text}`);

        // Skip known section headers and settings
        if (text && !text.includes('My Departments') && !text.includes('Navigation') &&
            !text.includes('Staff') && !text.includes('Settings') && !text.includes('Switch')) {
          await btn.click();
          console.log(`Clicked department: ${text}`);
          break;
        }
      }
    }
  }

  // Wait for department context to load
  await page.waitForTimeout(1000);
}
