/**
 * Login Page Object
 * 
 * Encapsulates interactions with the login page
 */

import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"], input[type="email"], input[name="email"]');
    this.passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]');
    this.loginButton = page.locator('[data-testid="login-button"], button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="login-error"], [role="alert"], .error-message');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password"], a:has-text("Forgot")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectSuccessfulLogin(expectedUrl: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: 10000 });
  }
}
