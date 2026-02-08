/**
 * Module Builder Page Object
 *
 * Encapsulates interactions with module creation and content assembly.
 * Handles adding learning activities (lessons, quizzes, flashcards) to modules.
 */

import { Page, Locator, expect } from '@playwright/test';

export interface LearningActivityData {
  type: 'lesson' | 'quiz' | 'flashcard' | 'exercise' | 'assessment' | 'video';
  title: string;
  existingId?: string; // If linking existing activity
  order?: number;
}

export interface ModuleData {
  title: string;
  description: string;
  learningActivities?: LearningActivityData[];
}

export class ModuleBuilderPage {
  readonly page: Page;

  // Page header
  readonly pageTitle: Locator;
  readonly createModuleButton: Locator;

  // Module list
  readonly moduleTable: Locator;
  readonly moduleRows: Locator;

  // Module form
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;

  // Learning activities
  readonly activitiesList: Locator;
  readonly addActivityButton: Locator;
  readonly activityTypeSelect: Locator;
  readonly existingActivitySelect: Locator;

  // Reordering
  readonly dragHandle: Locator;
  readonly moveUpButton: Locator;
  readonly moveDownButton: Locator;

  // Actions
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page header
    this.pageTitle = page.locator('h1:has-text("Module"), [data-testid="page-header"]');
    this.createModuleButton = page.locator(
      '[data-testid="create-module-button"], ' +
      'button:has-text("Create Module"), ' +
      'button:has-text("Add Module"), ' +
      'button:has-text("New Module")'
    );

    // Module list
    this.moduleTable = page.locator('[data-testid="module-table"], table, [role="table"]');
    this.moduleRows = page.locator('[data-testid^="module-row"], tbody tr, [role="row"]:not([role="columnheader"])');

    // Module form
    this.dialog = page.locator('[data-testid="module-dialog"], [role="dialog"]');
    this.titleInput = page.locator(
      '[data-testid="module-title-input"], input[name="title"], input[placeholder*="title" i]'
    );
    this.descriptionInput = page.locator(
      '[data-testid="module-description-input"], textarea[name="description"]'
    );

    // Learning activities
    this.activitiesList = page.locator(
      '[data-testid="activities-list"], [data-testid="learning-activities"], .activities-container'
    );
    this.addActivityButton = page.locator(
      '[data-testid="add-activity-button"], ' +
      'button:has-text("Add Activity"), ' +
      'button:has-text("Add Learning Activity"), ' +
      'button:has-text("+ Activity")'
    );
    this.activityTypeSelect = page.locator(
      '[data-testid="activity-type-select"], [name="activityType"]'
    );
    this.existingActivitySelect = page.locator(
      '[data-testid="existing-activity-select"], [name="existingActivityId"]'
    );

    // Reordering
    this.dragHandle = page.locator('[data-testid="drag-handle"], .drag-handle, [draggable="true"]');
    this.moveUpButton = page.locator('[data-testid="move-up-button"], button:has-text("Move Up")');
    this.moveDownButton = page.locator('[data-testid="move-down-button"], button:has-text("Move Down")');

