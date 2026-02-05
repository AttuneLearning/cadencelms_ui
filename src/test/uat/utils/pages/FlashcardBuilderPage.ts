/**
 * Flashcard Builder Page Object
 *
 * Encapsulates interactions with the flashcard set creation and management pages.
 * Supports both static (fixed cards) and dynamic (random selection) flashcard sets.
 */

import { Page, Locator, expect } from '@playwright/test';

export interface FlashcardData {
  front: string;
  back: string;
  hint?: string;
}

export interface StaticFlashcardSetData {
  title: string;
  description: string;
  cards: FlashcardData[];
  shuffleCards?: boolean;
  masteryThreshold?: number;
}

export interface DynamicFlashcardSetData {
  title: string;
  description: string;
  questionBankId: string;
  cardCount: number;
  selectionCriteria?: {
    difficulty?: string;
    tags?: string[];
  };
  shuffleCards?: boolean;
  masteryThreshold?: number;
}

export class FlashcardBuilderPage {
  readonly page: Page;

  // Page header
  readonly pageTitle: Locator;
  readonly createButton: Locator;

  // Flashcard set list
  readonly flashcardSetTable: Locator;
  readonly flashcardSetRows: Locator;

  // Create/Edit dialog
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly typeSelect: Locator;

  // Static flashcard controls
  readonly addCardButton: Locator;
  readonly cardList: Locator;

  // Dynamic flashcard controls
  readonly questionBankSelect: Locator;
  readonly cardCountInput: Locator;
  readonly difficultyFilter: Locator;
  readonly tagsFilter: Locator;

  // Common controls
  readonly shuffleCardsToggle: Locator;
  readonly masteryThresholdInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page header
    this.pageTitle = page.locator('h1:has-text("Flashcard"), [data-testid="page-header"]');
    this.createButton = page.locator(
      '[data-testid="create-flashcard-set-button"], ' +
      'button:has-text("Create Flashcard"), ' +
      'button:has-text("New Flashcard Set")'
    );

    // Flashcard set list
    this.flashcardSetTable = page.locator('[data-testid="flashcard-set-table"], table, [role="table"]');
    this.flashcardSetRows = page.locator(
      '[data-testid^="flashcard-set-row"], tbody tr, [role="row"]:not([role="columnheader"])'
    );

    // Create/Edit dialog
    this.dialog = page.locator('[data-testid="flashcard-set-dialog"], [role="dialog"]');
    this.titleInput = page.locator(
      '[data-testid="flashcard-title-input"], input[name="title"], input[placeholder*="title" i]'
    );
    this.descriptionInput = page.locator(
      '[data-testid="flashcard-description-input"], textarea[name="description"]'
    );
    this.typeSelect = page.locator('[data-testid="flashcard-type-select"], [name="type"]');

    // Static flashcard controls
    this.addCardButton = page.locator(
      '[data-testid="add-card-button"], button:has-text("Add Card"), button:has-text("+ Card")'
    );
    this.cardList = page.locator('[data-testid="card-list"], [data-testid="flashcard-cards"]');

    // Dynamic flashcard controls
    this.questionBankSelect = page.locator('[data-testid="question-bank-select"], [name="questionBankId"]');
    this.cardCountInput = page.locator('[data-testid="card-count-input"], input[name="cardCount"]');
    this.difficultyFilter = page.locator('[data-testid="difficulty-filter"], [name="difficulty"]');
    this.tagsFilter = page.locator('[data-testid="tags-filter"], [name="tags"]');

