/**
 * Tests for Staff Dashboard Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StaffDashboardPage } from '../StaffDashboardPage';

// Mock analytics widgets to avoid chart rendering issues in tests
vi.mock('@/widgets/analytics', () => ({
  StatCard: ({ title, value, description }: any) => (
    <div data-testid={`stat-card-${title}`}>
      <span>{title}</span>
      <span>{value}</span>
      <span>{description}</span>
    </div>
  ),
  LineChart: ({ title }: any) => <div data-testid="line-chart">{title}</div>,
  ProgressTable: ({ title }: any) => (
    <div data-testid="progress-table">{title}</div>
  ),
}));

vi.mock('@/features/quick-actions', () => ({
  QuickActionsCard: ({ title }: any) => (
    <div data-testid="quick-actions">{title}</div>
  ),
}));

describe('StaffDashboardPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <StaffDashboardPage />
      </MemoryRouter>
    );

  it('should render page title and description', () => {
    renderPage();

    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Monitor student progress and course performance')
    ).toBeInTheDocument();
  });

  it('should render stat cards', () => {
    renderPage();

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('Avg. Completion')).toBeInTheDocument();
    expect(screen.getByText('Certificates Issued')).toBeInTheDocument();
  });

  it('should display stat values from mock data', () => {
    renderPage();

    expect(screen.getByText('1247')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('68%')).toBeInTheDocument();
    expect(screen.getByText('856')).toBeInTheDocument();
  });

  it('should render line chart with enrollment trends', () => {
    renderPage();

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Enrollment Trends')).toBeInTheDocument();
  });

  it('should render quick actions card', () => {
    renderPage();

    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    expect(screen.getByText('Your Tasks')).toBeInTheDocument();
  });

  it('should render progress table with recent enrollments', () => {
    renderPage();

    expect(screen.getByTestId('progress-table')).toBeInTheDocument();
    expect(screen.getByText('Recent Enrollments')).toBeInTheDocument();
  });

  it('should render top performing courses section', () => {
    renderPage();

    expect(screen.getByText('Top Performing Courses')).toBeInTheDocument();
    expect(screen.getByText('Web Development Basics')).toBeInTheDocument();
    expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design Principles')).toBeInTheDocument();
    expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    renderPage();

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/staff/analytics');
    expect(hrefs).toContain('/staff/students');
  });
});
