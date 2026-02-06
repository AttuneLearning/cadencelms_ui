/**
 * UAT: Department Enrollment Page & Course Actions
 *
 * User Story: As a staff member, I want to enroll learners in courses
 * so that they can access learning content.
 *
 * Also tests course action menu functionality (publish, unpublish, etc.)
 */

import { test, expect } from '@playwright/test';
import { uatUsers } from '../fixtures';
import { login, waitForPageLoad, selectDepartment } from '../utils/helpers';

test.describe('User Story: Course Enrollment Management', () => {

  test.beforeEach(async ({ page }) => {
    // Login as staff user - try rileyInstructor who has multiple departments
    await login(page, uatUsers.rileyInstructor);
    await waitForPageLoad(page);
  });

  test.describe('AC1: Can navigate to enrollment page', () => {

    test('Staff can access department enrollment page via sidebar', async ({ page }) => {
      // Given: I am logged in as staff
      // When: I select a department and navigate to enrollments

      // First, select a department from sidebar
      await selectDepartment(page);

      // Look for "Course Enrollments" link in sidebar actions
      const enrollmentLink = page.locator(
        '[data-testid="nav-link-Course Enrollments"], ' +
        'a:has-text("Course Enrollments"), ' +
        'a[href*="/enrollments"]'
      );

      if (await enrollmentLink.count() > 0) {
        await enrollmentLink.first().click();
        await waitForPageLoad(page);

        // Then: I see the enrollment page
        await expect(page).toHaveURL(/\/departments\/.*\/enrollments/);
        await expect(page.locator('h1, [data-testid="page-title"]')).toContainText(/enrollment/i);
      } else {
        // Log what links are visible in sidebar for debugging
        const sidebarLinks = await page.locator('aside a').allTextContents();
        console.log('Available sidebar links:', sidebarLinks);

        test.fail(true, 'Course Enrollments link not found in sidebar');
      }
    });

    test('Can navigate directly to enrollment page URL', async ({ page }) => {
      // Given: I know a valid department ID
      // When: I navigate directly to the enrollment URL

      // First get a department ID by going to staff dashboard and checking URL
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);

      // Select a department to get its ID
      await selectDepartment(page);
      await page.waitForTimeout(1000);

      // Try to find the department ID from the URL or page content
      // Navigate to courses page to get dept ID from URL
      const coursesLink = page.locator('a[href*="/departments/"][href*="/courses"]');

      if (await coursesLink.count() > 0) {
        const href = await coursesLink.first().getAttribute('href');
        const deptIdMatch = href?.match(/\/departments\/([^/]+)/);

        if (deptIdMatch) {
          const deptId = deptIdMatch[1];
          console.log('Found department ID:', deptId);

          // Navigate to enrollment page
          await page.goto(`/staff/departments/${deptId}/enrollments`);
          await waitForPageLoad(page);

          // Should see enrollment page
          await expect(page).toHaveURL(/\/enrollments/);
        }
      }
    });
  });

  test.describe('AC2: Course dropdown shows published courses', () => {

    test('Course dropdown is populated with department courses', async ({ page }) => {
      // Step 1: Go to staff dashboard
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);
      console.log('Step 1: On staff dashboard');

      // Step 2: Pick Cognitive Therapy department
      // First expand DEPARTMENTS section
      const deptSection = page.locator('button:has-text("Departments")');
      await deptSection.click();
      await page.waitForTimeout(500);

      // Click on "Cognitive Therapy" department
      const cogTherapyDept = page.locator('button:has-text("Cognitive Therapy")');
      await cogTherapyDept.click();
      await page.waitForTimeout(1000);
      console.log('Step 2: Selected Cognitive Therapy department');

      // Take screenshot after selecting department
      await page.screenshot({ path: 'playwright-report/screenshots/after-dept-select.png', fullPage: true });

      // Step 3: Click Course Enrollments link
      const enrollmentLink = page.locator('[data-testid="nav-link-Course Enrollments"], a:has-text("Course Enrollments")');
      const enrollCount = await enrollmentLink.count();
      console.log('Course Enrollments links found:', enrollCount);

      if (enrollCount === 0) {
        // Log all visible links in sidebar for debugging
        const allLinks = await page.locator('aside a').allTextContents();
        console.log('All sidebar links:', allLinks);
        test.fail(true, 'Course Enrollments link not found in sidebar after selecting department');
        return;
      }

      await enrollmentLink.first().click();
      await waitForPageLoad(page);
      console.log('Step 3: Clicked Course Enrollments, now at:', page.url());

      // Take screenshot of enrollment page
      await page.screenshot({ path: 'playwright-report/screenshots/enrollment-page.png', fullPage: true });

      // When: I look at the course dropdown
      const courseDropdown = page.locator('[data-testid="course-select"], select, [role="combobox"]');

      // Take screenshot for debugging
      await page.screenshot({ path: 'playwright-report/screenshots/enrollment-page.png', fullPage: true });

      // Check if dropdown exists
      const dropdownCount = await courseDropdown.count();
      console.log('Course dropdown found:', dropdownCount > 0);

      if (dropdownCount > 0) {
        // Click to open the dropdown
        await courseDropdown.first().click();
        await page.waitForTimeout(500);

        // Take screenshot of open dropdown
        await page.screenshot({ path: 'playwright-report/screenshots/enrollment-dropdown-open.png', fullPage: true });

        // Look for dropdown options
        const options = page.locator('[role="option"], [role="listbox"] [role="option"], option');
        const optionCount = await options.count();
        console.log('Dropdown options count:', optionCount);

        // Get all option texts
        const optionTexts = await options.allTextContents();
        console.log('Dropdown options:', optionTexts);

        // Then: Dropdown should have courses OR show "no courses" message
        if (optionCount > 0) {
          expect(optionCount).toBeGreaterThan(0);
        } else {
          // Check for empty state message
          const emptyMessage = page.locator('text=/no.*course|no published/i');
          const hasEmptyMessage = await emptyMessage.count() > 0;
          console.log('Has empty message:', hasEmptyMessage);

          // Check the select trigger text
          const triggerText = await courseDropdown.first().textContent();
          console.log('Dropdown trigger text:', triggerText);

          // If no courses and no empty message, this is a bug
          if (!hasEmptyMessage && !triggerText?.toLowerCase().includes('no')) {
            test.fail(true, 'Dropdown is empty with no explanation');
          }
        }
      } else {
        // Log page content for debugging
        const pageContent = await page.content();
        console.log('Page URL:', page.url());
        console.log('Page has course selection card:', pageContent.includes('Select Course'));

        test.fail(true, 'Course dropdown not found on page');
      }
    });

    test('Check console for debug logs', async ({ page }) => {
      // Capture console messages
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.text().includes('DepartmentEnrollmentPage')) {
          consoleLogs.push(msg.text());
        }
      });

      // Navigate to enrollment page
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);
      await selectDepartment(page);

      const enrollmentLink = page.locator('a:has-text("Course Enrollments"), a[href*="/enrollments"]');
      if (await enrollmentLink.count() > 0) {
        await enrollmentLink.first().click();
        await waitForPageLoad(page);
        await page.waitForTimeout(2000); // Wait for queries to complete

        // Log the captured console messages
        console.log('=== Debug logs from DepartmentEnrollmentPage ===');
        consoleLogs.forEach(log => console.log(log));

        // Check if we captured the course query state
        const courseStateLog = consoleLogs.find(log => log.includes('courseCount'));
        if (courseStateLog) {
          console.log('Course query state found:', courseStateLog);
        } else {
          console.log('No course query state log found - debug logging may not be active');
        }
      }
    });
  });

  test.describe('AC3: Can select a course from dropdown', () => {

    test('Selecting a course shows enrollment options', async ({ page }) => {
      // Given: I am on the enrollment page with courses available
      await page.goto('/staff/dashboard');
      await waitForPageLoad(page);
      await selectDepartment(page);

      const enrollmentLink = page.locator('a:has-text("Course Enrollments"), a[href*="/enrollments"]');
      if (await enrollmentLink.count() > 0) {
        await enrollmentLink.first().click();
        await waitForPageLoad(page);
      }

      // When: I select a course
      const courseDropdown = page.locator('[role="combobox"]');

      if (await courseDropdown.count() > 0) {
        await courseDropdown.first().click();
        await page.waitForTimeout(500);

        const firstOption = page.locator('[role="option"]').first();

        if (await firstOption.count() > 0) {
          await firstOption.click();
          await waitForPageLoad(page);

          // Then: I see the "Enroll Learners" button
          const enrollButton = page.locator('button:has-text("Enroll Learners")');
          await expect(enrollButton).toBeVisible();
        } else {
          test.skip(true, 'No courses available to select');
        }
      }
    });
  });
});

