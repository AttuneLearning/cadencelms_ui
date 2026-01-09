/**
 * Tests for ProgramCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramCard } from '../ProgramCard';
import {
  mockProgramListItems,
  mockFullProgram,
  createMockProgramListItem,
} from '@/test/mocks/data/programs';

describe('ProgramCard', () => {
  describe('Rendering', () => {
    it('should render with program list item data', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} />);

      expect(screen.getByText(program.name)).toBeInTheDocument();
      expect(screen.getByText(program.code)).toBeInTheDocument();
      expect(screen.getByText(program.description)).toBeInTheDocument();
    });

    it('should render with full program data', () => {
      render(<ProgramCard program={mockFullProgram} />);

      expect(screen.getByText(mockFullProgram.name)).toBeInTheDocument();
      expect(screen.getByText(mockFullProgram.code)).toBeInTheDocument();
      expect(screen.getByText(mockFullProgram.description)).toBeInTheDocument();
    });

    it('should display program name and code', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} />);

      const title = screen.getByText(program.name);
      expect(title).toBeInTheDocument();

      const code = screen.getByText(program.code);
      expect(code).toBeInTheDocument();
    });

    it('should display program description', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} />);

      expect(screen.getByText(program.description)).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const program = createMockProgramListItem({
        description: '',
      });
      const { container } = render(<ProgramCard program={program} />);

      const description = container.querySelector('.line-clamp-2');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display active status badge', () => {
      const program = createMockProgramListItem({ status: 'active' });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should display inactive status badge', () => {
      const program = createMockProgramListItem({ status: 'inactive' });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('inactive')).toBeInTheDocument();
    });

    it('should display archived status badge', () => {
      const program = createMockProgramListItem({ status: 'archived' });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('archived')).toBeInTheDocument();
    });

    it('should display published badge when program is published', () => {
      const program = createMockProgramListItem({ isPublished: true });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('should display draft badge when program is not published', () => {
      const program = createMockProgramListItem({ isPublished: false });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Credential Badge', () => {
    it('should display certificate credential', () => {
      const program = createMockProgramListItem({ credential: 'certificate' });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('certificate')).toBeInTheDocument();
    });

    it('should display diploma credential', () => {
      const program = createMockProgramListItem({ credential: 'diploma' });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('diploma')).toBeInTheDocument();
    });

    it('should display degree credential', () => {
      const program = createMockProgramListItem({ credential: 'degree' });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('degree')).toBeInTheDocument();
    });
  });

  describe('Department Information', () => {
    it('should display department name', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} />);

      expect(screen.getByText(program.department.name)).toBeInTheDocument();
    });

    it('should display department icon', () => {
      const program = mockProgramListItems[0];
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Duration Information', () => {
    it('should display duration in months', () => {
      const program = createMockProgramListItem({
        duration: 6,
        durationUnit: 'months',
      });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('6 months')).toBeInTheDocument();
    });

    it('should display duration in weeks', () => {
      const program = createMockProgramListItem({
        duration: 8,
        durationUnit: 'weeks',
      });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('8 weeks')).toBeInTheDocument();
    });

    it('should display duration in years', () => {
      const program = createMockProgramListItem({
        duration: 3,
        durationUnit: 'years',
      });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('3 years')).toBeInTheDocument();
    });

    it('should display duration in hours', () => {
      const program = createMockProgramListItem({
        duration: 120,
        durationUnit: 'hours',
      });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('120 hours')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display total levels for list item', () => {
      const program = createMockProgramListItem({ totalLevels: 5 });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Levels')).toBeInTheDocument();
    });

    it('should display total courses for list item', () => {
      const program = createMockProgramListItem({ totalCourses: 15 });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('should display active enrollments for list item', () => {
      const program = createMockProgramListItem({ activeEnrollments: 42 });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });

    it('should display statistics from full program', () => {
      render(<ProgramCard program={mockFullProgram} />);

      expect(
        screen.getByText(mockFullProgram.statistics.totalLevels.toString())
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockFullProgram.statistics.totalCourses.toString())
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockFullProgram.statistics.activeEnrollments.toString())
      ).toBeInTheDocument();
    });

    it('should display completion rate for full program', () => {
      render(<ProgramCard program={mockFullProgram} />);

      const completionRate = Math.round(
        mockFullProgram.statistics.completionRate * 100
      );
      expect(screen.getByText(`${completionRate}%`)).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    });

    it('should not display completion rate for list item', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} />);

      expect(screen.queryByText('Completion Rate')).not.toBeInTheDocument();
    });
  });

  describe('Metadata Display', () => {
    it('should display metadata by default', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} showMetadata={true} />);

      expect(screen.getByText(program.department.name)).toBeInTheDocument();
      expect(screen.getByText('Levels')).toBeInTheDocument();
    });

    it('should hide metadata when showMetadata is false', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} showMetadata={false} />);

      expect(screen.queryByText(program.department.name)).not.toBeInTheDocument();
      expect(screen.queryByText('Levels')).not.toBeInTheDocument();
    });

    it('should display created date', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} />);

      const createdDate = new Date(program.createdAt).toLocaleDateString();
      expect(screen.getByText(`Created ${createdDate}`)).toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const program = mockProgramListItems[0];

      render(<ProgramCard program={program} onClick={onClick} />);

      const card = screen.getByText(program.name).closest('div[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();

      await user.click(card!);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when onClick is not provided', () => {
      const program = mockProgramListItems[0];
      const { container } = render(<ProgramCard program={program} />);

      const clickableCard = container.querySelector('[class*="cursor-pointer"]');
      expect(clickableCard).not.toBeInTheDocument();
    });

    it('should have hover styles when clickable', () => {
      const program = mockProgramListItems[0];
      render(<ProgramCard program={program} onClick={() => {}} />);

      const card = screen.getByText(program.name).closest('div[class*="cursor-pointer"]');
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:bg-accent');
    });
  });

  describe('Icons Display', () => {
    it('should display book icon for program name', () => {
      const program = mockProgramListItems[0];
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display building icon for department', () => {
      const program = mockProgramListItems[0];
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display award icon for credential', () => {
      const program = mockProgramListItems[0];
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display clock icon for duration', () => {
      const program = mockProgramListItems[0];
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display calendar icon for creation date', () => {
      const program = mockProgramListItems[0];
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display eye icon for published badge', () => {
      const program = createMockProgramListItem({ isPublished: true });
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display eye-off icon for draft badge', () => {
      const program = createMockProgramListItem({ isPublished: false });
      const { container } = render(<ProgramCard program={program} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle program with zero enrollments', () => {
      const program = createMockProgramListItem({
        activeEnrollments: 0,
        totalLevels: 1,
        totalCourses: 1,
      });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('Enrolled')).toBeInTheDocument();
      const stats = screen.getAllByText('0');
      expect(stats.length).toBeGreaterThan(0);
    });

    it('should handle program with zero levels', () => {
      const program = createMockProgramListItem({
        totalLevels: 0,
        totalCourses: 1,
        activeEnrollments: 1,
      });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('Levels')).toBeInTheDocument();
      const stats = screen.getAllByText('0');
      expect(stats.length).toBeGreaterThan(0);
    });

    it('should handle program with zero courses', () => {
      const program = createMockProgramListItem({
        totalCourses: 0,
        totalLevels: 1,
        activeEnrollments: 1,
      });
      render(<ProgramCard program={program} />);

      expect(screen.getByText('Courses')).toBeInTheDocument();
      const stats = screen.getAllByText('0');
      expect(stats.length).toBeGreaterThan(0);
    });

    it('should handle very long program name', () => {
      const longName = 'A'.repeat(200);
      const program = createMockProgramListItem({ name: longName });
      const { container } = render(<ProgramCard program={program} />);

      const title = container.querySelector('.truncate');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(longName);
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      const program = createMockProgramListItem({ description: longDescription });
      const { container } = render(<ProgramCard program={program} />);

      const description = container.querySelector('.line-clamp-2');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(longDescription);
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with list item', () => {
      const { container } = render(
        <ProgramCard program={mockProgramListItems[0]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with full program', () => {
      const { container } = render(<ProgramCard program={mockFullProgram} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with onClick handler', () => {
      const { container } = render(
        <ProgramCard program={mockProgramListItems[0]} onClick={() => {}} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without metadata', () => {
      const { container } = render(
        <ProgramCard program={mockProgramListItems[0]} showMetadata={false} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
