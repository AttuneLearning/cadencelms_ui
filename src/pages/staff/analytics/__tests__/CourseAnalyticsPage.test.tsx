/**
 * Tests for Course Analytics Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CourseAnalyticsPage } from '../CourseAnalyticsPage';

// Mock analytics widgets
vi.mock('@/widgets/analytics', () => ({
  StatCard: ({ title, value }: any) => (
    <div data-testid={`stat-card-${title}`}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
  LineChart: ({ title }: any) => <div data-testid="line-chart">{title}</div>,
  BarChart: ({ title }: any) => <div data-testid="bar-chart">{title}</div>,
  PieChart: ({ title }: any) => <div data-testid="pie-chart">{title}</div>,
}));

vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/shared/utils/exportUtils', () => ({
  exportAnalyticsReport: vi.fn(),
}));

describe('CourseAnalyticsPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <CourseAnalyticsPage />
      </MemoryRouter>
    );

  it('should render page title and description', () => {
    renderPage();

    expect(screen.getByText('Course Analytics')).toBeInTheDocument();
    expect(
      screen.getByText('Detailed insights and performance metrics')
    ).toBeInTheDocument();
  });

  it('should render export buttons', () => {
    renderPage();

    expect(screen.getByText('Export PDF')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export Excel')).toBeInTheDocument();
  });

  it('should render key metric stat cards', () => {
    renderPage();

    expect(screen.getByTestId('stat-card-Total Enrollments')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-Completion Rate')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-Average Score')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-Avg. Time Spent')).toBeInTheDocument();
  });

  it('should render analytics tabs', () => {
    renderPage();

    expect(screen.getByRole('tab', { name: /enrollments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /completion/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /scores/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /time spent/i })).toBeInTheDocument();
  });

  it('should show enrollment trends chart by default', () => {
    renderPage();

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Enrollment Summary')).toBeInTheDocument();
  });

  it('should render filter controls', () => {
    renderPage();

    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Time Range')).toBeInTheDocument();
  });

  it('should render enrollment summary details in default tab', () => {
    renderPage();

    expect(screen.getByText('Peak Enrollment Times')).toBeInTheDocument();
  });
});