    // Actions
    this.saveButton = page.locator(
      '[data-testid="save-module-button"], button[type="submit"], button:has-text("Save")'
    );
    this.cancelButton = page.locator('[data-testid="cancel-button"], button:has-text("Cancel")');
    this.publishButton = page.locator('[data-testid="publish-button"], button:has-text("Publish")');
  }

  /**
   * Navigate to module builder page
   */
  async goto(courseId?: string): Promise<void> {
    if (courseId) {
      await this.page.goto(`/staff/courses/${courseId}/modules`);
    } else {
      await this.page.goto('/staff/modules');
    }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Navigate to edit a specific module
   */
  async gotoEdit(moduleId: string): Promise<void> {
    await this.page.goto(`/staff/modules/${moduleId}/edit`);
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Create a new module with optional learning activities
   */
  async createModule(data: ModuleData): Promise<void> {
    await this.createModuleButton.click();
    await this.page.waitForTimeout(500);

    const dialogVisible = await this.dialog.isVisible().catch(() => false);

    // Fill basic details
    const titleInput = dialogVisible
      ? this.dialog.locator('input[name="title"]').first()
      : this.titleInput;
    await titleInput.fill(data.title);

    const descInput = dialogVisible
      ? this.dialog.locator('textarea[name="description"]').first()
      : this.descriptionInput;
    if (await descInput.count() > 0) {
      await descInput.fill(data.description);
    }

    // Save module first
    const saveBtn = dialogVisible
      ? this.dialog.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first()
      : this.saveButton;
    await saveBtn.click();

    if (dialogVisible) {
      await expect(this.dialog).not.toBeVisible({ timeout: 10000 });
    }

    // Add learning activities if specified
    if (data.learningActivities && data.learningActivities.length > 0) {
      // Wait for module to be created and navigate to edit
      await this.page.waitForTimeout(1000);

      for (const activity of data.learningActivities) {
        await this.addLearningActivity(activity);
      }
    }
  }

  /**
   * Add a learning activity to the current module
   */
  async addLearningActivity(activity: LearningActivityData): Promise<void> {
    // Click add activity button
    const addButton = this.page.locator(
      '[data-testid="add-activity-button"], ' +
      'button:has-text("Add Activity"), ' +
      'button:has-text("Add Learning Activity")'
    );
    await addButton.click();
    await this.page.waitForTimeout(500);

    // Select activity type
    const typeSelect = this.page.locator(
      '[data-testid="activity-type-select"], [name="activityType"], [role="dialog"] select'
    );
    if (await typeSelect.count() > 0) {
      const trigger = typeSelect.locator('button, [role="combobox"]').first();
      if (await trigger.count() > 0) {
        await trigger.click();
        await this.page.waitForTimeout(300);
        const option = this.page.locator(`[role="option"]:has-text("${activity.type}")`);
        if (await option.count() > 0) {
          await option.first().click();
        }
      } else {
        // Direct select
        await typeSelect.selectOption({ label: activity.type });
      }
    }

    // If linking existing activity
    if (activity.existingId || activity.title) {
      const existingSelect = this.page.locator(
        '[data-testid="existing-activity-select"], [name="activityId"], [name="existingActivityId"]'
      );
      if (await existingSelect.count() > 0) {
        const trigger = existingSelect.locator('button, [role="combobox"]').first();
        if (await trigger.count() > 0) {
          await trigger.click();
          await this.page.waitForTimeout(300);
          const searchTerm = activity.existingId || activity.title;
          const option = this.page.locator(`[role="option"]:has-text("${searchTerm}")`);
          if (await option.count() > 0) {
            await option.first().click();
          }
        }
      }
    }

    // Confirm adding activity
    const confirmButton = this.page.locator(
      'button:has-text("Add"), button:has-text("Confirm"), button:has-text("Save")'
    ).last();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * Add an existing quiz to the module
   */
  async addQuizToModule(quizTitle: string): Promise<void> {
    await this.addLearningActivity({
      type: 'quiz',
      title: quizTitle,
    });
  }

  /**
   * Add an existing flashcard set to the module
   */
  async addFlashcardSetToModule(flashcardTitle: string): Promise<void> {
    await this.addLearningActivity({
      type: 'flashcard',
      title: flashcardTitle,
    });
  }

  /**
   * Reorder activities within the module
   */
  async reorderActivity(activityTitle: string, newPosition: number): Promise<void> {
    const activityRow = this.page.locator(
      `[data-testid^="activity-row"]:has-text("${activityTitle}"), tr:has-text("${activityTitle}")`
    );

    // Get current position
    const activities = this.page.locator('[data-testid^="activity-row"], .activity-item');
    const currentIndex = await activities.evaluateAll(
      (elements, title) => elements.findIndex(el => el.textContent?.includes(title)),
      activityTitle
    );

    // Move up or down as needed
    const moveCount = currentIndex - newPosition;

    for (let i = 0; i < Math.abs(moveCount); i++) {
      const rowButton = activityRow.locator(
        moveCount > 0 ? 'button:has-text("Up"), [data-testid="move-up"]' : 'button:has-text("Down"), [data-testid="move-down"]'
      );
      if (await rowButton.count() > 0) {
        await rowButton.click();
        await this.page.waitForTimeout(300);
      }
    }
  }

  /**
   * Remove an activity from the module
   */
  async removeActivity(activityTitle: string): Promise<void> {
    const activityRow = this.page.locator(
      `[data-testid^="activity-row"]:has-text("${activityTitle}"), tr:has-text("${activityTitle}")`
    );
    const removeButton = activityRow.locator(
      'button:has-text("Remove"), button:has-text("Delete"), [data-testid="remove-activity"]'
    );
    await removeButton.click();

    // Confirm removal
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Remove")').last();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
  }

  /**
   * Get count of modules
   */
  async getModuleCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return this.moduleRows.count();
  }

  /**
   * Get count of learning activities in current module
   */
  async getActivityCount(): Promise<number> {
    const activities = this.page.locator(
      '[data-testid^="activity-row"], .activity-item, [data-testid="learning-activities"] > *'
    );
    return activities.count();
  }

  /**
   * Verify a module exists
   */
  async expectModuleExists(title: string): Promise<void> {
    const module = this.page.locator(`text="${title}"`);
    await expect(module).toBeVisible();
  }

  /**
   * Verify an activity exists in the module
   */
  async expectActivityExists(title: string): Promise<void> {
    const activity = this.page.locator(`text="${title}"`);
    await expect(activity).toBeVisible();
  }

  /**
   * Edit an existing module
   */
  async editModule(title: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${title}"), [data-testid^="module-row"]:has-text("${title}")`);
    const editButton = row.locator('button:has-text("Edit"), [data-testid="edit-button"]');
    await editButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Delete a module
   */
  async deleteModule(title: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${title}"), [data-testid^="module-row"]:has-text("${title}")`);
    const deleteButton = row.locator('button:has-text("Delete"), [data-testid="delete-button"]');
    await deleteButton.click();

    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
    await confirmButton.click();
  }

  /**
   * Save current module changes
   */
  async saveModule(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Publish the module
   */
  async publishModule(): Promise<void> {
    await this.publishButton.click();

    // Confirm publish
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Publish")').last();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
  }
}
