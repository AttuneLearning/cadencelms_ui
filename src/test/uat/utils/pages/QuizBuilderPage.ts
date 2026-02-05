/**
 * Quiz Builder Page Object
 *
 * Encapsulates interactions with the quiz creation and management pages.
 * Supports both static (fixed questions) and dynamic (random selection) quizzes.
 */

import { Page, Locator, expect } from '@playwright/test';

export interface StaticQuizData {
  title: string;
  description: string;
  questionIds?: string[];
  questionTexts?: string[]; // Alternative: select by question text
  timeLimit: number;
  passingScore: number;
  shuffleQuestions?: boolean;
  showFeedback?: boolean;
  attemptsAllowed?: number;
}

export interface DynamicQuizData {
  title: string;
  description: string;
  questionBankId?: string;
  questionBankName?: string; // Alternative: select by name
  questionCount: number;
  selectionCriteria?: {
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    tags?: string[];
  };
  timeLimit: number;
  passingScore: number;
  shuffleQuestions?: boolean;
  showFeedback?: boolean;
  attemptsAllowed?: number;
}

export class QuizBuilderPage {
  readonly page: Page;

  // Page header
  readonly pageTitle: Locator;
  readonly createQuizButton: Locator;

  // Quiz list
  readonly quizTable: Locator;
  readonly quizRows: Locator;

  // Create/Edit form
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly quizTypeSelect: Locator;

  // Static quiz controls
  readonly questionSelector: Locator;
  readonly selectedQuestionsList: Locator;
  readonly addQuestionButton: Locator;
  readonly removeQuestionButton: Locator;

  // Dynamic quiz controls
  readonly questionBankSelect: Locator;
  readonly questionCountInput: Locator;
  readonly difficultyFilter: Locator;
  readonly tagsFilter: Locator;

  // Common quiz settings
  readonly timeLimitInput: Locator;
  readonly passingScoreInput: Locator;
  readonly shuffleQuestionsToggle: Locator;
  readonly showFeedbackToggle: Locator;
  readonly attemptsAllowedInput: Locator;

  // Actions
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly previewButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page header
    this.pageTitle = page.locator('h1:has-text("Quiz"), h1:has-text("Assessment"), [data-testid="page-header"]');
    this.createQuizButton = page.locator(
      '[data-testid="create-quiz-button"], ' +
      'button:has-text("Create Quiz"), ' +
      'button:has-text("New Quiz"), ' +
      'button:has-text("Create Assessment")'
    );

    // Quiz list
    this.quizTable = page.locator('[data-testid="quiz-table"], table, [role="table"]');
    this.quizRows = page.locator('[data-testid^="quiz-row"], tbody tr, [role="row"]:not([role="columnheader"])');

    // Create/Edit form
    this.dialog = page.locator('[data-testid="quiz-dialog"], [role="dialog"], form[data-testid="quiz-form"]');
    this.titleInput = page.locator(
      '[data-testid="quiz-title-input"], input[name="title"], input[placeholder*="title" i]'
    );
    this.descriptionInput = page.locator(
      '[data-testid="quiz-description-input"], textarea[name="description"]'
    );
    this.quizTypeSelect = page.locator(
      '[data-testid="quiz-type-select"], [name="quizType"], [name="selectionType"]'
    );

    // Static quiz controls
    this.questionSelector = page.locator(
      '[data-testid="question-selector"], [data-testid="question-picker"]'
    );
    this.selectedQuestionsList = page.locator('[data-testid="selected-questions"], [data-testid="question-list"]');
    this.addQuestionButton = page.locator(
      '[data-testid="add-question-button"], button:has-text("Add Question"), button:has-text("Select Questions")'
    );
    this.removeQuestionButton = page.locator('[data-testid="remove-question-button"]');

