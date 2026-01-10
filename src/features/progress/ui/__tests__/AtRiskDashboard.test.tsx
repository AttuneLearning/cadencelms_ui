/**
 * Tests for AtRiskDashboard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtRiskDashboard } from '../AtRiskDashboard';

const mockAtRiskStudents = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    progress: 15,
    lastActivity: '2024-01-01T00:00:00Z',
    avgScore: 55,
    riskFactors: ['Low scores', 'Inactive for 8 days'],
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    progress: 5,
    lastActivity: '2023-12-25T00:00:00Z',
    avgScore: 45,
    riskFactors: ['No activity for 15 days', 'Behind schedule', 'Low scores'],
  },
];

describe('AtRiskDashboard', () => {
  describe('Rendering', () => {
    it('should render dashboard title', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      expect(screen.getByText(/at-risk students/i)).toBeInTheDocument();
    });

    it('should display all at-risk students', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show empty state when no at-risk students', () => {
      render(<AtRiskDashboard students={[]} />);

      expect(screen.getByText(/no at-risk students/i)).toBeInTheDocument();
    });

    it('should display student progress percentages', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });
  });

  describe('Risk Factors', () => {
    it('should display risk factors for each student', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      expect(screen.getAllByText(/low scores/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/inactive for 8 days/i)).toBeInTheDocument();
      expect(screen.getByText(/behind schedule/i)).toBeInTheDocument();
    });

    it('should show multiple risk factors', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      const janeCard = screen.getByText('Jane Smith').closest('[role="article"]');
      expect(janeCard).toBeInTheDocument();

      // Jane has 3 risk factors
      const riskFactors = screen.getAllByText(/no activity|behind schedule|low scores/i);
      expect(riskFactors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Quick Actions', () => {
    it('should display action buttons for each student', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons).toHaveLength(2);

      const contactButtons = screen.getAllByRole('button', { name: /contact/i });
      expect(contactButtons).toHaveLength(2);
    });

    it('should call onViewStudent when view button is clicked', async () => {
      const user = userEvent.setup();
      const onViewStudent = vi.fn();

      render(<AtRiskDashboard students={mockAtRiskStudents} onViewStudent={onViewStudent} />);

      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      await user.click(viewButtons[0]);

      expect(onViewStudent).toHaveBeenCalledWith('1');
    });

    it('should call onContactStudent when contact button is clicked', async () => {
      const user = userEvent.setup();
      const onContactStudent = vi.fn();

      render(
        <AtRiskDashboard students={mockAtRiskStudents} onContactStudent={onContactStudent} />
      );

      const contactButtons = screen.getAllByRole('button', { name: /contact/i });
      await user.click(contactButtons[0]);

      expect(onContactStudent).toHaveBeenCalledWith('1');
    });
  });

  describe('Priority Sorting', () => {
    it('should display students in priority order', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      const studentNames = screen.getAllByRole('heading', { level: 4 });

      // Jane Smith has more risk factors and should appear first
      expect(studentNames[0]).toHaveTextContent('Jane Smith');
      expect(studentNames[1]).toHaveTextContent('John Doe');
    });
  });

  describe('Visual Indicators', () => {
    it('should show warning badges for at-risk students', () => {
      const { container } = render(<AtRiskDashboard students={mockAtRiskStudents} />);

      const badges = container.querySelectorAll('[class*="badge"]');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should use different colors for severity levels', () => {
      render(<AtRiskDashboard students={mockAtRiskStudents} />);

      // Student with 3 risk factors should have higher severity indication
      const janeCard = screen.getByText('Jane Smith').closest('[role="article"]');
      expect(janeCard).toHaveClass(expect.stringContaining('border'));
    });
  });
});
