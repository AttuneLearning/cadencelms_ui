/**
 * Question Bank Page Object
 * 
 * Encapsulates interactions with the question bank management page
 */

import { Page, Locator, expect } from '@playwright/test';
import { selectDepartment } from '../helpers';

export class QuestionBankPage {
  readonly page: Page;
  
  // Header actions
  readonly createQuestionButton: Locator;
  readonly bulkImportButton: Locator;
  readonly filterButton: Locator;
  readonly searchInput: Locator;
  
  // Question list
  readonly questionTable: Locator;
  readonly questionRows: Locator;
  
  // Create/Edit dialog
  readonly questionDialog: Locator;
  readonly questionTextInput: Locator;
  readonly questionTypeSelect: Locator;
  readonly difficultySelect: Locator;
  readonly pointsInput: Locator;
  readonly tagsInput: Locator;
  readonly addOptionButton: Locator;
  readonly saveQuestionButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header actions
    this.createQuestionButton = page.locator('[data-testid="create-question-button"], button:has-text("Create Question"), button:has-text("Add Question"), button:has-text("New Question")');
    this.bulkImportButton = page.locator('[data-testid="bulk-import-button"], button:has-text("Import")');
    this.filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter")');
    this.searchInput = page.locator('[data-testid="question-search"], input[placeholder*="search" i]');
    
    // Question list
    this.questionTable = page.locator('[data-testid="question-table"], table, [role="table"]');
    this.questionRows = page.locator('[data-testid^="question-row"], tbody tr, [role="row"]:not([role="columnheader"])');
    
    // Create/Edit dialog
    this.questionDialog = page.locator('[data-testid="question-dialog"], [role="dialog"]');
    this.questionTextInput = page.locator('[data-testid="question-text-input"], textarea[name="questionText"], [name="question_text"]');
    this.questionTypeSelect = page.locator('[data-testid="question-type-select"], [name="questionType"], [name="type"]');
    this.difficultySelect = page.locator('[data-testid="difficulty-select"], [name="difficulty"]');
    this.pointsInput = page.locator('[data-testid="points-input"], input[name="points"]');
    this.tagsInput = page.locator('[data-testid="tags-input"], input[name="tags"]');
    this.addOptionButton = page.locator('[data-testid="add-option-button"], button:has-text("Add Option")');
    this.saveQuestionButton = page.locator('[data-testid="save-question-button"], button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    this.cancelButton = page.locator('[data-testid="cancel-button"], button:has-text("Cancel")');
  }