    // Common controls
    this.shuffleCardsToggle = page.locator(
      '[data-testid="shuffle-cards-toggle"], input[name="shuffleCards"], [role="switch"][name="shuffleCards"]'
    );
    this.masteryThresholdInput = page.locator(
      '[data-testid="mastery-threshold-input"], input[name="masteryThreshold"]'
    );
    this.saveButton = page.locator(
      '[data-testid="save-flashcard-set-button"], button[type="submit"], button:has-text("Save"), button:has-text("Create")'
    );
    this.cancelButton = page.locator('[data-testid="cancel-button"], button:has-text("Cancel")');
  }

  /**
   * Navigate to flashcard builder page
   */
  async goto(moduleId?: string, courseId?: string): Promise<void> {
    if (moduleId) {
      await this.page.goto(`/staff/modules/${moduleId}/flashcards`);
    } else if (courseId) {
      await this.page.goto(`/staff/courses/${courseId}/flashcards`);
    } else {
      // Default to the standalone flashcard builder
      await this.page.goto('/staff/flashcards');
    }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Create a static flashcard set with fixed cards
   */
  async createStaticFlashcardSet(data: StaticFlashcardSetData): Promise<void> {
    await this.createButton.click();
    await expect(this.dialog).toBeVisible();

    // Fill basic details
    await this.titleInput.fill(data.title);
    if (await this.descriptionInput.count() > 0) {
      await this.descriptionInput.fill(data.description);
    }

    // Select static type
    const typeButton = this.dialog.locator('button:has-text("Static"), [data-value="static"]');
    if (await typeButton.count() > 0) {
      await typeButton.click();
    }

    // Add cards
    for (let i = 0; i < data.cards.length; i++) {
      const card = data.cards[i];

      // Click add card if not the first one
      if (i > 0) {
        await this.addCardButton.click();
        await this.page.waitForTimeout(300);
      }

      // Fill card data
      const frontInput = this.dialog.locator(
        `[data-testid="card-${i}-front"], input[name="cards.${i}.front"], .card-item:nth-child(${i + 1}) input[name*="front"]`
      ).first();
      const backInput = this.dialog.locator(
        `[data-testid="card-${i}-back"], input[name="cards.${i}.back"], textarea[name="cards.${i}.back"], .card-item:nth-child(${i + 1}) *[name*="back"]`
      ).first();

      if (await frontInput.count() > 0) {
        await frontInput.fill(card.front);
      }
      if (await backInput.count() > 0) {
        await backInput.fill(card.back);
      }

      // Add hint if provided
      if (card.hint) {
        const hintInput = this.dialog.locator(
          `[data-testid="card-${i}-hint"], input[name="cards.${i}.hint"], .card-item:nth-child(${i + 1}) *[name*="hint"]`
        ).first();
        if (await hintInput.count() > 0) {
          await hintInput.fill(card.hint);
        }
      }
    }

    // Configure shuffle
    if (data.shuffleCards !== undefined) {
      const shuffleToggle = this.dialog.locator('[name="shuffleCards"], [data-testid="shuffle-toggle"]');
      if (await shuffleToggle.count() > 0) {
        const isChecked = await shuffleToggle.isChecked().catch(() => false);
        if (isChecked !== data.shuffleCards) {
          await shuffleToggle.click();
        }
      }
    }

    // Configure mastery threshold
    if (data.masteryThreshold !== undefined) {
      const thresholdInput = this.dialog.locator('[name="masteryThreshold"]');
      if (await thresholdInput.count() > 0) {
        await thresholdInput.fill(String(data.masteryThreshold));
      }
    }

    // Save
    await this.saveButton.click();
    await expect(this.dialog).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Create a dynamic flashcard set that randomly selects from a question bank
   */
  async createDynamicFlashcardSet(data: DynamicFlashcardSetData): Promise<void> {
    await this.createButton.click();
    await expect(this.dialog).toBeVisible();

    // Fill basic details
    await this.titleInput.fill(data.title);
    if (await this.descriptionInput.count() > 0) {
      await this.descriptionInput.fill(data.description);
    }

    // Select dynamic type
    const typeButton = this.dialog.locator('button:has-text("Dynamic"), [data-value="dynamic"]');
    if (await typeButton.count() > 0) {
      await typeButton.click();
    }

    // Select question bank
    const bankSelect = this.dialog.locator('[data-testid="question-bank-select"], [name="questionBankId"]');
    if (await bankSelect.count() > 0) {
      const trigger = bankSelect.locator('button, [role="combobox"]');
      if (await trigger.count() > 0) {
        await trigger.click();
        await this.page.waitForTimeout(300);
        const option = this.page.locator(`[role="option"]:has-text("${data.questionBankId}")`);
        if (await option.count() > 0) {
          await option.click();
        }
      }
    }

    // Set card count
    const countInput = this.dialog.locator('[name="cardCount"], [data-testid="card-count-input"]');
    if (await countInput.count() > 0) {
      await countInput.fill(String(data.cardCount));
    }

    // Set selection criteria
    if (data.selectionCriteria) {
      if (data.selectionCriteria.difficulty) {
        const diffSelect = this.dialog.locator('[name="difficulty"]');
        if (await diffSelect.count() > 0) {
          const trigger = diffSelect.locator('button, [role="combobox"]');
          if (await trigger.count() > 0) {
            await trigger.click();
            const option = this.page.locator(`[role="option"]:has-text("${data.selectionCriteria.difficulty}")`);
            await option.click();
          }
        }
      }
    }

    // Configure shuffle
    if (data.shuffleCards !== undefined) {
      const shuffleToggle = this.dialog.locator('[name="shuffleCards"]');
      if (await shuffleToggle.count() > 0) {
        const isChecked = await shuffleToggle.isChecked().catch(() => false);
        if (isChecked !== data.shuffleCards) {
          await shuffleToggle.click();
        }
      }
    }

    // Save
    await this.saveButton.click();
    await expect(this.dialog).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Get count of flashcard sets in the list
   */
  async getFlashcardSetCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return this.flashcardSetRows.count();
  }

  /**
   * Verify a flashcard set exists in the list
   */
  async expectFlashcardSetExists(title: string): Promise<void> {
    const flashcardSet = this.page.locator(`text="${title}"`);
    await expect(flashcardSet).toBeVisible();
  }

  /**
   * Edit an existing flashcard set
   */
  async editFlashcardSet(title: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${title}"), [data-testid^="flashcard-set-row"]:has-text("${title}")`);
    const editButton = row.locator('button:has-text("Edit"), [data-testid="edit-button"]');
    await editButton.click();
    await expect(this.dialog).toBeVisible();
  }

  /**
   * Delete a flashcard set
   */
  async deleteFlashcardSet(title: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${title}"), [data-testid^="flashcard-set-row"]:has-text("${title}")`);
    const deleteButton = row.locator('button:has-text("Delete"), [data-testid="delete-button"]');
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
    await confirmButton.click();
  }
}