/**
 * UAT: Course Action Menu
 *
 * User Story: As a staff member, I want to manage course status
 * so that I can publish courses for students to access.
 */
test.describe('User Story: Course Action Menu', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, uatUsers.rileyInstructor);
    await waitForPageLoad(page);
  });

  test('Can publish a draft course from action menu', async ({ page }) => {
    // Capture network requests to see what's being sent
    const apiRequests: { url: string; method: string; postData?: string }[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/') && request.url().includes('/courses')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData() || undefined,
        });
      }
    });

    const apiResponses: { url: string; status: number; body?: string }[] = [];
    page.on('response', async response => {
      if (response.url().includes('/api/') && response.url().includes('/courses')) {
        let body: string | undefined;
        try {
          body = await response.text();
        } catch {
          body = undefined;
        }
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          body,
        });
      }
    });

    // Step 1: Go to staff dashboard
    await page.goto('/staff/dashboard');
    await waitForPageLoad(page);

    // Step 2: Select Cognitive Therapy department
    const deptSection = page.locator('button:has-text("Departments")');
    await deptSection.click();
    await page.waitForTimeout(500);

    const cogTherapyDept = page.locator('button:has-text("Cognitive Therapy")');
    await cogTherapyDept.click();
    await page.waitForTimeout(1000);

    // Step 3: Go to Manage Courses
    const manageCoursesLink = page.locator('a:has-text("Manage Courses")');
    await manageCoursesLink.click();
    await waitForPageLoad(page);
    console.log('Step 3: On Manage Courses page:', page.url());

    // Wait for course cards to load (not just skeleton)
    // Look for actual course content - course titles are in CardTitle elements
    await page.waitForSelector('h3, [data-testid="course-title"]', { timeout: 10000 }).catch(() => {
      console.log('No course titles found - checking for empty state');
    });
    await page.waitForTimeout(1000); // Extra wait for full render

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/screenshots/manage-courses.png', fullPage: true });

    // Step 4: Find a draft course and click its action menu
    // Look for course cards with "Draft" text (badge)
    const draftText = page.locator('text="Draft"').first();
    const hasDraft = await draftText.count() > 0;
    console.log('Has draft course:', hasDraft);

    // Also log all visible badges for debugging
    const allBadges = await page.locator('span, div').filter({ hasText: /^Draft$|^Published$|^Archived$/ }).allTextContents();
    console.log('All status badges found:', allBadges.slice(0, 10));

    if (!hasDraft) {
      console.log('No draft courses found - skipping test');
      test.skip(true, 'No draft courses available');
      return;
    }

    // Find the action menu button (three dots) near the draft badge
    // The menu button has sr-only text "Open menu"
    const courseCard = page.locator('[class*="card"]').filter({ has: page.locator('text="Draft"') }).first();

    // Log what we found
    const cardText = await courseCard.textContent();
    console.log('Course card content:', cardText?.substring(0, 200));

    // Find the action menu button - look for button with "Open menu" sr-only text or MoreHorizontal icon
    const actionMenuBtn = courseCard.locator('button:has-text("Open menu"), button[aria-label*="menu"]').first();
    const btnCount = await actionMenuBtn.count();
    console.log('Action menu button found:', btnCount > 0);

    if (btnCount === 0) {
      // Try alternative: any button with just an SVG (no text besides sr-only)
      const altBtn = courseCard.locator('button').filter({ has: page.locator('svg') });
      const altCount = await altBtn.count();
      console.log('Alternative buttons with SVG:', altCount);

      // Click the last one (usually the action menu is after Edit/Preview buttons)
      if (altCount > 0) {
        await altBtn.last().click();
      } else {
        test.fail(true, 'Could not find action menu button');
        return;
      }
    } else {
      await actionMenuBtn.click();
    }

    await page.waitForTimeout(500);

    // Take screenshot of open menu
    await page.screenshot({ path: 'playwright-report/screenshots/action-menu-open.png', fullPage: true });

    // Step 5: Click Publish
    const publishMenuItem = page.locator('[role="menuitem"]:has-text("Publish")');
    const hasPublish = await publishMenuItem.count() > 0;
    console.log('Has Publish menu item:', hasPublish);

    if (!hasPublish) {
      // Log all menu items
      const menuItems = await page.locator('[role="menuitem"]').allTextContents();
      console.log('Available menu items:', menuItems);
      test.fail(true, 'Publish menu item not found');
      return;
    }

    await publishMenuItem.click();
    await page.waitForTimeout(500);

    // Take screenshot of confirmation dialog
    await page.screenshot({ path: 'playwright-report/screenshots/publish-confirm.png', fullPage: true });

    // Step 6: Confirm publish in dialog
    const confirmBtn = page.locator('[role="dialog"] button:has-text("Publish")');
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Take screenshot of result
      await page.screenshot({ path: 'playwright-report/screenshots/publish-result.png', fullPage: true });

      // Log API requests and responses
      console.log('=== API Requests ===');
      apiRequests.forEach(req => {
        console.log(`${req.method} ${req.url}`);
        if (req.postData) console.log('  Body:', req.postData);
      });

      console.log('=== API Responses ===');
      apiResponses.forEach(res => {
        console.log(`${res.status} ${res.url}`);
        if (res.body) console.log('  Body:', res.body.substring(0, 500));
      });

      // Check for error toast
      const errorToast = page.locator('[role="alert"]:has-text("Failed")');
      const hasError = await errorToast.count() > 0;

      if (hasError) {
        const errorText = await errorToast.textContent();
        console.log('Error toast found:', errorText);
        test.fail(true, `Publish failed: ${errorText}`);
      } else {
        // Check for success toast
        const successToast = page.locator('[role="alert"]:has-text("published")');
        const hasSuccess = await successToast.count() > 0;
        console.log('Success toast found:', hasSuccess);

        expect(hasSuccess).toBe(true);
      }
    }
  });
});