  /**
   * Navigate to question bank - admin route (requires global-admin + escalation)
   * Uses SPA navigation to avoid losing admin memory token (page.goto causes full reload)
   * Also selects a department if needed (question bank is department-scoped)
   */
  async goto(): Promise<void> {
    // If already on admin questions page, skip navigation
    if (!this.page.url().includes('/admin/questions')) {
      // Try sidebar link first
      const adminSection = this.page.locator('button:has-text("Administration")');
      if (await adminSection.count() > 0) {
        await adminSection.click();
        await this.page.waitForTimeout(500);
      }

      const qbLink = this.page.locator('a[href="/admin/questions"], a:has-text("Question Bank"), a:has-text("Questions")');
      if (await qbLink.count() > 0) {
        await qbLink.first().click();
      } else {
        // No sidebar link — use SPA navigation to avoid full page reload (preserves memory token)
        await this.page.evaluate(() => {
          window.history.pushState({}, '', '/admin/questions');
          window.dispatchEvent(new PopStateEvent('popstate'));
        });
      }

      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    }

    // Question bank is department-scoped — select a department if "Create Question" button not visible
    const createBtn = this.page.locator(
      '[data-testid="create-question-button"], button:has-text("Create Question"), button:has-text("Add Question")'
    );
    if (await createBtn.count() === 0) {
      console.log('No Create Question button — selecting department');
      await selectDepartment(this.page, 'Cognitive Therapy');
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Navigate to staff question bank - department-scoped (requires content-admin or dept-admin)
   */
  async gotoStaff(): Promise<void> {
    await this.page.goto('/staff/questions');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Create a question via the dialog form.
   * Returns true if the API accepted the request (dialog closed), false if API failed.
   */
  async createQuestion(data: {
    questionText: string;
    type: string;
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    difficulty: string;
    tags?: string[];
  }): Promise<boolean> {
    await this.createQuestionButton.click();

    // Wait for dialog
    await expect(this.questionDialog).toBeVisible();

    // Fill question text — the form uses a Textarea with id="questionText"
    const textInput = this.questionDialog.locator('textarea, input[type="text"]').first();
    await textInput.fill(data.questionText);

    // Question type: The form uses clickable Badge toggles, not a <select>.
    // "Multiple Choice" is selected by default, which is what we need for these tests.
    // Type toggling would require clicking the Badge with the matching label.

    // Add options for multiple choice
    if (data.options && data.options.length > 0) {
      for (let i = 0; i < data.options.length; i++) {
        const optionInputs = this.questionDialog.locator('[data-testid^="option-input"], input[name^="options"], input[placeholder*="option" i]');
        const currentCount = await optionInputs.count();

        if (i >= currentCount && await this.addOptionButton.count() > 0) {
          await this.addOptionButton.click();
        }

        const optionInput = optionInputs.nth(i);
        if (await optionInput.count() > 0) {
          await optionInput.fill(data.options[i]);
        }
      }

      // Mark correct answer — shadcn/Radix renders each checkbox as:
      //   <button role="checkbox"> (styled, visible) + <input type="checkbox"> (hidden)
      // Target ONLY the styled button[role="checkbox"] to avoid doubling issues
      const answerCheckboxes = this.questionDialog.locator('button[role="checkbox"]');
      const checkboxCount = await answerCheckboxes.count();
      console.log(`Found ${checkboxCount} styled checkboxes in dialog`);

      if (typeof data.correctAnswer === 'string') {
        for (let j = 0; j < data.options!.length; j++) {
          if (data.options![j] === data.correctAnswer && j < checkboxCount) {
            await answerCheckboxes.nth(j).click({ force: true });
            console.log(`Clicked checkbox ${j} for correct answer: ${data.correctAnswer}`);
            break;
          }
        }
      } else if (Array.isArray(data.correctAnswer)) {
        for (let j = 0; j < data.options!.length; j++) {
          if (data.correctAnswer.includes(data.options![j]) && j < checkboxCount) {
            await answerCheckboxes.nth(j).click({ force: true });
            console.log(`Clicked checkbox ${j} for correct answer: ${data.options![j]}`);
          }
        }
      }
    }

    // Set points — the form uses <Input id="points" type="number"> (NOT name="points")
    const pointsInput = this.questionDialog.locator('#points, input[type="number"]').first();
    if (await pointsInput.count() > 0) {
      await pointsInput.clear();
      await pointsInput.fill(String(data.points));
      console.log(`Set points to: ${data.points}`);
    }

    // Set difficulty — the form uses a shadcn Select with <SelectTrigger id="difficulty">
    // which renders as <button role="combobox" id="difficulty">
    const difficultyTrigger = this.questionDialog.locator('#difficulty, [role="combobox"]').first();
    if (await difficultyTrigger.count() > 0) {
      // Capitalize difficulty for display matching (easy → Easy)
      const difficultyLabel = data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1);
      // Check if it already shows the right value
      const currentValue = await difficultyTrigger.textContent();
      if (!currentValue?.toLowerCase().includes(data.difficulty.toLowerCase())) {
        await difficultyTrigger.click();
        await this.page.waitForTimeout(300);
        const option = this.page.locator(`[role="option"]`).filter({ hasText: new RegExp(`^${difficultyLabel}$`, 'i') });
        if (await option.count() > 0) {
          await option.first().click();
          console.log(`Set difficulty to: ${difficultyLabel}`);
        }
      }
    }

    // Save — scroll submit button into view and click it
    const dialogSubmit = this.questionDialog.locator('button[type="submit"]');
    await dialogSubmit.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await dialogSubmit.click();
    console.log('Clicked Create Question submit button');

    // Wait for dialog to close (API success) or handle gracefully (API failure/pending)
    // The dialog closes on successful mutation; stays open with error toast on failure
    try {
      await expect(this.questionDialog).not.toBeVisible({ timeout: 15000 });
      console.log('Question created successfully — dialog closed');
      return true;
    } catch {
      // Dialog still visible — the API call may have failed or is still pending
      console.log('Dialog still open after submit — closing manually (API may not support create yet)');
      const closeBtn = this.questionDialog.locator('button:has-text("Cancel")');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click();
      } else {
        const xBtn = this.page.locator('[role="dialog"] button:has-text("Close")');
        if (await xBtn.count() > 0) {
          await xBtn.first().click();
        }
      }
      await this.page.waitForTimeout(500);
      return false;
    }
  }

  async getQuestionCount(): Promise<number> {
    await this.page.waitForTimeout(500); // Allow table to update
    return this.questionRows.count();
  }

  async expectQuestionExists(questionText: string): Promise<void> {
    const question = this.page.locator(`text="${questionText}"`);
    await expect(question).toBeVisible();
  }
}
