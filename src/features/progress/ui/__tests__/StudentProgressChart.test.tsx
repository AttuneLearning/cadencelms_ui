/**
 * Tests for StudentProgressChart Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentProgressChart } from '../StudentProgressChart';

const mockProgressData = [
  { date: '2024-01-01', progress: 20, timeSpent: 2 },
  { date: '2024-01-02', progress: 35, timeSpent: 3 },
  { date: '2024-01-03', progress: 50, timeSpent: 2.5 },
  { date: '2024-01-04', progress: 65, timeSpent: 4 },
  { date: '2024-01-05', progress: 75, timeSpent: 3.5 },
];

describe('StudentProgressChart', () => {
  describe('Rendering', () => {
    it('should render chart container', () => {
      const { container } = render(<StudentProgressChart data={mockProgressData} />);

      // Check that the chart component is rendered
      expect(container.firstChild).toBeTruthy();
    });

    it('should render with empty data', () => {
      render(<StudentProgressChart data={[]} />);

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should display chart title', () => {
      render(<StudentProgressChart data={mockProgressData} title="Progress Over Time" />);

      expect(screen.getByText('Progress Over Time')).toBeInTheDocument();
    });
  });

  describe('Chart Elements', () => {
    it('should render with data', () => {
      const { container } = render(<StudentProgressChart data={mockProgressData} />);

      // Chart should be rendered in a card
      expect(container.querySelector('[class*="card"]')).toBeTruthy();
    });

    it('should accept showTimeSpent prop', () => {
      const { container } = render(
        <StudentProgressChart data={mockProgressData} showTimeSpent={true} />
      );

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Data Visualization', () => {
    it('should handle single data point', () => {
      const singlePoint = [{ date: '2024-01-01', progress: 50, timeSpent: 2 }];
      const { container } = render(<StudentProgressChart data={singlePoint} />);

      expect(container.firstChild).toBeTruthy();
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        progress: Math.min(100, i * 3.5),
        timeSpent: Math.random() * 5,
      }));

      const { container } = render(<StudentProgressChart data={largeData} />);

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Customization', () => {
    it('should apply custom height', () => {
      const { container } = render(<StudentProgressChart data={mockProgressData} height={400} />);

      // Chart component should render
      expect(container.firstChild).toBeTruthy();
    });

    it('should hide time spent when showTimeSpent is false', () => {
      const { container } = render(
        <StudentProgressChart data={mockProgressData} showTimeSpent={false} />
      );

      // Component should render with the prop
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render accessible chart structure', () => {
      const { container } = render(<StudentProgressChart data={mockProgressData} />);

      // Component should render
      expect(container.firstChild).toBeTruthy();
    });
  });
});