    // Dynamic quiz controls
    this.questionBankSelect = page.locator(
      '[data-testid="question-bank-select"], [name="questionBankId"], [name="bankId"]'
    );
    this.questionCountInput = page.locator(
      '[data-testid="question-count-input"], input[name="questionCount"], input[name="count"]'
    );
    this.difficultyFilter = page.locator('[data-testid="difficulty-filter"], [name="difficulty"]');
    this.tagsFilter = page.locator('[data-testid="tags-filter"], [name="tags"]');

    // Common quiz settings
    this.timeLimitInput = page.locator(
      '[data-testid="time-limit-input"], input[name="timeLimit"], input[name="duration"]'
    );
    this.passingScoreInput = page.locator(
      '[data-testid="passing-score-input"], input[name="passingScore"], input[name="passScore"]'
    );
    this.shuffleQuestionsToggle = page.locator(
      '[data-testid="shuffle-questions-toggle"], input[name="shuffleQuestions"], [role="switch"][name="shuffle"]'
    );
    this.showFeedbackToggle = page.locator(
      '[data-testid="show-feedback-toggle"], input[name="showFeedback"], [role="switch"][name="feedback"]'
    );
    this.attemptsAllowedInput = page.locator(
      '[data-testid="attempts-allowed-input"], input[name="attemptsAllowed"], input[name="attempts"]'
    );

