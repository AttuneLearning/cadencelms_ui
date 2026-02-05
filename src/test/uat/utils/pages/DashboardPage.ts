/**
 * Dashboard Page Object
 * 
 * Encapsulates interactions with dashboard pages
 */

import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly courseList: Locator;
  readonly progressWidget: Locator;
  readonly recentActivity: Locator;
  readonly sidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('[data-testid="welcome-message"], h1');
    this.courseList = page.locator('[data-testid="course-list"], [data-testid="enrolled-courses"]');
    this.progressWidget = page.locator('[data-testid="progress-widget"], [data-testid="learning-progress"]');
    this.recentActivity = page.locator('[data-testid="recent-activity"], [data-testid="activity-log"]');
    this.sidebar = page.locator('[data-testid="sidebar"], nav[role="navigation"]');
  }

  async goto(dashboardType: 'learner' | 'staff' | 'admin' = 'learner'): Promise<void> {
    await this.page.goto(`/${dashboardType}/dashboard`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectWelcomeMessage(name: string | RegExp): Promise<void> {
    await expect(this.welcomeMessage).toContainText(name);
  }

  async expectCourseCount(count: number): Promise<void> {
    const courses = this.courseList.locator('[data-testid^="course-card"]');
    await expect(courses).toHaveCount(count);
  }

  async navigateToSection(section: string): Promise<void> {
    await this.sidebar.locator(`a:has-text("${section}")`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectProgressPercentage(percentage: number): Promise<void> {
    await expect(this.progressWidget).toContainText(`${percentage}%`);
  }
}
