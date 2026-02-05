/**
 * Course Editor Page Object
 * 
 * Encapsulates interactions with the course editor page
 */

import { Page, Locator, expect } from '@playwright/test';

export class CourseEditorPage {
  readonly page: Page;
  
  // Form fields
  readonly titleInput: Locator;
  readonly codeInput: Locator;
  readonly descriptionInput: Locator;
  readonly departmentSelect: Locator;
  readonly creditsInput: Locator;
  readonly passingScoreInput: Locator;
  
  // Module management
  readonly addModuleButton: Locator;
  readonly moduleList: Locator;
  readonly moduleDialog: Locator;
  
  // Action buttons
  readonly saveButton: Locator;
  readonly backButton: Locator;
  readonly publishButton: Locator;
  readonly previewButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Form fields
    this.titleInput = page.locator('[data-testid="course-title-input"], input[name="title"], #title');
    this.codeInput = page.locator('[data-testid="course-code-input"], input[name="code"], #code');
    this.descriptionInput = page.locator('[data-testid="course-description-input"], textarea[name="description"], #description');
    this.departmentSelect = page.locator('[data-testid="department-select"], [name="department"]');
    this.creditsInput = page.locator('[data-testid="credits-input"], input[name="credits"], #credits');
    this.passingScoreInput = page.locator('[data-testid="passing-score-input"], input[name="passingScore"], input[name="settings.passingScore"]');
    
    // Module management
    this.addModuleButton = page.locator('[data-testid="add-module-button"], button:has-text("Add Module"), button:has-text("Add First Module"), button:has-text("New Module")');
    this.moduleList = page.locator('[data-testid="module-list"], [data-testid="modules-container"]');
    this.moduleDialog = page.locator('[data-testid="module-dialog"], [role="dialog"]');
    
    // Action buttons
    this.saveButton = page.locator('button:has-text("Create Course"), button:has-text("Save Changes")');
    this.backButton = page.locator('[data-testid="back-button"], button:has-text("Back"), a:has-text("Back")');
    this.publishButton = page.locator('button:has-text("Publish")');
    this.previewButton = page.locator('[data-testid="preview-button"], button:has-text("Preview"), a:has-text("Preview")');
  }

  async goto(courseId?: string): Promise<void> {
    if (courseId) {
      await this.page.goto(`/staff/courses/${courseId}/edit`);
    } else {
      await this.page.goto('/staff/courses/new');
    }
    await this.page.waitForLoadState('networkidle');
  }

  async fillCourseDetails(data: {
    title: string;
    code: string;
    description?: string;
    department?: string;
    credits?: number;
    passingScore?: number;
  }): Promise<void> {
    await this.titleInput.fill(data.title);
    await this.codeInput.fill(data.code);
    
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    
    if (data.department) {
      await this.selectDepartment(data.department);
    }
    
    if (data.credits !== undefined) {
      await this.creditsInput.fill(String(data.credits));
    }
    
    if (data.passingScore !== undefined) {
      await this.passingScoreInput.fill(String(data.passingScore));
    }
  }

  async selectDepartment(departmentName: string): Promise<void> {
    // Click the department select trigger
    const trigger = this.departmentSelect.locator('button, [role="combobox"]');
    if (await trigger.count() > 0) {
      await trigger.click();
      // Select department from dropdown
      const option = this.page.locator(`[role="option"]:has-text("${departmentName}"), [role="listbox"] *:has-text("${departmentName}")`);
      await option.first().click();
    }
  }

  async addModule(data: { title: string; description?: string }): Promise<void> {
    await this.addModuleButton.click();
    
    // Wait for dialog
    await expect(this.moduleDialog).toBeVisible();
    
    // Fill module details
    const moduleTitleInput = this.moduleDialog.locator('input[name="title"], [data-testid="module-title-input"], input').first();
    await moduleTitleInput.fill(data.title);
    
    if (data.description) {
      const moduleDescInput = this.moduleDialog.locator('textarea[name="description"], [data-testid="module-description-input"], textarea');
      if (await moduleDescInput.count() > 0) {
        await moduleDescInput.fill(data.description);
      }
    }
    
    // Submit - use the specific button text from the dialog
    const submitButton = this.moduleDialog.locator('button:has-text("Create Module"), button:has-text("Save Module"), button[type="submit"]');
    
    // Click and wait for API response (module creation)
    const responsePromise = this.page.waitForResponse(
      resp => {
        const isModuleCall = resp.url().includes('/modules') || resp.url().includes('/segments');
        if (isModuleCall) {
          console.log('Module API call URL:', resp.url());
          console.log('Module API call method:', resp.request().method());
        }
        return isModuleCall;
      },
      { timeout: 15000 }
    ).catch(() => null);
    
    await submitButton.click();
    
    const response = await responsePromise;
    if (response) {
      const status = response.status();
      const body = await response.text().catch(() => 'no body');
      console.log('Module API response:', status, body);
      
      // If API returns error, throw descriptive error for test
      if (status >= 400) {
        throw new Error(`Module creation failed: API returned ${status} - ${body}`);
      }
    } else {
      console.log('No module API call detected - this may indicate the form is not submitting');
    }
    
    // Wait for dialog to close
    await expect(this.moduleDialog).not.toBeVisible({ timeout: 10000 });
  }

  async getModuleCount(): Promise<number> {
    const modules = this.moduleList.locator('[data-testid^="module-item"], [data-testid^="module-card"], > div');
    return modules.count();
  }

  async saveCourse(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectSaveSuccess(): Promise<void> {
    // Look for success toast or redirect
    const toast = this.page.locator('[role="alert"]:has-text("success"), [role="alert"]:has-text("saved"), [role="alert"]:has-text("created")');
    await expect(toast).toBeVisible({ timeout: 10000 });
  }
}
