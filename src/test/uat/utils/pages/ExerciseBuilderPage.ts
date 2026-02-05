/**
 * Exercise Builder Page Object
 * 
 * Encapsulates interactions with the quiz/exercise builder page
 */

import { Page, Locator, expect } from '@playwright/test';

export class ExerciseBuilderPage {
  readonly page: Page;
  
  // Tabs
  readonly settingsTab: Locator;
  readonly questionsTab: Locator;
  readonly previewTab: Locator;
  
  // Settings form
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly typeSelect: Locator;
  readonly departmentSelect: Locator;
  readonly timeLimitInput: Locator;
  readonly passingScoreInput: Locator;
  readonly shuffleQuestionsCheckbox: Locator;
  readonly showFeedbackCheckbox: Locator;
  
  // Question management
  readonly addQuestionButton: Locator;
  readonly selectFromBankButton: Locator;
  readonly questionList: Locator;
  readonly questionBankDialog: Locator;
  
  // Actions
  readonly saveButton: Locator;
  readonly backButton: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Tabs
    this.settingsTab = page.locator('[data-testid="settings-tab"], [role="tab"]:has-text("Settings")');
    this.questionsTab = page.locator('[data-testid="questions-tab"], [role="tab"]:has-text("Questions")');
    this.previewTab = page.locator('[data-testid="preview-tab"], [role="tab"]:has-text("Preview")');
    
    // Settings form
    this.titleInput = page.locator('[data-testid="exercise-title-input"], input[name="title"], #title');
    this.descriptionInput = page.locator('[data-testid="exercise-description-input"], textarea[name="description"], #description');
    this.typeSelect = page.locator('[data-testid="exercise-type-select"], [name="type"]');
    this.departmentSelect = page.locator('[data-testid="department-select"], [name="department"]');
    this.timeLimitInput = page.locator('[data-testid="time-limit-input"], input[name="timeLimit"]');
    this.passingScoreInput = page.locator('[data-testid="passing-score-input"], input[name="passingScore"]');
    this.shuffleQuestionsCheckbox = page.locator('[data-testid="shuffle-questions-checkbox"], input[name="shuffleQuestions"], [id="shuffleQuestions"]');
    this.showFeedbackCheckbox = page.locator('[data-testid="show-feedback-checkbox"], input[name="showFeedback"], [id="showFeedback"]');
    
    // Question management
    this.addQuestionButton = page.locator('[data-testid="add-question-button"], button:has-text("Add Question")');
    this.selectFromBankButton = page.locator('[data-testid="select-from-bank-button"], button:has-text("Select from Bank"), button:has-text("Question Bank")');
    this.questionList = page.locator('[data-testid="question-list"], [data-testid="selected-questions"]');
    this.questionBankDialog = page.locator('[data-testid="question-bank-dialog"], [role="dialog"]');
    
    // Actions
    this.saveButton = page.locator('[data-testid="save-exercise-button"], button:has-text("Save")');
    this.backButton = page.locator('[data-testid="back-button"], button:has-text("Back")');
    this.publishButton = page.locator('[data-testid="publish-button"], button:has-text("Publish")');
  }

  async goto(exerciseId?: string, courseId?: string): Promise<void> {
    let url = '/staff/courses/exercises';
    
    if (exerciseId) {
      url = `/staff/courses/exercises/${exerciseId}`;
    } else {
      url = '/staff/courses/exercises/new';
    }
    
    if (courseId) {
      url += `?courseId=${courseId}`;
    }
    
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async fillQuizDetails(data: {
    title: string;
    description?: string;
    type?: string;
    department?: string;
    timeLimit?: number;
    passingScore?: number;
    shuffleQuestions?: boolean;
    showFeedback?: boolean;
  }): Promise<void> {
    // Ensure we're on settings tab
    if (await this.settingsTab.count() > 0) {
      await this.settingsTab.click();
    }
    
    await this.titleInput.fill(data.title);
    
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    
    if (data.type) {
      await this.selectOption(this.typeSelect, data.type);
    }
    
    if (data.department) {
      await this.selectOption(this.departmentSelect, data.department);
    }
    
    if (data.timeLimit !== undefined) {
      await this.timeLimitInput.fill(String(data.timeLimit));
    }
    
    if (data.passingScore !== undefined) {
      await this.passingScoreInput.fill(String(data.passingScore));
    }
    
    if (data.shuffleQuestions !== undefined) {
      const isChecked = await this.shuffleQuestionsCheckbox.isChecked();
      if (isChecked !== data.shuffleQuestions) {
        await this.shuffleQuestionsCheckbox.click();
      }
    }
    
    if (data.showFeedback !== undefined) {
      const isChecked = await this.showFeedbackCheckbox.isChecked();
      if (isChecked !== data.showFeedback) {
        await this.showFeedbackCheckbox.click();
      }
    }
  }

  private async selectOption(locator: Locator, value: string): Promise<void> {
    const trigger = locator.locator('button, [role="combobox"]');
    if (await trigger.count() > 0) {
      await trigger.click();
      const option = this.page.locator(`[role="option"]:has-text("${value}"), [role="listbox"] *:has-text("${value}")`);
      await option.first().click();
    }
  }

  async addQuestionsFromBank(questionTexts: string[]): Promise<void> {
    // Go to questions tab
    if (await this.questionsTab.count() > 0) {
      await this.questionsTab.click();
    }
    
    // Open question bank selector
    if (await this.selectFromBankButton.count() > 0) {
      await this.selectFromBankButton.click();
    } else if (await this.addQuestionButton.count() > 0) {
      await this.addQuestionButton.click();
    }
    
    // Wait for dialog/selector
    await expect(this.questionBankDialog).toBeVisible({ timeout: 5000 });
    
    // Select each question
    for (const questionText of questionTexts) {
      const questionCheckbox = this.questionBankDialog.locator(`tr:has-text("${questionText.substring(0, 30)}") input[type="checkbox"], label:has-text("${questionText.substring(0, 30)}") input`);
      if (await questionCheckbox.count() > 0) {
        await questionCheckbox.first().click();
      }
    }
    
    // Confirm selection
    const confirmButton = this.questionBankDialog.locator('button:has-text("Add"), button:has-text("Select"), button:has-text("Confirm")');
    await confirmButton.click();
    
    // Wait for dialog to close
    await expect(this.questionBankDialog).not.toBeVisible({ timeout: 5000 });
  }

  async getSelectedQuestionCount(): Promise<number> {
    const questions = this.questionList.locator('[data-testid^="selected-question"], > div, li');
    return questions.count();
  }

  async saveExercise(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectSaveSuccess(): Promise<void> {
    const toast = this.page.locator('[role="alert"]:has-text("success"), [role="alert"]:has-text("saved"), [role="alert"]:has-text("created")');
    await expect(toast).toBeVisible({ timeout: 10000 });
  }
}
