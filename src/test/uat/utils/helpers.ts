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
 * Flow:
 * 1. Login (may redirect to auth-error if defaultDashboard is admin but no escalation yet)
 * 2. Navigate to a safe page (staff dashboard or wherever the user lands)
 * 3. Find "System Admin" link in header to trigger escalation modal
 * 4. Enter escalation password
 * 5. Navigate to /admin/dashboard
 */
export async function loginAsAdmin(page: Page, user: UATUser): Promise<void> {
  // Step 1: Login
  await page.goto('/login');
  await waitForPageLoad(page);
  await page.fill('[data-testid="email-input"], input[type="email"]', user.email);
  await page.fill('[data-testid="password-input"], input[type="password"]', user.password);
  await page.click('[data-testid="login-button"], button[type="submit"]');

  // Wait for redirect away from login (may land on auth-error, dashboard, etc.)
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(500);

  console.log('After admin login, landed on:', page.url());

  // Step 2: If on auth-error, navigate to a safe starting point
  if (page.url().includes('auth-error')) {
    // Go to the dashboard link on the auth-error page, or just navigate to root
    const dashboardLink = page.locator('a:has-text("Go to Dashboard"), a:has-text("Dashboard")');
    if (await dashboardLink.count() > 0) {
      await dashboardLink.first().click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto('/');
      await page.waitForTimeout(1000);
    }
    console.log('Navigated from auth-error to:', page.url());
  }

  // Step 3: If still on auth-error or login, try logging in fresh with redirect to root
  if (page.url().includes('auth-error') || page.url().includes('/login')) {
    await page.goto('/login');
    await waitForPageLoad(page);
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    await page.waitForTimeout(500);
  }

  // Step 4: Find and click the "System Admin" link in the header to trigger escalation
  const systemAdminLink = page.locator(
    'nav a:has-text("System Admin"), ' +
    'header a:has-text("System Admin"), ' +
    'a[href="/admin/dashboard"], ' +
    'button:has-text("System Admin"), ' +
    'a:has-text("Admin")'
  );

  // Wait for the header to be ready
  await page.waitForTimeout(1000);

  if (await systemAdminLink.count() > 0) {
    await systemAdminLink.first().click({ timeout: 15000 });
    await page.waitForTimeout(500);
  } else {
    // Try navigating directly — admin might already have access
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);

    if (page.url().includes('/admin/dashboard')) {
      console.log('Admin already has access to admin dashboard');
      return;
    }
  }

  // Step 5: Check for escalation modal
  const escalationModal = page.locator('[role="dialog"]');

  if (await escalationModal.count() > 0) {
    console.log('Admin escalation modal detected, entering password');

    const escalationPwd = user.escalationPassword || user.password;
    const passwordInput = page.locator('[role="dialog"] input[type="password"]');
    await passwordInput.fill(escalationPwd, { timeout: 15000 });

    // Submit escalation
    const submitButton = page.locator(
      '[role="dialog"] button[type="submit"], ' +
      '[role="dialog"] button:has-text("Enter Admin Mode"), ' +
      '[role="dialog"] button:has-text("Confirm")'
    );
    await submitButton.first().click({ timeout: 15000 });

    // Wait for escalation to complete
    await page.waitForURL(url => url.pathname.includes('/admin'), { timeout: 30000 });
    await waitForPageLoad(page);

    console.log('Admin escalation successful, now on:', page.url());
  } else {
    // No modal — admin might already be on admin dashboard or escalation not needed
    if (!page.url().includes('/admin')) {
      await page.goto('/admin/dashboard');
      await waitForPageLoad(page);
    }
    console.log('No escalation modal detected, now on:', page.url());
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
  // Step 1: Wait for sidebar to be fully rendered
  await page.waitForTimeout(1000);

  // Step 2: Expand the "Departments" section in the sidebar
  // Use a direct page locator (not scoped to aside) for reliability
  // The button has text "Departments" and an SVG icon
  const deptSectionBtn = page.locator('button').filter({ hasText: /^Departments$/i });
  const deptBtnCount = await deptSectionBtn.count();
  console.log(`Found ${deptBtnCount} "Departments" buttons`);

  if (deptBtnCount > 0) {
    // Click the Departments section header (last match to avoid matching other elements)
    await deptSectionBtn.last().click();
    await page.waitForTimeout(2000);
    console.log('Clicked Departments section header');
  }

  // Step 3: Check if department items appeared
  // After expanding, we should see department names like "Cognitive Therapy", "System Administration"
  const cogTherapy = page.locator('button:has-text("Cognitive Therapy")');
  const sysAdmin = page.locator('button:has-text("System Administration")');
  const backBtn = page.locator('button:has-text("Back to department list")');

  const hasDepts = (await cogTherapy.count() > 0) || (await sysAdmin.count() > 0) || (await backBtn.count() > 0);
  console.log('Department items visible:', hasDepts);

  if (!hasDepts && deptBtnCount > 0) {
    // Section didn't expand — try clicking again (it might have been already expanded and collapsed)
    await deptSectionBtn.last().click();
    await page.waitForTimeout(2000);
    console.log('Clicked Departments section header again');
  }

  // Step 4: Select a department
  if (departmentName) {
    const deptButton = page.locator(`button:has-text("${departmentName}")`);
    if (await deptButton.count() > 0) {
      await deptButton.first().click();
      console.log(`Selected department: ${departmentName}`);
    }
  } else {
    // Auto-select: prefer "Cognitive Therapy" (common test department)
    if (await cogTherapy.count() > 0) {
      const isDisabled = await cogTherapy.first().isDisabled().catch(() => false);
      if (!isDisabled) {
        await cogTherapy.first().click();
        console.log('Selected department: Cognitive Therapy');
      } else {
        console.log('Cognitive Therapy already selected');
      }
    } else if (await sysAdmin.count() > 0) {
      await sysAdmin.first().click();
      console.log('Selected department: System Administration');
    } else {
      console.log('No known departments found to select');
    }
  }

  // Wait for department context to load
  await page.waitForTimeout(1500);
}