    // Actions
    this.saveButton = page.locator(
      '[data-testid="save-quiz-button"], button[type="submit"], button:has-text("Save"), button:has-text("Create")'
    );
    this.cancelButton = page.locator('[data-testid="cancel-button"], button:has-text("Cancel")');
    this.previewButton = page.locator('[data-testid="preview-button"], button:has-text("Preview")');
  }

  /**
   * Navigate to quiz builder page
   */
  async goto(moduleId?: string, courseId?: string): Promise<void> {
    if (moduleId) {
      await this.page.goto(`/staff/modules/${moduleId}/quizzes`);
    } else if (courseId) {
      await this.page.goto(`/staff/courses/${courseId}/quizzes`);
    } else {
      await this.page.goto('/staff/quizzes');
    }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Navigate to exercise/assessment builder (alternative route)
   */
  async gotoExerciseBuilder(courseId?: string): Promise<void> {
    if (courseId) {
      await this.page.goto(`/staff/courses/${courseId}/exercises/new`);
    } else {
      await this.page.goto('/staff/exercises/new');
    }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Create a static quiz with fixed questions
   */
  async createStaticQuiz(data: StaticQuizData): Promise<void> {
    await this.createQuizButton.click();
    await this.page.waitForTimeout(500);

    // Check if dialog appeared or we're on a new page
    const dialogVisible = await this.dialog.isVisible().catch(() => false);

    // Fill basic details
    const titleInput = dialogVisible
      ? this.dialog.locator('input[name="title"], input[placeholder*="title" i]').first()
      : this.titleInput;
    await titleInput.fill(data.title);

    const descInput = dialogVisible
      ? this.dialog.locator('textarea[name="description"]').first()
      : this.descriptionInput;
    if (await descInput.count() > 0) {
      await descInput.fill(data.description);
    }

    // Select static quiz type
    const typeSelector = dialogVisible
      ? this.dialog.locator('[data-testid="quiz-type"], [name="selectionType"], [name="quizType"]')
      : this.quizTypeSelect;
    if (await typeSelector.count() > 0) {
      const trigger = typeSelector.locator('button, [role="combobox"]').first();
      if (await trigger.count() > 0) {
        await trigger.click();
        await this.page.waitForTimeout(300);
        const staticOption = this.page.locator('[role="option"]:has-text("Static"), [role="option"]:has-text("Fixed")');
        if (await staticOption.count() > 0) {
          await staticOption.first().click();
        }
      }
    }

    // Add questions
    if (data.questionTexts && data.questionTexts.length > 0) {
      await this.selectQuestionsByText(data.questionTexts);
    }

    // Set time limit
    const timeLimitInput = dialogVisible
      ? this.dialog.locator('input[name="timeLimit"], input[name="duration"]').first()
      : this.timeLimitInput;
    if (await timeLimitInput.count() > 0) {
      await timeLimitInput.fill(String(data.timeLimit));
    }

    // Set passing score
    const passingScoreInput = dialogVisible
      ? this.dialog.locator('input[name="passingScore"], input[name="passScore"]').first()
      : this.passingScoreInput;
    if (await passingScoreInput.count() > 0) {
      await passingScoreInput.fill(String(data.passingScore));
    }

    // Configure shuffle
    if (data.shuffleQuestions !== undefined) {
      const shuffleToggle = dialogVisible
        ? this.dialog.locator('[name="shuffleQuestions"], [data-testid="shuffle-toggle"]').first()
        : this.shuffleQuestionsToggle;
      if (await shuffleToggle.count() > 0) {
        const isChecked = await shuffleToggle.isChecked().catch(() => false);
        if (isChecked !== data.shuffleQuestions) {
          await shuffleToggle.click();
        }
      }
    }

    // Configure feedback
    if (data.showFeedback !== undefined) {
      const feedbackToggle = dialogVisible
        ? this.dialog.locator('[name="showFeedback"], [data-testid="feedback-toggle"]').first()
        : this.showFeedbackToggle;
      if (await feedbackToggle.count() > 0) {
        const isChecked = await feedbackToggle.isChecked().catch(() => false);
        if (isChecked !== data.showFeedback) {
          await feedbackToggle.click();
        }
      }
    }

    // Set attempts allowed
    if (data.attemptsAllowed !== undefined) {
      const attemptsInput = dialogVisible
        ? this.dialog.locator('input[name="attemptsAllowed"], input[name="attempts"]').first()
        : this.attemptsAllowedInput;
      if (await attemptsInput.count() > 0) {
        await attemptsInput.fill(String(data.attemptsAllowed));
      }
    }

    // Save
    const saveBtn = dialogVisible ? this.dialog.locator('button[type="submit"], button:has-text("Save")').first() : this.saveButton;
    await saveBtn.click();

    // Wait for success
    if (dialogVisible) {
      await expect(this.dialog).not.toBeVisible({ timeout: 10000 });
    } else {
      // Wait for redirect or success message
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Create a dynamic quiz that randomly selects questions
   */
  async createDynamicQuiz(data: DynamicQuizData): Promise<void> {
    await this.createQuizButton.click();
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

    // Select dynamic quiz type
    const typeSelector = dialogVisible
      ? this.dialog.locator('[data-testid="quiz-type"], [name="selectionType"]')
      : this.quizTypeSelect;
    if (await typeSelector.count() > 0) {
      const trigger = typeSelector.locator('button, [role="combobox"]').first();
      if (await trigger.count() > 0) {
        await trigger.click();
        await this.page.waitForTimeout(300);
        const dynamicOption = this.page.locator('[role="option"]:has-text("Dynamic"), [role="option"]:has-text("Random")');
        if (await dynamicOption.count() > 0) {
          await dynamicOption.first().click();
        }
      }
    }

    // Select question bank
    const bankSelect = dialogVisible
      ? this.dialog.locator('[data-testid="question-bank-select"], [name="questionBankId"]')
      : this.questionBankSelect;
    if (await bankSelect.count() > 0) {
      const trigger = bankSelect.locator('button, [role="combobox"]').first();
      if (await trigger.count() > 0) {
        await trigger.click();
        await this.page.waitForTimeout(300);
        const bankName = data.questionBankName || data.questionBankId;
        const option = this.page.locator(`[role="option"]:has-text("${bankName}")`);
        if (await option.count() > 0) {
          await option.first().click();
        }
      }
    }

    // Set question count
    const countInput = dialogVisible
      ? this.dialog.locator('input[name="questionCount"]').first()
      : this.questionCountInput;
    if (await countInput.count() > 0) {
      await countInput.fill(String(data.questionCount));
    }

    // Set selection criteria
    if (data.selectionCriteria?.difficulty) {
      const diffSelect = dialogVisible
        ? this.dialog.locator('[name="difficulty"]')
        : this.difficultyFilter;
      if (await diffSelect.count() > 0) {
        const trigger = diffSelect.locator('button, [role="combobox"]').first();
        if (await trigger.count() > 0) {
          await trigger.click();
          const option = this.page.locator(`[role="option"]:has-text("${data.selectionCriteria.difficulty}")`);
          await option.first().click();
        }
      }
    }

    // Set time limit
    const timeLimitInput = dialogVisible
      ? this.dialog.locator('input[name="timeLimit"]').first()
      : this.timeLimitInput;
    if (await timeLimitInput.count() > 0) {
      await timeLimitInput.fill(String(data.timeLimit));
    }

    // Set passing score
    const passingScoreInput = dialogVisible
      ? this.dialog.locator('input[name="passingScore"]').first()
      : this.passingScoreInput;
    if (await passingScoreInput.count() > 0) {
      await passingScoreInput.fill(String(data.passingScore));
    }

    // Configure shuffle
    if (data.shuffleQuestions !== undefined) {
      const shuffleToggle = dialogVisible
        ? this.dialog.locator('[name="shuffleQuestions"]').first()
        : this.shuffleQuestionsToggle;
      if (await shuffleToggle.count() > 0) {
        const isChecked = await shuffleToggle.isChecked().catch(() => false);
        if (isChecked !== data.shuffleQuestions) {
          await shuffleToggle.click();
        }
      }
    }

    // Save
    const saveBtn = dialogVisible ? this.dialog.locator('button[type="submit"], button:has-text("Save")').first() : this.saveButton;
    await saveBtn.click();

    if (dialogVisible) {
      await expect(this.dialog).not.toBeVisible({ timeout: 10000 });
    }
  }

  /**
   * Select questions by their text for static quiz
   */
  async selectQuestionsByText(questionTexts: string[]): Promise<void> {
    // Open question selector
    const selectorButton = this.page.locator(
      '[data-testid="select-questions-button"], button:has-text("Select Questions"), button:has-text("Add Questions")'
    );
    if (await selectorButton.count() > 0) {
      await selectorButton.click();
      await this.page.waitForTimeout(500);
    }

    // Select each question
    for (const text of questionTexts) {
      const questionRow = this.page.locator(`tr:has-text("${text}"), [data-testid^="question"]:has-text("${text}")`);
      const checkbox = questionRow.locator('input[type="checkbox"], [role="checkbox"]');
      if (await checkbox.count() > 0) {
        await checkbox.click();
      }
    }

    // Confirm selection
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Add Selected"), button:has-text("Done")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
  }

  /**
   * Get count of quizzes in the list
   */
  async getQuizCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return this.quizRows.count();
  }

  /**
   * Verify a quiz exists in the list
   */
  async expectQuizExists(title: string): Promise<void> {
    const quiz = this.page.locator(`text="${title}"`);
    await expect(quiz).toBeVisible();
  }

  /**
   * Edit an existing quiz
   */
  async editQuiz(title: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${title}"), [data-testid^="quiz-row"]:has-text("${title}")`);
    const editButton = row.locator('button:has-text("Edit"), [data-testid="edit-button"]');
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(title: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${title}"), [data-testid^="quiz-row"]:has-text("${title}")`);
    const deleteButton = row.locator('button:has-text("Delete"), [data-testid="delete-button"]');
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
    await confirmButton.click();
  }

  /**
   * Preview a quiz
   */
  async previewQuiz(title: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${title}")`);
    const previewButton = row.locator('button:has-text("Preview"), [data-testid="preview-button"]');
    await previewButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
