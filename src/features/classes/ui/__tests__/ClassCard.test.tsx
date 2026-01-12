/**
 * Tests for ClassCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassCard } from '../ClassCard';
import { mockClasses } from '@/test/mocks/data/classes';

describe('ClassCard', () => {
  const mockOnView = vi.fn();
  const mockOnEnroll = vi.fn();

  it('renders class information in grid mode', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
    expect(screen.getByText(/john smith/i)).toBeInTheDocument();
  });

  it('renders class information in list mode', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="list"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText('Introduction to Programming - Spring 2026')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
  });

  it('displays enrollment count with capacity', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText(/25.*\/.*30/)).toBeInTheDocument();
  });

  it('displays enrollment count without capacity when null', () => {
    const classWithoutCapacity = { ...mockClasses[0], capacity: null };
    render(
      <ClassCard
        classItem={classWithoutCapacity}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText(/25 students/i)).toBeInTheDocument();
  });

  it('displays status badge correctly', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays upcoming status badge', () => {
    render(
      <ClassCard
        classItem={mockClasses[2]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('displays completed status badge', () => {
    render(
      <ClassCard
        classItem={mockClasses[3]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays cancelled status badge', () => {
    render(
      <ClassCard
        classItem={mockClasses[4]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('calls onView when View button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    const viewButton = screen.getByRole('button', { name: /view/i });
    await user.click(viewButton);

    expect(mockOnView).toHaveBeenCalledWith('class-1');
  });

  it('calls onEnroll when Enroll Students button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    const enrollButton = screen.getByRole('button', { name: /enroll students/i });
    await user.click(enrollButton);

    expect(mockOnEnroll).toHaveBeenCalledWith('class-1');
  });

  it('displays instructor names correctly', () => {
    render(
      <ClassCard
        classItem={mockClasses[1]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText(/sarah johnson/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 more/i)).toBeInTheDocument();
  });

  it('displays start and end dates', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    // Dates should be formatted
    expect(screen.getByText(/jan.*20.*2026/i)).toBeInTheDocument();
    expect(screen.getByText(/may.*20.*2026/i)).toBeInTheDocument();
  });

  it('shows full indicator when class is at capacity', () => {
    render(
      <ClassCard
        classItem={mockClasses[5]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText(/full/i)).toBeInTheDocument();
  });

  it('displays program and level information', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText(/computer science/i)).toBeInTheDocument();
    expect(screen.getByText(/level 1/i)).toBeInTheDocument();
  });

  it('displays academic term when available', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByText(/spring 2026/i)).toBeInTheDocument();
  });

  it('renders with different styling in list mode', () => {
    const { container: gridContainer } = render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    const { container: listContainer } = render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="list"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(gridContainer.firstChild).not.toEqual(listContainer.firstChild);
  });

  it('does not show enroll button when onEnroll is not provided', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
      />
    );

    expect(screen.queryByRole('button', { name: /enroll students/i })).not.toBeInTheDocument();
  });

  it('has correct test id', () => {
    render(
      <ClassCard
        classItem={mockClasses[0]}
        viewMode="grid"
        onView={mockOnView}
        onEnroll={mockOnEnroll}
      />
    );

    expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
  });
});
