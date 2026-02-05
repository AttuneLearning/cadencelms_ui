/**
 * Question Bank Page Object
 * 
 * Encapsulates interactions with the question bank management page
 */

import { Page, Locator, expect } from '@playwright/test';

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
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin/questions');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Navigate to staff question bank - department-scoped (requires content-admin or dept-admin)
   */
  async gotoStaff(): Promise<void> {
    await this.page.goto('/staff/questions');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  async createQuestion(data: {
    questionText: string;
    type: string;
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    difficulty: string;
    tags?: string[];
  }): Promise<void> {
    await this.createQuestionButton.click();
    
    // Wait for dialog
    await expect(this.questionDialog).toBeVisible();
    
    // Fill question text
    const textInput = this.questionDialog.locator('textarea, input[type="text"]').first();
    await textInput.fill(data.questionText);
    
    // Select question type
    const typeSelect = this.questionDialog.locator('[name="questionType"], [name="type"], select').first();
    if (await typeSelect.count() > 0) {
      const trigger = typeSelect.locator('button, [role="combobox"]');
      if (await trigger.count() > 0) {
        await trigger.click();
        const option = this.page.locator(`[role="option"]:has-text("${data.type}"), [role="listbox"] *:has-text("${data.type}")`);
        await option.first().click();
      }
    }
    
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
      
      // Mark correct answer
      if (typeof data.correctAnswer === 'string') {
        const correctRadio = this.questionDialog.locator(`input[type="radio"][value="${data.correctAnswer}"], label:has-text("${data.correctAnswer}") input`);
        if (await correctRadio.count() > 0) {
          await correctRadio.first().click();
        }
      }
    }
    
    // Set points
    const pointsInput = this.questionDialog.locator('input[name="points"], [data-testid="points-input"]');
    if (await pointsInput.count() > 0) {
      await pointsInput.fill(String(data.points));
    }
    
    // Set difficulty
    const difficultySelect = this.questionDialog.locator('[name="difficulty"]');
    if (await difficultySelect.count() > 0) {
      const trigger = difficultySelect.locator('button, [role="combobox"]');
      if (await trigger.count() > 0) {
        await trigger.click();
        const option = this.page.locator(`[role="option"]:has-text("${data.difficulty}"), [role="listbox"] *:has-text("${data.difficulty}")`);
        await option.first().click();
      }
    }
    
    // Save
    await this.saveQuestionButton.click();
    
    // Wait for dialog to close
    await expect(this.questionDialog).not.toBeVisible({ timeout: 10000 });
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
