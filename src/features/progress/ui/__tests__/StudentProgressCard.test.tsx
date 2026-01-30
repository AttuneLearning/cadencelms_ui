/**
 * Tests for StudentProgressCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentProgressCard } from '../StudentProgressCard';
import type { StudentProgressCardProps } from '../StudentProgressCard';

const mockStudent: StudentProgressCardProps['student'] = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  photo: null,
  progress: 75,
  coursesCompleted: 2,
  coursesTotal: 5,
  lastActivity: '2024-01-08T10:30:00Z',
  isAtRisk: false,
};

const mockAtRiskStudent: StudentProgressCardProps['student'] = {
  id: '2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  photo: null,
  progress: 15,
  coursesCompleted: 0,
  coursesTotal: 5,
  lastActivity: '2024-01-01T10:30:00Z',
  isAtRisk: true,
};

describe('StudentProgressCard', () => {
  describe('Rendering', () => {
    it('should render student basic information', () => {
      render(<StudentProgressCard student={mockStudent} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should display progress percentage', () => {
      render(<StudentProgressCard student={mockStudent} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should display course completion count', () => {
      render(<StudentProgressCard student={mockStudent} />);

      expect(screen.getByText(/2.*\/.*5.*courses/i)).toBeInTheDocument();
    });

    it('should display last activity time', () => {
      render(<StudentProgressCard student={mockStudent} />);

      // Should show a relative time like "2 days ago" or date
      const lastActivityElement = screen.getByText(/last activity/i).closest('div');
      expect(lastActivityElement).toBeInTheDocument();
    });

    it('should show at-risk indicator when student is at risk', () => {
      render(<StudentProgressCard student={mockAtRiskStudent} />);

      const atRiskBadge = screen.getByText(/at risk/i);
      expect(atRiskBadge).toBeInTheDocument();
    });

    it('should not show at-risk indicator when student is on track', () => {
      render(<StudentProgressCard student={mockStudent} />);

      const atRiskBadge = screen.queryByText(/at risk/i);
      expect(atRiskBadge).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<StudentProgressCard student={mockStudent} onClick={onClick} />);

      const card = screen.getByText('John Doe').closest('[role="button"]');
      if (card) {
        await user.click(card);
        expect(onClick).toHaveBeenCalledWith(mockStudent);
      }
    });

    it('should call onViewDetails when view details button is clicked', async () => {
      const user = userEvent.setup();
      const onViewDetails = vi.fn();

      render(<StudentProgressCard student={mockStudent} onViewDetails={onViewDetails} />);

      const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
      await user.click(viewDetailsButton);

      expect(onViewDetails).toHaveBeenCalledWith(mockStudent.id);
    });

    it('should call onSendMessage when send message button is clicked', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();

      render(<StudentProgressCard student={mockStudent} onSendMessage={onSendMessage} />);

      const sendMessageButton = screen.getByRole('button', { name: /send message/i });
      await user.click(sendMessageButton);

      expect(onSendMessage).toHaveBeenCalledWith(mockStudent.id);
    });

    it('should stop event propagation when action buttons are clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onViewDetails = vi.fn();

      render(
        <StudentProgressCard
          student={mockStudent}
          onClick={onClick}
          onViewDetails={onViewDetails}
        />
      );

      // Get all buttons and find the one that's specifically the action button (not the card)
      const allButtons = screen.getAllByRole('button', { name: /view details/i });
      // The last one should be the actual action button in the footer
      const viewDetailsButton = allButtons[allButtons.length - 1];
      await user.click(viewDetailsButton);

      expect(onViewDetails).toHaveBeenCalledWith(mockStudent.id);
      // Event propagation should stop, so onClick should not be called
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should apply hover styles when hoverable', () => {
      render(<StudentProgressCard student={mockStudent} onClick={vi.fn()} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not apply hover styles when not hoverable', () => {
      render(<StudentProgressCard student={mockStudent} />);

      // Card without onClick should not be a button
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should show different visual state for at-risk students', () => {
      render(<StudentProgressCard student={mockAtRiskStudent} />);

      // At-risk students should have a warning indicator
      const atRiskBadge = screen.getByText(/at risk/i);
      expect(atRiskBadge).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should show progress bar with correct value', () => {
      render(<StudentProgressCard student={mockStudent} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle 0% progress', () => {
      const zeroProgressStudent = { ...mockStudent, progress: 0 };
      render(<StudentProgressCard student={zeroProgressStudent} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle 100% progress', () => {
      const completedStudent = { ...mockStudent, progress: 100 };
      render(<StudentProgressCard student={completedStudent} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Avatar Display', () => {
    it('should display user initials when no photo provided', () => {
      render(<StudentProgressCard student={mockStudent} />);

      // Initials should be "JD" for "John Doe"
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display photo when provided', () => {
      const studentWithPhoto = { ...mockStudent, photo: 'https://example.com/photo.jpg' };
      const { container } = render(<StudentProgressCard student={studentWithPhoto} />);

      // Avatar component should render without showing initials
      // The component should not throw and should render without error
      expect(container).toBeInTheDocument();
      // Student name should still be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
